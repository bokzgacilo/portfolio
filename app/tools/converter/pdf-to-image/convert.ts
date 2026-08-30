"use client";

import { zipSync } from "fflate";

export type PdfImageFormat = "image/png" | "image/jpeg";

export type PdfToImageOptions = {
  dpi: number;
  format: PdfImageFormat;
  quality: number;
  pages?: number[];
  onPage?: (page: number, total: number) => void;
};

export type PdfPagePreview = {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
};

export type PdfToImageResult = {
  blob: Blob;
  fileName: string;
  pageCount: number;
  durationMs: number;
  outputBytes: number;
  format: PdfImageFormat;
  dpi: number;
};

const PDF_TO_CSS_PIXEL_SCALE = 1 / 72;
const PREVIEW_WIDTH = 180;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  return pdfjs;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

export function extensionFor(format: PdfImageFormat) {
  return format === "image/jpeg" ? "jpg" : "png";
}

export function formatLabel(format: PdfImageFormat) {
  return format === "image/jpeg" ? "JPG" : "PNG";
}

export function zipName(name: string) {
  const base = name.replace(/\.[^./\\]+$/, "") || "pdf-pages";
  return `${base}-images.zip`;
}

function pageImageName(baseName: string, page: number, total: number, format: PdfImageFormat) {
  const base = baseName.replace(/\.[^./\\]+$/, "") || "page";
  const width = Math.max(2, String(total).length);
  return `${base}-page-${String(page).padStart(width, "0")}.${extensionFor(format)}`;
}

function blobFromCanvas(canvas: HTMLCanvasElement, format: PdfImageFormat, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("The browser could not encode a rendered page."));
        }
      },
      format,
      format === "image/jpeg" ? quality : undefined
    );
  });
}

export async function convertPdfToImageZip(
  file: File,
  options: PdfToImageOptions
): Promise<PdfToImageResult> {
  const startedAt = performance.now();
  const pdfjs = await loadPdfjs();

  const data = await file.arrayBuffer();
  const documentTask = pdfjs.getDocument({ data });
  const pdf = await documentTask.promise;
  const pageCount = pdf.numPages;
  const files: Record<string, Uint8Array> = {};
  const scale = Math.max(72, options.dpi) * PDF_TO_CSS_PIXEL_SCALE;
  const pages = (options.pages?.length ? options.pages : Array.from({ length: pageCount }, (_, index) => index + 1))
    .filter((page) => Number.isInteger(page) && page >= 1 && page <= pageCount)
    .filter((page, index, list) => list.indexOf(page) === index);

  if (pages.length === 0) {
    throw new Error("Select at least one page to export.");
  }

  try {
    for (const [index, pageNumber] of pages.entries()) {
      options.onPage?.(index + 1, pages.length);
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const context = canvas.getContext("2d", { alpha: options.format !== "image/jpeg" });
      if (!context) {
        throw new Error("This browser would not provide a 2D canvas context.");
      }

      if (options.format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const blob = await blobFromCanvas(canvas, options.format, options.quality);
      const imageData = new Uint8Array(await blob.arrayBuffer());
      files[pageImageName(file.name, pageNumber, pageCount, options.format)] = imageData;

      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    const zipped = zipSync(files, { level: 6 });
    const blob = new Blob([zipped], { type: "application/zip" });

    return {
      blob,
      fileName: zipName(file.name),
      pageCount: pages.length,
      durationMs: Math.round(performance.now() - startedAt),
      outputBytes: blob.size,
      format: options.format,
      dpi: options.dpi,
    };
  } finally {
    documentTask.destroy();
  }
}

export async function renderPdfPagePreviews(
  file: File,
  onPage?: (page: number, total: number) => void
): Promise<PdfPagePreview[]> {
  const pdfjs = await loadPdfjs();
  const data = await file.arrayBuffer();
  const documentTask = pdfjs.getDocument({ data });
  const pdf = await documentTask.promise;
  const previews: PdfPagePreview[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      onPage?.(pageNumber, pdf.numPages);
      const page = await pdf.getPage(pageNumber);
      const unscaled = page.getViewport({ scale: 1 });
      const scale = PREVIEW_WIDTH / unscaled.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("This browser would not provide a 2D canvas context.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const blob = await blobFromCanvas(canvas, "image/jpeg", 0.72);

      previews.push({
        pageNumber,
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
      });

      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return previews;
  } finally {
    documentTask.destroy();
  }
}
