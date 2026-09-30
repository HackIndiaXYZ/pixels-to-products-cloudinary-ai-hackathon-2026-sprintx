// Return fixed public messages; provider errors can contain signed URLs or credentials.
export function uploadFailureMessage(error: unknown): string {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const nested = value.error && typeof value.error === "object" ? value.error as Record<string, unknown> : {};
  const status = Number(value.http_code ?? nested.http_code);
  if (status === 401) return "Cloudinary rejected the API key or secret. Copy a matching key and secret from the same product environment into your environment file, then restart the app.";
  if (status === 403) return "Cloudinary denied this upload. Check the API key permissions and product environment.";
  if (status === 429) return "Cloudinary's upload rate limit was reached. Wait before trying again.";
  return "Cloudinary upload failed. Check your connection and account settings.";
}
