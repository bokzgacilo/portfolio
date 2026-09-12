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
    return jsonError("Send JSON with a job id and format.", 400);
  }
  const jobId = typeof body === "object" && body !== null ? (body as { jobId?: unknown }).jobId : undefined;
  const format = typeof body === "object" && body !== null ? (body as { format?: unknown }).format : undefined;
  if (typeof jobId !== "string" || !jobId.trim()) {
    return jsonError("Look up a video before downloading it.", 400);
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
      body: JSON.stringify({ jobId, format }),
      cache: "no-store",
      // Downloads can take a while on a free-tier backend; give it real room.
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    return jsonError("The video backend is unreachable. Check the API URL and backend service.", 502);
  }

  const payload = await response.text();
  if (!response.ok) {
    return new Response(payload, {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  // The backend hands back a path relative to itself (e.g. /api/youtube/file/<id>).
  // The browser downloads directly from the backend afterwards, so this needs
  // to be an absolute URL rather than one relative to this Next.js origin.
  let parsed: { downloadUrl?: unknown; sizeBytes?: unknown; expiresInSeconds?: unknown; elapsedMs?: unknown };
  try {
    parsed = JSON.parse(payload);
  } catch {
    return jsonError("The video backend returned an unexpected response.", 502);
  }
  if (typeof parsed.downloadUrl !== "string") {
    return jsonError("The video backend returned an unexpected response.", 502);
  }

  return Response.json(
    { ...parsed, downloadUrl: `${backendUrl()}${parsed.downloadUrl}` },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
