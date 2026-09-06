import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const unavailable = () => NextResponse.json({ error: "Statistics are temporarily unavailable." }, { status: 503, headers });

function backendStatisticsUrl() {
  const base = process.env.NODE_ENV === "production"
    ? "https://api.bokzgacilo.com"
    : (process.env.NEXT_PUBLIC_BACKGROUND_REMOVER_API || "http://127.0.0.1:8000");
  return `${base.replace(/\/+$/, "")}/api/statistics`;
}

export async function GET() {
  try {
    const response = await fetch(backendStatisticsUrl(), { cache: "no-store", headers: { Accept: "application/json" } });
    return new NextResponse(await response.text(), { status: response.status, headers: { ...headers, "Content-Type": "application/json" } });
  } catch { return unavailable(); }
}

export async function POST(request: Request) {
  try {
    const response = await fetch(backendStatisticsUrl(), {
      method: "POST", body: await request.text(), headers: { "Content-Type": "application/json", Origin: "https://www.bokzgacilo.com" },
    });
    return new NextResponse(response.status === 204 ? null : await response.text(), { status: response.status, headers });
  } catch { return unavailable(); }
}
