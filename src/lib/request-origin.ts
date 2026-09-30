// Next.js may reconstruct request.url using localhost while the browser uses
// 127.0.0.1. The HTTP Host header retains the address the browser requested.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host") || url.host;
    return origin === `${url.protocol}//${host}`;
  } catch { return false; }
}
