import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { statisticResources } from "@/app/components/statistics/registry";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const unavailable = () => NextResponse.json({ error: "Statistics are temporarily unavailable." }, { status: 503, headers });

export async function GET() {
  const db = createSupabaseServerClient();
  if (!db) return unavailable();
  try {
    const { data, error } = await db.rpc("read_resource_statistics");
    if (error) return unavailable();
    return NextResponse.json({ stats: data }, { headers });
  } catch { return unavailable(); }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new NextResponse(null, { status: 403 });
  let body;
  try {
    const text = await request.text();
    if (text.length > 1024) return new NextResponse(null, { status: 413 });
    body = JSON.parse(text);
  } catch { return new NextResponse(null, { status: 400 }); }
  if (!body || typeof body !== "object") return new NextResponse(null, { status: 400 });
  const resource = statisticResources.find(item => item.key === body.resource);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!resource || typeof body.visitor !== "string" || !uuid.test(body.visitor) || typeof body.eventId !== "string" || !uuid.test(body.eventId) ||
    !(resource.kind === "tool" ? ["visit", "complete"] : ["open"]).includes(body.event)) {
    return new NextResponse(null, { status: 400 });
  }
  const db = createSupabaseServerClient();
  if (!db) return unavailable();
  try {
    const { error } = await db.rpc("record_resource_event", {
      p_resource: resource.key, p_visitor: body.visitor, p_event_id: body.eventId, p_event: body.event,
    });
    if (error) return unavailable();
    return new NextResponse(null, { status: 204, headers });
  } catch { return unavailable(); }
}
