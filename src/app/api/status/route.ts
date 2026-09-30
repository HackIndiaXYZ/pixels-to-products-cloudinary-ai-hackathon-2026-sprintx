import { configured } from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json({ configured: configured() }); }
