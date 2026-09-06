import { NextRequest } from "next/server";

const backendUrl = () =>
  process.env.NODE_ENV === "production"
    ? "https://api.bokzgacilo.com"
    : process.env.NEXT_PUBLIC_BACKGROUND_REMOVER_API || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  let response: Response;
  try {
    response = await fetch(`${backendUrl()}/api/unlock-excel`, {
      method: "POST",
      body: form,
      headers: { origin: request.headers.get("origin") || "https://www.bokzgacilo.com" },
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: "The Excel backend is unreachable. Check the API URL and backend service." },
      { status: 502 },
    );
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": response.headers.get("content-type") || "application/octet-stream",
  });
  const disposition = response.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  for (const name of ["X-Excel-Total-Sheets", "X-Excel-Locked-Sheets", "X-Excel-Unlocked-Sheets"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(await response.arrayBuffer(), { status: response.status, headers });
}
