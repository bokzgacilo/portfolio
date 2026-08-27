/**
 * Client for the FastAPI background-removal service.
 *
 * The browser talks to the API directly rather than through a Next route
 * handler: a Vercel function caps a request body at 4.5 MB and would have to
 * hold the upload for the whole inference, so proxying would shrink the file
 * limit and add a second timeout for no gain. The service is CORS-locked to
 * this site's origins instead.
 */

/** Kept in step with ALLOWED_CONTENT_TYPES in backend/main.py. */
export const SUPPORTED_INPUT = ["image/jpeg", "image/png", "image/webp"] as const;

/** Kept in step with MAX_UPLOAD_BYTES in backend/main.py. */
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

/** The service downscales past this before running the model. */
export const MAX_DIMENSION = 2000;

/* A free Render instance sleeps after ~15 minutes and needs the better part of
   a minute to wake, so the removal call gets a generous ceiling. The health
   ping gets its own: it is only a hint for the status line, and a slow answer
   there should never look like a failure. */
const REMOVE_TIMEOUT_MS = 120_000;
const HEALTH_TIMEOUT_MS = 75_000;

export type Cutout = {
  blob: Blob;
  /** Model inference time as measured on the server, in milliseconds. */
  processingMs: number;
  model: string;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  /** True when the upload was larger than MAX_DIMENSION and got scaled down. */
  downscaled: boolean;
};

/** Null when the deployment has no API configured, so the UI can say so
 *  instead of firing requests at `undefined/api/remove-background`. */
export function apiBase() {
  const raw = process.env.NEXT_PUBLIC_BACKGROUND_REMOVER_API?.trim();
  return raw ? raw.replace(/\/+$/, "") : null;
}

function headerNumber(response: Response, name: string, fallback = 0) {
  const value = Number(response.headers.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Reads the API's `{ error }` shape, falling back to the status code when the
 *  body is empty or not JSON (a gateway timeout, say). */
async function errorFrom(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (payload.error) return payload.error;

  if (response.status === 502 || response.status === 503 || response.status === 504) {
    return "The background-removal service is unavailable right now. Try again in a moment.";
  }
  return `The service answered ${response.status}.`;
}

export type ApiState = "unknown" | "ready" | "waking" | "offline" | "unconfigured";

/**
 * Pings /health. On a sleeping free instance this request is what wakes it, so
 * it is fired when the page mounts and its result is only ever advisory --
 * nothing here blocks the visitor from choosing a file.
 */
export async function checkApi(): Promise<{ state: ApiState; model?: string }> {
  const base = apiBase();
  if (!base) return { state: "unconfigured" };

  try {
    const response = await fetch(`${base}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) return { state: "offline" };

    const payload = (await response.json()) as { model?: string; ready?: boolean };
    return { state: payload.ready ? "ready" : "waking", model: payload.model };
  } catch {
    return { state: "offline" };
  }
}

export async function removeBackground(file: File): Promise<Cutout> {
  const base = apiBase();
  if (!base) {
    throw new Error(
      "No background-removal service is configured for this deployment."
    );
  }

  const body = new FormData();
  body.append("file", file, file.name);

  let response: Response;
  try {
    response = await fetch(`${base}/api/remove-background`, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(REMOVE_TIMEOUT_MS),
    });
  } catch (cause) {
    /* Either the instance never woke, or the browser could not reach it at all
       -- a CORS rejection and a dead host are indistinguishable from here. */
    const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
    throw new Error(
      timedOut
        ? "The service did not answer in time. It may be waking from sleep — try once more."
        : "Could not reach the background-removal service."
    );
  }

  if (!response.ok) {
    throw new Error(await errorFrom(response));
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("The service returned an empty image.");
  }

  return {
    blob,
    processingMs: headerNumber(response, "X-Processing-Ms"),
    model: response.headers.get("X-Model") ?? "unknown",
    originalWidth: headerNumber(response, "X-Original-Width"),
    originalHeight: headerNumber(response, "X-Original-Height"),
    width: headerNumber(response, "X-Output-Width"),
    height: headerNumber(response, "X-Output-Height"),
    downscaled: response.headers.get("X-Downscaled") === "1",
  };
}

/** `beach-photo.jpg` -> `beach-photo-cutout.png` */
export function cutoutName(name: string) {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}-cutout.png`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}
