"use client";

export type ResizeFormat = "image/png" | "image/jpeg" | "image/webp";

export type ResizeResult = {
  blob: Blob;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  format: ResizeFormat;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
  durationMs: number;
};

export const SUPPORTED_INPUT = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const PRESETS = [
  { label: "Square", width: 1080, height: 1080 },
  { label: "Story", width: 1080, height: 1920 },
  { label: "Post", width: 1200, height: 630 },
  { label: "Avatar", width: 512, height: 512 },
  { label: "HD", width: 1920, height: 1080 },
] as const;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

export function extensionFor(format: ResizeFormat) {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/webp") return "webp";
  return "png";
}

export function resizedName(name: string, format: ResizeFormat, width: number, height: number) {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}-${width}x${height}.${extensionFor(format)}`;
}

export async function resizeImage(
  file: File,
  width: number,
  height: number,
  format: ResizeFormat,
  quality = 0.92,
  imageZoom = 100,
  imageOffsetX = 0,
  imageOffsetY = 0
): Promise<ResizeResult> {
  const startedAt = performance.now();
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file could not be decoded as an image.");
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("This browser would not provide a 2D canvas context.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    const fittedScale = Math.min(width / bitmap.width, height / bitmap.height);
    const imageScale = fittedScale * (imageZoom / 100);
    const drawnWidth = bitmap.width * imageScale;
    const drawnHeight = bitmap.height * imageScale;
    const dx = width / 2 + imageOffsetX - drawnWidth / 2;
    const dy = height / 2 + imageOffsetY - drawnHeight / 2;
    context.drawImage(bitmap, dx, dy, drawnWidth, drawnHeight);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality)
    );

    canvas.width = 0;
    canvas.height = 0;

    if (!blob) {
      throw new Error("The browser could not encode the resized image.");
    }

    return {
      blob,
      width,
      height,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
      format,
      imageScale,
      imageOffsetX,
      imageOffsetY,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    bitmap.close();
  }
}
