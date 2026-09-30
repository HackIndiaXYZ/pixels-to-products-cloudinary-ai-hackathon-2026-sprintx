import { z } from "zod";
import { ApiError, failure, guard } from "@/lib/server";

// A stateless download response avoids temporary blob URLs in embedded browsers.
// The submitted report is client-provided evidence, not a server attestation.
const reportSchema = z.object({
  mode: z.enum(["live", "recorded"]),
  title: z.string().max(300),
  runs: z.array(z.object({ id: z.string(), width: z.number().nullable() }).passthrough()).max(30),
}).passthrough();

export async function POST(request: Request) {
  try {
    guard(request, 10, "report");
    const body = await request.text();
    if (body.length > 2_000_000) throw new ApiError("Report exceeds the 2 MB export limit.", 413);
    const value = new URLSearchParams(body).get("report");
    if (!value) throw new ApiError("No report supplied.");
    const report = reportSchema.parse(JSON.parse(value));
    return new Response(JSON.stringify(report, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="invariantlens-report.json"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) { return failure(error); }
}
