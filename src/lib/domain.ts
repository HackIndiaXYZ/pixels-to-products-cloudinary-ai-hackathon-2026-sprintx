import { z } from "zod";

export const WIDTHS = [1200, 800, 600, 400, 200] as const;
export type Value = string | number | boolean;
export type Output = Record<string, Value>;
export const fieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,59}$/),
  label: z.string().min(1).max(120),
  type: z.enum(["boolean", "integer", "string"]),
  description: z.string().min(1).max(300),
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
  width: number; status: "PASS" | "DRIFT" | "ERROR" | "UNTESTED";
  changes: { key: string; label: string; before: Value; after: Value[] }[];
  runs: Run[]; reason?: string;
};
export type Report = {
  mode: "live" | "recorded"; title: string; task: Task; runs: Run[];
  sourceNote?: string; imageUrl?: string; asset?: { publicId: string; width: number; height: number; bytes: number };
};

export function normalize(value: Value): Value {
  return typeof value === "string" ? value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase() : value;
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
    const values = originals.map(r => r.output?.[field.key]);
    const invalid = originals.length !== 3 || originals.some(r => r.error || r.output?.[field.key] === undefined);
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
  if (!stable.length || variants.length !== 3 || variants.some(r => r.error || !r.output || r.model !== model || stable.some(f => r.output?.[f.key] === undefined))) {
    return { width, status: "ERROR", changes: [], runs: variants, reason: !stable.length ? "No stable baseline fields to compare." : "Three valid runs with the baseline model are required." };
  }
  const changes = stable.flatMap(f => {
    const after = variants.map(r => normalize(r.output![f.key]));
    return after.every(v => v === f.value) ? [] : [{ key: f.key, label: f.label, before: f.value!, after }];
  });
  return { width, status: changes.length ? "DRIFT" : "PASS", changes, runs: variants };
}

export function recommend(evaluations: Evaluation[]): Evaluation | undefined {
  return evaluations.filter(v => v.status === "PASS").sort((a, b) => a.width - b.width)[0];
}

export function textTask(phrases: string[]): Task {
  return taskSchema.parse({ name: "Text preservation", instruction: "For each requested phrase, report whether the complete phrase is visibly readable in the image. A partially readable phrase is false.", fields: phrases.map((p, i) => ({ key: `text_${i + 1}`, label: p, type: "boolean", description: `Is the complete phrase ${JSON.stringify(p)} visibly readable?` })) });
}
export function countTask(objects: string[]): Task {
  return taskSchema.parse({ name: "Object counting", instruction: "Count the distinct visible instances of each requested object. Count only objects visible in the image.", fields: objects.map((p, i) => ({ key: `count_${i + 1}`, label: p, type: "integer", description: `Number of visible ${p}.` })) });
}
