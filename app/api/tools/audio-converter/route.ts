import { NextRequest } from "next/server";

const OUTPUT_FORMATS = new Set(["mp3", "wav", "ogg", "flac", "aac"]);
const MAX_BYTES = 50 * 1024 * 1024;

const backendUrl = () =>
  process.env.NODE_ENV === "production"
    ? "https://api.bokzgacilo.com"
    : process.env.NEXT_PUBLIC_BACKGROUND_REMOVER_API || "http://127.0.0.1:8000";

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Malformed upload.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("No audio file received.", 400);
  }

  if (file.size === 0 || file.size > MAX_BYTES) {
    return jsonError("File is empty or larger than the 50 MB limit.", 413);
  }

  const outputFormat = form.get("target");
  if (typeof outputFormat !== "string" || !OUTPUT_FORMATS.has(outputFormat)) {
    return jsonError("Choose MP3, WAV, OGG, FLAC, or AAC output.", 400);
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl()}/api/convert-audio`, {
      method: "POST",
      body: form,
      headers: { origin: request.headers.get("origin") || "https://www.bokzgacilo.com" },
      cache: "no-store",
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    return jsonError("The audio conversion backend is unreachable. Check the API URL and backend service.", 502);
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": response.headers.get("content-type") || "application/octet-stream",
  });

  for (const name of [
    "Content-Disposition",
    "X-Audio-Source-Format",
    "X-Audio-Output-Format",
    "X-Audio-Output-Bytes",
    "X-Processing-Ms",
  ]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers,
  });
}
