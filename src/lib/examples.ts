import { countTask, textTask, type Report, type Output, type Run } from "./domain";

function observed(width: number | null, outputs: Output[]): Run[] {
  return outputs.map((output, i) => ({ id: `recorded-${width ?? "original"}-${i}`, width, at: "Not recorded in handoff", output, model: "Not recorded in handoff" }));
}
const repeat = (output: Output) => [output, output, output];
const note = "Transcribed from the project handoff. Sample photos were supplied later and are available in public/samples. Raw API responses, exact prompt, model version and timestamps for these historical results remain unavailable. These are hard-coded reported observations, not an independently verified replay of the supplied photos. Untested presets have no results.";

export const examples: Record<string, Report> = {
  storefront: {
    mode: "recorded", title: "Storefront signage", task: textTask(["CHOO", "TEA", "OPEN", "NO SMOKING", "NO VAPING"]), sourceNote: note,
    runs: [...observed(null, repeat({ text_1: true, text_2: true, text_3: true, text_4: true, text_5: true })), ...observed(600, repeat({ text_1: true, text_2: true, text_3: true, text_4: false, text_5: false }))],
  },
  desk: {
    mode: "recorded", title: "Desk object count", task: countTask(["pens"]), sourceNote: note,
    runs: [...observed(null, repeat({ count_1: 3 })), ...observed(200, repeat({ count_1: 2 }))],
  },
  cyclists: {
    mode: "recorded", title: "Cyclist baseline variability", task: countTask(["bicycles"]), sourceNote: note,
    runs: observed(null, [{ count_1: 5 }, { count_1: 5 }, { count_1: 4 }]),
  },
};
