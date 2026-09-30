import { describe, expect, it } from "vitest";
import { baseline, baselineMessage, money, receiptRecommendation, buildPrompt, evaluate, parseOutput, recommend, textTask, countTask, type Run } from "./domain";
import { examples } from "./examples";
function runs(width: number | null, values: number[]): Run[] {
  return values.map((n, i) => ({ id: `${width}-${i}`, width, at: "test", model: "1", output: { count_1: n } }));
}
const task = countTask(["pens"]);
describe("baseline and drift decisions", () => {
  it("does not mistake an unstable original for transformation drift", () => {
    const observations = [...runs(null, [5, 5, 4]), ...runs(200, [4, 4, 4])];
    expect(baseline(task, observations)[0].status).toBe("UNSTABLE");
    expect(evaluate(task, observations, 200).status).toBe("ERROR");
  });
  it("requires three complete baseline runs", () => {
    expect(baseline(task, runs(null, [3, 3]))[0].status).toBe("ERROR");
  });
  it("records the actual changed values", () => {
    const result = evaluate(task, [...runs(null, [3, 3, 3]), ...runs(200, [2, 2, 2])], 200);
    expect(result.status).toBe("DRIFT");
    expect(result.changes[0]).toMatchObject({ before: 3, after: [2, 2, 2] });
  });
  it("does not pass mixed variant results", () => {
    expect(evaluate(task, [...runs(null, [3, 3, 3]), ...runs(600, [3, 2, 3])], 600).status).toBe("DRIFT");
  });
  it("keeps API failures out of drift", () => {
    const broken = runs(600, [3, 3, 3]); broken[1] = { ...broken[1], output: undefined, error: "timeout" };
    expect(evaluate(task, [...runs(null, [3, 3, 3]), ...broken], 600).status).toBe("ERROR");
  });
  it("does not compare different reported model versions", () => {
    const variants = runs(600, [3, 3, 3]).map(r => ({ ...r, model: "2" }));
    expect(evaluate(task, [...runs(null, [3, 3, 3]), ...variants], 600).status).toBe("ERROR");
  });
  it("does not assume monotonic outcomes", () => {
    const observations = [...runs(null, [3, 3, 3]), ...runs(800, [3, 3, 3]), ...runs(600, [2, 2, 2]), ...runs(400, [3, 3, 3])];
    expect(recommend([800, 600, 400].map(w => evaluate(task, observations, w)))?.width).toBe(400);
  });
  it("never recommends untested examples", () => {
    const report = examples.storefront;
    const results = [1200, 800, 600, 400, 200].map(w => evaluate(report.task, report.runs, w));
    expect(results.find(r => r.width === 800)?.status).toBe("UNTESTED");
    expect(recommend(results)).toBeUndefined();
    expect(results.find(r => r.width === 600)?.changes).toHaveLength(2);
  });
  it("compares stable fields while exposing unstable ones", () => {
    const t = countTask(["pens", "phones"]);
    const observations = [...runs(null, [3, 3, 3]), ...runs(600, [3, 3, 3])].map((r, i) => ({ ...r, output: { ...r.output, count_2: i % 2 } }));
    expect(baseline(t, observations).map(f => f.status)).toEqual(["STABLE", "UNSTABLE"]);
    const result = evaluate(t, observations, 600);
    expect(result.status).toBe("PARTIAL");
    expect(result).toMatchObject({ comparedFields: 1, totalFields: 2 });
    expect(recommend([result])).toBeUndefined();
  });
  it("still reports drift in a comparable field when another baseline field is unstable", () => {
    const t = countTask(["bicycles", "people"]);
    const observations = [...runs(null, [5, 5, 4]), ...runs(200, [4, 4, 4])].map((r, i) => ({ ...r, output: { ...r.output, count_2: i < 3 ? 4 : 3 } }));
    const result = evaluate(t, observations, 200);
    expect(result.status).toBe("DRIFT");
    expect(result.changes.map(c => c.key)).toEqual(["count_2"]);
    expect(recommend([result])).toBeUndefined();
  });
  it("rejects a variant missing an excluded field rather than calling it a partial pass", () => {
    const t = countTask(["bicycles", "people"]);
    const originals = runs(null, [5, 5, 4]).map(r => ({ ...r, output: { ...r.output, count_2: 4 } }));
    const variants = runs(200, [4, 4, 4]).map(r => ({ ...r, output: { count_2: 4 } }));
    expect(evaluate(t, [...originals, ...variants], 200).status).toBe("ERROR");
  });
});
describe("structured outputs", () => {
  it("rejects missing fields, extra fields and wrong types", () => {
    const t = textTask(["OPEN"]);
    for (const input of ['{}', '{"text_1":"true"}', '{"text_1":true,"extra":false}', 'not JSON']) expect(() => parseOutput(input, t)).toThrow();
  });
  it("accepts fenced JSON without converting missing text into errors", () => {
    expect(parseOutput('```json\n{"text_1":false}\n```', textTask(["OPEN"]))).toEqual({ text_1: false });
  });
  it("rejects negative and fractional counts", () => {
    expect(() => parseOutput('{"count_1":-1}', task)).toThrow();
    expect(() => parseOutput('{"count_1":2.5}', task)).toThrow();
  });
});

describe("receipt safeguards", () => {
  const receipt = { name: "Receipt", instruction: "Read the total", fields: [{ key: "total", label: "Total", type: "string" as const, description: "Printed total", comparison: "money" as const }] };
  const observations = (value: string, width: number | null): Run[] => [0, 1, 2].map(i => ({ id: `${width}-${i}`, width, at: "test", model: "1", output: { total: value } }));
  it("normalizes decimal and grouped totals without losing amount differences", () => {
    expect(money("16,69")).toBe("16.69");
    expect(money("13,000")).toBe("13000.00");
    expect(money("13.000,00")).toBe("13000.00");
    expect(money("1,23,4")).toBeUndefined();
    expect(money("")).toBeUndefined();
    const runs = [...observations("16,69", null), ...observations("16.69", 200)];
    expect(evaluate(receipt, runs, 200).status).toBe("PASS");
    expect(evaluate(receipt, [...observations("16.69", null), ...observations("1669", 200)], 200).status).toBe("DRIFT");
  });
  it("never treats three unreadable totals as stable or a variant as a pass", () => {
    expect(baseline(receipt, observations("", null))[0].status).toBe("ERROR");
    expect(evaluate(receipt, [...observations("5.00", null), ...observations("", 200)], 200).status).toBe("ERROR");
  });
  it("requires a matching manual reference and never puts it in the prompt", () => {
    const runs = [...observations("5.00", null), ...observations("5.00", 200)];
    const report = { mode: "live" as const, title: "receipt", task: receipt, runs };
    const evaluations = [evaluate(receipt, runs, 200)];
    expect(receiptRecommendation(report, evaluations)).toBeUndefined();
    expect(receiptRecommendation({ ...report, receiptReview: { total: "6.00", currency: "USD" } }, evaluations)).toBeUndefined();
    expect(receiptRecommendation({ ...report, receiptReview: { total: "5.00", currency: "USD" } }, evaluations)?.width).toBe(200);
    expect(buildPrompt(receipt)).not.toContain("5.00");
    expect(receiptRecommendation({ ...report, receiptReview: { total: "5.00", currency: "USD" }, runs: [...runs, { id: "failure", width: 400, at: "test", error: "quota" }] }, evaluations)).toBeUndefined();
  });
  it("identifies provider failures separately from inconsistent answers", () => {
    expect(baselineMessage(receipt, [{ id: "error", at: "test", width: null, error: "Cloudinary quota or rate limit reached" }])).toContain("Analysis blocked");
  });
});
