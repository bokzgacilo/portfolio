import { NextRequest } from "next/server";

const FORMATS = new Set(["mp3", "mp4"]);

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
    return jsonError("Send JSON with a video URL and format.", 400);
  }
  const url = typeof body === "object" && body !== null ? (body as { url?: unknown }).url : undefined;
  const format = typeof body === "object" && body !== null ? (body as { format?: unknown }).format : undefined;
  if (typeof url !== "string" || !url.trim()) {
    return jsonError("Enter a YouTube video URL.", 400);
  }
  if (typeof format !== "string" || !FORMATS.has(format)) {
    return jsonError("Choose MP3 or MP4 as the format.", 400);
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl()}/api/youtube/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: request.headers.get("origin") || "https://www.bokzgacilo.com",
      },
      body: JSON.stringify({ url, format }),
      cache: "no-store",
      // Downloads can take a while on a free-tier backend; give it real room.
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    return jsonError("The video backend is unreachable. Check the API URL and backend service.", 502);
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": response.headers.get("content-type") || "application/octet-stream",
  });
  for (const name of [
    "Content-Disposition",
    "X-Youtube-Output-Format",
    "X-Youtube-Output-Bytes",
    "X-Youtube-Duration-Seconds",
    "X-Processing-Ms",
  ]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(await response.arrayBuffer(), { status: response.status, headers });
}
