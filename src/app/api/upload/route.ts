import { randomUUID } from "node:crypto";
import { cloud, credentials, failure, guard, imageUrl, signAsset, ApiError, type Asset } from "@/lib/server";
import type { UploadApiResponse } from "cloudinary";
import { uploadFailureMessage } from "@/lib/provider-errors";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    guard(request, 5, "upload"); credentials();
    if (Number(request.headers.get("content-length")) > 4_200_000) throw new ApiError("Choose an image smaller than 4 MB.", 413);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new ApiError("Choose a JPEG, PNG or WebP image.");
    if (file.size > 4_000_000 || file.size === 0) throw new ApiError("Choose an image between 1 byte and 4 MB.", 413);
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloud().uploader.upload_stream({ resource_type: "image", public_id: `invariantlens/${randomUUID()}`, allowed_formats: ["jpg", "jpeg", "png", "webp"], timeout: 45_000 }, (error, result) => {
        if (error || !result) reject(new ApiError(uploadFailureMessage(error), 502));
        else resolve(result);
      });
      stream.end(buffer);
    });
    const asset: Asset = { publicId: uploaded.public_id, version: uploaded.version, format: uploaded.format as Asset["format"], width: uploaded.width, height: uploaded.height, bytes: uploaded.bytes, expires: Date.now() + 3_600_000 };
    return Response.json({ token: signAsset(asset), url: imageUrl(asset, null), asset: { publicId: asset.publicId, width: asset.width, height: asset.height, bytes: asset.bytes } });
  } catch (error) { return failure(error); }
}
