/**
 * Target-size image compression, entirely in the browser.
 *
 * The strategy is a binary search on encoder quality, wrapped in a downscale
 * loop. Quality alone often cannot reach an aggressive target (a 5 MB photo
 * asked to fit in 200 KB), so when even the floor quality overshoots we shrink
 * the pixel dimensions and search again. That ordering matters: dropping
 * quality is cheaper visually than dropping resolution, so resolution is only
 * touched once quality has been exhausted.
 */

export type OutputFormat = "auto" | "image/webp" | "image/jpeg";

export type CompressionResult = {
  blob: Blob;
  /** Encoder quality that produced this blob, 0-1. */
  quality: number;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  /** True when the target forced a resolution reduction. */
  downscaled: boolean;
  /** False when even the smallest attempt stayed above the target. */
  hitTarget: boolean;
  durationMs: number;
};

const QUALITY_FLOOR = 0.05;
const QUALITY_CEILING = 0.96;
/** Enough to land within ~0.4% of the ideal quality. */
const SEARCH_STEPS = 8;
/** Each retry keeps ~67% of the pixels. */
const SCALE_STEP = 0.82;
const MAX_SCALE_ATTEMPTS = 8;

export const SUPPORTED_INPUT = ["image/jpeg", "image/png", "image/webp", "image/avif"];

let webpSupport: Promise<boolean> | null = null;

/** Cached one-pixel probe: Safari only gained WebP encoding recently. */
export function supportsWebpEncoding() {
  if (!webpSupport) {
    webpSupport = (async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", 0.5)
        );
        return blob?.type === "image/webp";
      } catch {
        return false;
      }
    })();
  }
  return webpSupport;
}

export async function resolveFormat(format: OutputFormat): Promise<"image/webp" | "image/jpeg"> {
  if (format !== "auto") {
    return format;
  }
  return (await supportsWebpEncoding()) ? "image/webp" : "image/jpeg";
}

/** Draws the bitmap at the given size and encodes it once. */
async function encode(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("This browser would not provide a 2D canvas context.");
  }

  /* JPEG has no alpha channel; without this, transparent pixels encode as
     black instead of white. Harmless for opaque sources. */
  if (mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);

  /* toBlob is async but the drawImage above is not: without yielding first,
     every pass lands in one frame and the progress label never paints. */
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality)
  );

  /* Free the backing store immediately -- a 5 MB photo at full resolution is
     tens of MB of canvas memory, and the loop below allocates many. */
  canvas.width = 0;
  canvas.height = 0;

  if (!blob) {
    throw new Error("The browser could not encode the image.");
  }
  return blob;
}

type Attempt = { blob: Blob; quality: number };

/**
 * Highest-quality blob at or under `targetBytes`, plus the smallest blob seen
 * so a hopeless target can still return the best available effort.
 */
async function searchQuality(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  targetBytes: number,
  onPass?: () => void
) {
  let low = QUALITY_FLOOR;
  let high = QUALITY_CEILING;
  let fits: Attempt | null = null;
  let smallest: Attempt | null = null;

  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const quality = (low + high) / 2;
    onPass?.();
    const blob = await encode(bitmap, width, height, mime, quality);

    if (!smallest || blob.size < smallest.blob.size) {
      smallest = { blob, quality };
    }

    if (blob.size <= targetBytes) {
      /* Fits -- keep it only if it is the largest fitting blob so far, then
         reach for better quality. */
      if (!fits || blob.size > fits.blob.size) {
        fits = { blob, quality };
      }
      low = quality;
    } else {
      high = quality;
    }
  }

  return { fits, smallest };
}

export async function compressToTarget(
  file: File,
  targetBytes: number,
  format: OutputFormat,
  /** Fires before each encode. A 25 MP source takes seconds, so the caller
   *  needs something to show rather than a frozen button. */
  onPass?: (pass: number) => void
): Promise<CompressionResult> {
  const startedAt = performance.now();
  const mime = await resolveFormat(format);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file could not be decoded as an image.");
  }

  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;

  try {
    let scale = 1;
    let passes = 0;
    let fallback: (Attempt & { width: number; height: number }) | null = null;

    for (let attempt = 0; attempt < MAX_SCALE_ATTEMPTS; attempt += 1) {
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));

      const { fits, smallest } = await searchQuality(
        bitmap,
        width,
        height,
        mime,
        targetBytes,
        () => {
          passes += 1;
          onPass?.(passes);
        }
      );

      if (fits) {
        return {
          blob: fits.blob,
          quality: fits.quality,
          width,
          height,
          sourceWidth,
          sourceHeight,
          downscaled: scale < 1,
          hitTarget: true,
          durationMs: Math.round(performance.now() - startedAt),
        };
      }

      if (smallest && (!fallback || smallest.blob.size < fallback.blob.size)) {
        fallback = { ...smallest, width, height };
      }

      /* Once a single pixel row would be next, shrinking has nothing left. */
      if (width <= 16 || height <= 16) {
        break;
      }
      scale *= SCALE_STEP;
    }

    if (!fallback) {
      throw new Error("Compression produced no usable output.");
    }

    return {
      blob: fallback.blob,
      quality: fallback.quality,
      width: fallback.width,
      height: fallback.height,
      sourceWidth,
      sourceHeight,
      downscaled: fallback.width < sourceWidth,
      hitTarget: false,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    bitmap.close();
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}
