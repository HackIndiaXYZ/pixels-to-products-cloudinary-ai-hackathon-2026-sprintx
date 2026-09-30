import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { isSameOrigin } from "./request-origin";

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function configured(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CREDENTIALS_ROTATED === "true");
}

export function credentials() {
  if (!configured()) throw new ApiError("Live analysis needs newly rotated Cloudinary credentials in .env.local and the AI Vision add-on enabled.", 503);
  return { cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, api_key: process.env.CLOUDINARY_API_KEY!, api_secret: process.env.CLOUDINARY_API_SECRET! };
}

export function cloud() {
  cloudinary.config({ ...credentials(), secure: true });
  return cloudinary;
}

const assetSchema = z.object({
  publicId: z.string().startsWith("invariantlens/").max(200),
  version: z.number().int().positive(), format: z.enum(["jpg", "jpeg", "png", "webp"]),
  width: z.number().int().positive(), height: z.number().int().positive(), bytes: z.number().int().positive(),
  expires: z.number(),
}).strict();
export type Asset = z.infer<typeof assetSchema>;

export function signAsset(asset: Asset) {
  const payload = Buffer.from(JSON.stringify(asset)).toString("base64url");
  const signature = createHmac("sha256", credentials().api_secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAsset(token: string): Asset {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) throw new ApiError("Invalid upload token. Upload the image again.");
  const expected = createHmac("sha256", credentials().api_secret).update(payload).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new ApiError("Invalid upload token. Upload the image again.");
  const parsed = assetSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  if (!parsed.success || parsed.data.expires < Date.now()) throw new ApiError("Upload session expired. Upload the image again.");
  return parsed.data;
}

export function imageUrl(asset: Asset, width: number | null) {
  return cloud().url(asset.publicId, {
    version: asset.version, format: asset.format, secure: true,
    ...(width ? { transformation: [{ crop: "limit", width }, { quality: "auto" }] } : {}),
  });
}

const buckets = new Map<string, { count: number; until: number }>();
export function guard(request: Request, limit: number, kind: string) {
  if (!isSameOrigin(request)) throw new ApiError("Cross-origin requests are not allowed.", 403);
  const key = `${kind}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}`;
  const now = Date.now();
  for (const [k, b] of buckets) if (b.until < now) buckets.delete(k);
  const bucket = buckets.get(key) ?? { count: 0, until: now + 60_000 };
  if (bucket.count >= limit) throw new ApiError("Too many requests. Wait a minute before trying again.", 429);
  bucket.count += 1; buckets.set(key, bucket);
}

export function failure(error: unknown) {
  if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError || error instanceof SyntaxError) return Response.json({ error: "Invalid request. Check your task fields and upload again if needed." }, { status: 400 });
  return Response.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
}
