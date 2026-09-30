import { z } from "zod";

export const WIDTHS = [1200, 800, 600, 400, 200] as const;
export type Value = string | number | boolean;
export type Output = Record<string, Value>;
export const fieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,59}$/),
  label: z.string().min(1).max(120),
  type: z.enum(["boolean", "integer", "string"]),
  description: z.string().min(1).max(300),
  comparison: z.literal("money").optional(),
}).strict();
export const taskSchema = z.object({
  name: z.string().min(1).max(100),
  instruction: z.string().min(1).max(2000),
  fields: z.array(fieldSchema).min(1).max(12),
}).strict().refine(task => new Set(task.fields.map(f => f.key)).size === task.fields.length, "Field keys must be unique.");
export type Task = z.infer<typeof taskSchema>;
export type Run = {
  id: string; width: number | null; at: string; output?: Output;
  raw?: unknown; model?: string; error?: string;
};
export type Invariant = {
  key: string; label: string; value?: Value; values: (Value | undefined)[];
  status: "STABLE" | "UNSTABLE" | "ERROR";
};
export type Evaluation = {
  width: number; status: "PASS" | "PARTIAL" | "DRIFT" | "ERROR" | "UNTESTED";
  comparedFields?: number; totalFields?: number;
  changes: { key: string; label: string; before: Value; after: Value[] }[];
  runs: Run[]; reason?: string;
};
export type Report = {
  mode: "live" | "recorded"; title: string; task: Task; runs: Run[];
  receiptReview?: { currency: string; total: string };
  sourceNote?: string; imageUrl?: string; asset?: { publicId: string; width: number; height: number; bytes: number };
};

export function normalize(value: Value): Value {
  return typeof value === "string" ? value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase() : value;
}

// Monetary values use two fractional digits. Reject ambiguous or malformed separators.
export function money(value: Value | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  let canonical: string;
  if (/^\d+(?:[.,]\d{2})?$/.test(text)) canonical = text.replace(",", ".");
  else if (/^\d{1,3}(?:,\d{3})+(?:\.\d{2})?$/.test(text)) canonical = text.replaceAll(",", "");
  else if (/^\d{1,3}(?:\.\d{3})+(?:,\d{2})?$/.test(text)) canonical = text.replaceAll(".", "").replace(",", ".");
  else return undefined;
  const [whole, fraction = "00"] = canonical.split(".");
  return `${whole.replace(/^0+(?=\d)/, "")}.${fraction}`;
}
function fieldValue(field: Task["fields"][number], value: Value | undefined): Value | undefined {
  return field.comparison === "money" ? money(value) : value === undefined ? undefined : normalize(value);
}
export function receiptRecommendation(report: Report, evaluations: Evaluation[]): Evaluation | undefined {
  const fields = report.task.fields.filter(f => f.comparison === "money");
  if (report.runs.some(r => r.error)) return undefined;
  if (fields.length) {
    const review = report.receiptReview;
    if (!review || !/^[A-Z]{3}$/.test(review.currency) || !money(review.total)) return undefined;
    const originals = baseline(report.task, report.runs);
    if (fields.some(f => !originals.some(b => b.key === f.key && b.status === "STABLE" && b.value === money(review.total)))) return undefined;
  }
  return recommend(evaluations);
}
export function baselineMessage(task: Task, runs: Run[]): string {
  const errors = runs.filter(r => r.width === null && r.error).map(r => r.error!);
  if (errors.length) return /quota|rate limit|429/i.test(errors.join(" "))
    ? "Analysis blocked: provider quota or rate limit reached. Check the allowance or wait for the limit to reset, then start a new test."
    : `Original analysis failed: ${errors[0]} Start a new test after resolving the error.`;
  if (task.fields.some(f => f.comparison === "money") && baseline(task, runs).some(f => f.status === "ERROR"))
    return "No readable, valid receipt total was returned in all three original runs. Review the image and run details before starting a new test.";
  return "Original answers or model versions varied. Review the task and run details, then start a new test. No recommendation is available.";
}

export function parseOutput(text: string, task: Task): Output {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const shape: Record<string, z.ZodType> = {};
  for (const field of task.fields) {
    shape[field.key] = field.type === "boolean" ? z.boolean() : field.type === "integer" ? z.number().int().nonnegative() : z.string().max(2000);
  }
  const parsed = z.object(shape).strict().parse(JSON.parse(cleaned));
  return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, normalize(value as Value)]));
}

export function buildPrompt(task: Task): string {
  const properties = Object.fromEntries(task.fields.map(f => [f.key, {
    type: f.type, description: f.description, ...(f.type === "integer" ? { minimum: 0 } : {}),
  }]));
  return `${task.instruction}\nAnalyze only the visible image. Do not infer hidden content. Return only the JSON object matching this schema.\n\`\`\`json\n${JSON.stringify({ type: "object", properties, required: task.fields.map(f => f.key), additionalProperties: false })}\n\`\`\``;
}

export function baseline(task: Task, runs: Run[]): Invariant[] {
  const originals = runs.filter(r => r.width === null);
  return task.fields.map(field => {
    const values = originals.map(r => fieldValue(field, r.output?.[field.key]));
    const invalid = originals.length !== 3 || originals.some(r => r.error || fieldValue(field, r.output?.[field.key]) === undefined);
    const sameModel = new Set(originals.map(r => r.model ?? "unreported")).size === 1;
    const stable = !invalid && sameModel && values.every(v => normalize(v!) === normalize(values[0]!));
    return { key: field.key, label: field.label, values, value: stable ? normalize(values[0]!) : undefined, status: invalid ? "ERROR" : stable ? "STABLE" : "UNSTABLE" };
  });
}

export function evaluate(task: Task, runs: Run[], width: number): Evaluation {
  const variants = runs.filter(r => r.width === width);
  if (!variants.length) return { width, status: "UNTESTED", changes: [], runs: [] };
  const stable = baseline(task, runs).filter(f => f.status === "STABLE");
  const model = runs.find(r => r.width === null)?.model;
  if (!stable.length || variants.length !== 3 || variants.some(r => r.error || !r.output || r.model !== model || task.fields.some(f => fieldValue(f, r.output?.[f.key]) === undefined))) {
    return { width, status: "ERROR", changes: [], runs: variants, reason: !stable.length ? "No stable baseline fields to compare." : "Three valid runs with the baseline model are required." };
  }
  const changes = stable.flatMap(f => {
    const field = task.fields.find(field => field.key === f.key)!;
    const after = variants.map(r => fieldValue(field, r.output![f.key])!);
    return after.every(v => v === f.value) ? [] : [{ key: f.key, label: f.label, before: f.value!, after }];
  });
  const partial = stable.length < task.fields.length;
  return { width, status: changes.length ? "DRIFT" : partial ? "PARTIAL" : "PASS", changes, runs: variants,
    comparedFields: stable.length, totalFields: task.fields.length,
    reason: partial ? `Only ${stable.length} of ${task.fields.length} fields have a stable original baseline. The remaining fields cannot be evaluated; no full-task recommendation is available.` : undefined };
}

export function recommend(evaluations: Evaluation[]): Evaluation | undefined {
  return evaluations.filter(v => v.status === "PASS").sort((a, b) => a.width - b.width)[0];
}

export function textTask(phrases: string[]): Task {
  return taskSchema.parse({ name: "Text preservation", instruction: "For each requested phrase, report whether the complete phrase is visibly readable in the image. A partially readable phrase is false.", fields: phrases.map((p, i) => ({ key: `text_${i + 1}`, label: p, type: "boolean", description: `Is the complete phrase ${JSON.stringify(p)} visibly readable?` })) });
}
export function countTask(objects: string[]): Task {
  return taskSchema.parse({ name: "Object counting", instruction: "Count distinct identifiable instances across the entire image, including foreground and background. Scan left to right and count each instance once. Include a partly occluded object only when visible evidence identifies its category. Do not infer objects behind people or other objects. Bicycles exclude motorcycles and scooters. Helmets exclude caps, hats and head coverings. Count people independently of their vehicles. Return zero only when no instance is identifiable.", fields: objects.map((p, i) => ({ key: `count_${i + 1}`, label: p, type: "integer", description: `Number of distinct identifiable ${p} across the entire image, following the counting rules.` })) });
}
