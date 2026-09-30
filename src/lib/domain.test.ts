import { describe, expect, it } from "vitest";
import { baseline, evaluate, parseOutput, recommend, textTask, countTask, type Run } from "./domain";
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
    expect(evaluate(t, observations, 600).status).toBe("PASS");
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
