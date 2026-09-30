import "server-only";
import { ApiError, credentials } from "./server";
import { buildPrompt, parseOutput, type Task } from "./domain";
import { z } from "zod";

const envelope = z.object({ data: z.object({
  task_id: z.string().optional(), status: z.string().optional(),
  analysis: z.object({ responses: z.array(z.object({ value: z.string() })), model_version: z.union([z.number(), z.string()]).optional() }).optional(),
}) });

export async function analyzeImage(uri: string, task: Task, fetcher: typeof fetch = fetch) {
  const config = credentials();
  const base = `https://api.cloudinary.com/v2/analysis/${encodeURIComponent(config.cloud_name)}`;
  const headers = { Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString("base64")}`, "Content-Type": "application/json" };
  const signal = AbortSignal.timeout(50_000);
  async function read(response: Response) {
    if (!response.ok) throw new ApiError(response.status === 429 ? "Cloudinary quota or rate limit reached. Check your add-on allowance." : response.status === 401 || response.status === 403 ? "Cloudinary access was denied. Check the new credentials and AI Vision add-on." : "Cloudinary could not analyze this image. Try again.", 502);
    return response.json();
  }
  try {
    let raw: unknown = await read(await fetcher(`${base}/analyze/ai_vision_general`, { method: "POST", headers, body: JSON.stringify({ source: { uri }, prompts: [buildPrompt(task)] }), signal, cache: "no-store" }));
    let parsed = envelope.parse(raw);
    const taskId = parsed.data.task_id;
    while (!parsed.data.analysis && taskId && !signal.aborted) {
      if (["failed", "error"].includes(parsed.data.status ?? "")) throw new ApiError("Cloudinary analysis task failed.", 502);
      await new Promise(resolve => setTimeout(resolve, 1500));
      raw = await read(await fetcher(`${base}/tasks/${encodeURIComponent(taskId)}`, { headers, signal, cache: "no-store" }));
      parsed = envelope.parse(raw);
    }
    const analysis = parsed.data.analysis;
    if (!analysis?.responses[0]) throw new ApiError("Cloudinary returned no completed analysis. Retry this test.", 502);
    return { output: parseOutput(analysis.responses[0].value, task), raw, model: analysis.model_version === undefined ? undefined : String(analysis.model_version) };
  } catch (error) {
    if (signal.aborted) throw new ApiError("AI Vision timed out after 50 seconds. Retry this test.", 504);
    if (error instanceof z.ZodError || error instanceof SyntaxError) throw new ApiError("AI Vision returned an invalid or incomplete structured response. This run is an error, not drift.", 502);
    throw error;
  }
}
