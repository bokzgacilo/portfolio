import { NextRequest } from "next/server";

const backendUrl = () =>
  process.env.NODE_ENV === "production"
    ? "https://api.bokzgacilo.com"
    : process.env.NEXT_PUBLIC_BACKGROUND_REMOVER_API || "http://127.0.0.1:8000";

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Send JSON with a video URL.", 400);
  }
  const url = typeof body === "object" && body !== null ? (body as { url?: unknown }).url : undefined;
  if (typeof url !== "string" || !url.trim()) {
    return jsonError("Enter a YouTube video URL.", 400);
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl()}/api/youtube/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: request.headers.get("origin") || "https://www.bokzgacilo.com",
      },
      body: JSON.stringify({ url }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return jsonError("The video backend is unreachable. Check the API URL and backend service.", 502);
  }

  const payload = await response.text();
  return new Response(payload, {
    status: response.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
