"use client";

export type ConvertFormat = "image/png" | "image/jpeg" | "image/webp";

export type ConvertResult = {
  blob: Blob;
  width: number;
  height: number;
  sourceFormat: string;
  format: ConvertFormat;
  durationMs: number;
};

export const SUPPORTED_INPUT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

const CONVERT_TIMEOUT_MS = 120_000;
const PRODUCTION_API_BASE = "https://api.bokzgacilo.com";
const DEVELOPMENT_API_BASE = "http://127.0.0.1:8000";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

export function extensionFor(format: ConvertFormat) {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/webp") return "webp";
  return "png";
}

export function convertedName(name: string, format: ConvertFormat) {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${extensionFor(format)}`;
}

export function formatLabel(mime: string) {
  if (mime === "image/jpeg") return "JPEG";
  if (mime === "image/png") return "PNG";
  if (mime === "image/webp") return "WebP";
  if (mime === "image/avif") return "AVIF";
  if (mime === "image/heic") return "HEIC";
  if (mime === "image/heif") return "HEIF";
  return mime || "Unknown";
}

export function isSupportedInput(file: File) {
  if (SUPPORTED_INPUT.includes(file.type)) return true;
  return /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name);
}

function isHeifLike(file: File) {
  return file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name);
}

function apiBase() {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_BASE;
  }

  const raw = process.env.NEXT_PUBLIC_BACKGROUND_REMOVER_API?.trim();
  return (raw || DEVELOPMENT_API_BASE).replace(/\/+$/, "");
}

function headerNumber(response: Response, name: string, fallback = 0) {
  const value = Number(response.headers.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function errorFrom(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (payload.error) return payload.error;

  if (response.status === 502 || response.status === 503 || response.status === 504) {
    return "The image conversion service is unavailable right now. Try again in a moment.";
  }
  return `The service answered ${response.status}.`;
}

async function convertImageOnServer(
  file: File,
  format: ConvertFormat
): Promise<ConvertResult> {
  const base = apiBase();
  if (!base) {
    throw new Error("No image conversion service is configured for this deployment.");
  }

  const body = new FormData();
  body.append("file", file, file.name);

  let response: Response;
  try {
    response = await fetch(`${base}/api/convert-image?target=${encodeURIComponent(format)}`, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(CONVERT_TIMEOUT_MS),
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
    throw new Error(
      timedOut
        ? "The conversion service did not answer in time. It may be waking from sleep - try once more."
        : "Could not reach the image conversion service."
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
    width: headerNumber(response, "X-Output-Width"),
    height: headerNumber(response, "X-Output-Height"),
    sourceFormat: response.headers.get("X-Source-Format") ?? file.type,
    format,
    durationMs: headerNumber(response, "X-Processing-Ms"),
  };
}

async function convertImageInBrowser(
  file: File,
  format: ConvertFormat,
  quality = 0.92
): Promise<ConvertResult> {
  const startedAt = performance.now();
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file could not be decoded as an image.");
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("This browser would not provide a 2D canvas context.");
    }

    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality)
    );

    canvas.width = 0;
    canvas.height = 0;

    if (!blob || blob.type !== format) {
      throw new Error(`${formatLabel(format)} export is not supported in this browser.`);
    }

    return {
      blob,
      width: bitmap.width,
      height: bitmap.height,
      sourceFormat: file.type,
      format,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    bitmap.close();
  }
}

export async function convertImage(
  file: File,
  format: ConvertFormat,
  quality = 0.92
): Promise<ConvertResult> {
  if (isHeifLike(file)) {
    return convertImageOnServer(file, format);
  }

  try {
    return await convertImageInBrowser(file, format, quality);
  } catch (cause) {
    if (file.type === "image/avif") {
      return convertImageOnServer(file, format);
    }
    throw cause;
  }
}
