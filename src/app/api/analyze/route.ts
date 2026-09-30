import { z } from "zod";
import { taskSchema, WIDTHS } from "@/lib/domain";
import { ApiError, failure, guard, imageUrl, verifyAsset } from "@/lib/server";
import { analyzeImage } from "@/lib/vision";
export const runtime = "nodejs";
export const maxDuration = 60;
const requestSchema = z.object({ token: z.string().max(3000), width: z.union([z.literal(null), z.number().refine(n => WIDTHS.includes(n as typeof WIDTHS[number]))]), task: taskSchema }).strict();

export async function POST(request: Request) {
  try {
    guard(request, 30, "analyze");
    const text = await request.text();
    if (text.length > 20_000) throw new ApiError("Task definition is too large.", 413);
    const input = requestSchema.parse(JSON.parse(text));
    const asset = verifyAsset(input.token);
    if (input.width && input.width >= asset.width) throw new ApiError("This preset does not reduce the image width.");
    const result = await analyzeImage(imageUrl(asset, input.width), input.task);
    return Response.json({ ...result, width: input.width, transformation: input.width ? `c_limit,w_${input.width}/q_auto` : "original", at: new Date().toISOString(), id: crypto.randomUUID() });
  } catch (error) { return failure(error); }
}
