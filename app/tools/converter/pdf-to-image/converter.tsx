"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, FileArchive, FileText, RotateCcw } from "lucide-react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ToolDownloadSuccess } from "@/app/tools/tool-download-success";
import { recordToolOutput, usageKey } from "@/app/tools/usage";

import {
  type PdfImageFormat,
  type PdfPagePreview,
  type PdfToImageResult,
  convertPdfToImageZip,
  formatBytes,
  formatDuration,
  formatLabel,
  renderPdfPagePreviews,
} from "./convert";

const MAX_INPUT_BYTES = 80 * 1024 * 1024;

type Phase = "idle" | "ready" | "working" | "done" | "downloaded";
type PageMode = "all" | "selected";
type PreviewPhase = "idle" | "working" | "done";

const field = cn(
  "min-h-11 rounded-full border border-border bg-card px-4 py-[0.65rem]",
  "text-base text-foreground outline-none focus:border-foreground md:text-base"
);
const fieldLabel = "grid gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";

const FORMATS: ReadonlyArray<{ value: PdfImageFormat; label: string; hint: string }> = [
  { value: "image/png", label: "PNG", hint: "Best for text, line art, and sharp screenshots" },
  { value: "image/jpeg", label: "JPG", hint: "Smaller output for scan-heavy or photo PDFs" },
];

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function PdfToImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PdfToImageResult | null>(null);
  const [downloadedName, setDownloadedName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [previewPhase, setPreviewPhase] = useState<PreviewPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState<PdfImageFormat>("image/png");
  const [dpi, setDpi] = useState(144);
  const [quality, setQuality] = useState(0.9);
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);
  const [previewProgress, setPreviewProgress] = useState<{ page: number; total: number } | null>(null);
  const [previews, setPreviews] = useState<PdfPagePreview[]>([]);
  const [pageMode, setPageMode] = useState<PageMode>("all");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const previewRunRef = useRef(0);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setDownloadedName(null);
    setError(null);
    setPhase("idle");
    setPreviewPhase("idle");
    setDragging(false);
    setProgress(null);
    setPreviewProgress(null);
    setPageMode("all");
    setSelectedPages([]);
    setPreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));
      return [];
    });
    previewRunRef.current += 1;
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const clearOutput = useCallback(() => {
    setResult(null);
    setDownloadedName(null);
    setProgress(null);
    setPhase(file ? "ready" : "idle");
  }, [file]);

  const loadPreviews = useCallback(async (next: File) => {
    const run = previewRunRef.current + 1;
    previewRunRef.current = run;
    setPreviewPhase("working");
    setPreviewProgress(null);

    try {
      const nextPreviews = await renderPdfPagePreviews(next, (page, total) => {
        if (previewRunRef.current === run) setPreviewProgress({ page, total });
      });
      if (previewRunRef.current !== run) {
        nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        return;
      }
      setPreviews((current) => {
        current.forEach((preview) => URL.revokeObjectURL(preview.url));
        return nextPreviews;
      });
      setSelectedPages(nextPreviews.map((preview) => preview.pageNumber));
      setPreviewPhase("done");
    } catch (cause) {
      if (previewRunRef.current !== run) return;
      setError(cause instanceof Error ? cause.message : "Could not render PDF previews.");
      setPreviewPhase("idle");
      setPhase("ready");
    }
  }, []);

  const accept = useCallback((next: File) => {
    if (!isPdf(next)) {
      setError(`${next.type || "That file type"} is not a PDF.`);
      return;
    }
    if (next.size > MAX_INPUT_BYTES) {
      setError(`That file is ${formatBytes(next.size)}. The limit is 80 MB.`);
      return;
    }

    setError(null);
    setResult(null);
    setDownloadedName(null);
    setProgress(null);
    setPreviewProgress(null);
    setPreviewPhase("idle");
    setPageMode("all");
    setSelectedPages([]);
    setPreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));
      return [];
    });
    setFile(next);
    setPhase("ready");
    void loadPreviews(next);
  }, [loadPreviews]);

  const togglePage = useCallback((pageNumber: number) => {
    clearOutput();
    setPageMode("selected");
    setSelectedPages((current) =>
      current.includes(pageNumber)
        ? current.filter((page) => page !== pageNumber)
        : [...current, pageNumber].sort((a, b) => a - b)
    );
  }, [clearOutput]);

  const selectAllPages = useCallback(() => {
    clearOutput();
    setSelectedPages(previews.map((preview) => preview.pageNumber));
  }, [clearOutput, previews]);

  const clearSelectedPages = useCallback(() => {
    clearOutput();
    setSelectedPages([]);
    setPageMode("selected");
  }, [clearOutput]);

  async function handleConvert() {
    if (!file) return;

    setPhase("working");
    setError(null);
    setResult(null);
    setDownloadedName(null);
    setProgress(null);

    try {
      const next = await convertPdfToImageZip(file, {
        dpi,
        format,
        quality,
        pages: pageMode === "selected" ? selectedPages : undefined,
        onPage: (page, total) => setProgress({ page, total }),
      });
      setResult(next);
      recordToolOutput(usageKey("converter", "pdf-to-image"));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PDF conversion failed.");
      setPhase("ready");
    }
  }

  function handleDownload() {
    if (!result) return;

    const link = document.createElement("a");
    const href = URL.createObjectURL(result.blob);
    link.href = href;
    link.download = result.fileName;
    link.click();
    URL.revokeObjectURL(href);
    setDownloadedName(result.fileName);
    setPhase("downloaded");
  }

  const selectedFormat = FORMATS.find((option) => option.value === format) ?? FORMATS[0];
  const outputPages = pageMode === "selected" ? selectedPages.length : previews.length;
  const canConvert =
    Boolean(file) &&
    phase !== "working" &&
    previewPhase !== "working" &&
    (pageMode === "all" || selectedPages.length > 0);
  const busyLabel = progress
    ? `Rendering page ${progress.page} of ${progress.total}`
    : "Reading PDF...";
  const previewLabel = previewProgress
    ? `Previewing page ${previewProgress.page} of ${previewProgress.total}`
    : "Preparing previews...";

  return (
    <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] border-t border-l border-border max-[900px]:grid-cols-[minmax(0,1fr)]">
      <div className="min-w-0 border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.6rem)]">
        {phase === "downloaded" && downloadedName ? (
          <ToolDownloadSuccess
            eyebrow="ZIP downloaded locally"
            fileName={downloadedName}
            toolName="PDF to Image"
            body="The PDF pages were rendered in your browser and saved as one image per page inside the ZIP file."
            actionLabel="Convert another PDF"
            onAction={reset}
          />
        ) : file ? (
          <div className="grid gap-4">
            <div className="relative grid min-h-[340px] w-full min-w-0 place-items-center overflow-hidden border border-border bg-card max-[900px]:min-h-[260px]">
              <div className="grid max-w-[38ch] justify-items-center gap-3 p-6 text-center">
                <FileText className="size-11 text-brand" strokeWidth={1.7} aria-hidden="true" />
                <span className="display text-[clamp(1.55rem,2.6vw,2.15rem)] leading-[1.08]">
                  {file.name}
                </span>
                <span className="text-muted-foreground">
                  {phase === "working"
                    ? busyLabel
                    : previewPhase === "working"
                      ? previewLabel
                      : `${outputPages || "All"} ${outputPages === 1 ? "page" : "pages"} ready for export.`}
                </span>
                {phase === "working" && progress ? (
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${Math.round((progress.page / progress.total) * 100)}%` }}
                    />
                  </div>
                ) : null}
              </div>
              <span className="mono-label absolute top-3 left-3 rounded-full border border-border bg-[rgb(255_253_248/0.9)] px-[0.62rem] py-[0.32rem] text-brand-dark backdrop-blur-md">
                PDF
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="min-w-0 truncate text-[0.95rem] font-semibold text-foreground">
                {formatBytes(file.size)}
              </span>
              <button
                className="mono-label flex-none cursor-pointer border-0 bg-transparent text-brand-dark underline decoration-border underline-offset-[0.35em]"
                type="button"
                onClick={reset}
              >
                Remove
              </button>
            </div>
            {previews.length > 0 || previewPhase === "working" ? (
              <div className="grid gap-3 border border-border bg-[rgb(255_253_248/0.56)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[0.95rem] font-extrabold text-foreground">
                    Page preview
                  </h3>
                  <span className="mono-label text-muted-foreground">
                    {previewPhase === "working"
                      ? previewLabel
                      : `${selectedPages.length}/${previews.length} selected`}
                  </span>
                </div>
                {previewPhase === "working" ? (
                  <div className="grid min-h-[150px] place-items-center border border-dashed border-border text-center text-[0.95rem] text-muted-foreground">
                    {previewLabel}
                  </div>
                ) : (
                  <div className="grid max-h-[520px] grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-3 overflow-y-auto pr-1">
                    {previews.map((preview) => {
                      const selected =
                        pageMode === "all" || selectedPages.includes(preview.pageNumber);

                      return (
                        <button
                          className={cn(
                            "group/page grid cursor-pointer gap-2 border bg-card p-2 text-left transition-[border-color,background-color,transform]",
                            selected
                              ? "border-foreground bg-[rgb(255_253_248/0.94)]"
                              : "border-border hover:border-foreground"
                          )}
                          key={preview.pageNumber}
                          type="button"
                          onClick={() => togglePage(preview.pageNumber)}
                          aria-pressed={selected}
                        >
                          <span className="relative block overflow-hidden border border-border bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="block aspect-[3/4] w-full object-contain"
                              src={preview.url}
                              alt={`PDF page ${preview.pageNumber} preview`}
                            />
                            {selected ? (
                              <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_18px_rgb(21_20_18/0.18)]">
                                <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                              </span>
                            ) : null}
                          </span>
                          <span className="mono-label flex items-center justify-between gap-2 text-muted-foreground">
                            Page {preview.pageNumber}
                            <span>{selected ? "On" : "Off"}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <label
            className={cn(
              "grid min-h-[340px] cursor-pointer place-items-center border border-dashed p-6 text-center transition-colors",
              dragging
                ? "border-foreground bg-[rgb(255_253_248/0.8)]"
                : "border-border hover:bg-[rgb(255_253_248/0.6)]"
            )}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const dropped = event.dataTransfer.files?.[0];
              if (dropped) accept(dropped);
            }}
          >
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (picked) accept(picked);
              }}
            />
            <span className="grid max-w-[34ch] justify-items-center gap-3">
              <FileArchive className="size-9 text-brand" strokeWidth={1.8} aria-hidden="true" />
              <span className="display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1]">
                Upload PDF
              </span>
              <span className="text-muted-foreground">
                Drop a PDF here, or click to choose one. Each page becomes its own image in a ZIP.
              </span>
              <span className="mono-label mt-1 text-brand">Runs in your browser</span>
            </span>
          </label>
        )}
      </div>

      <aside className="grid min-w-0 content-start gap-[1.5rem] border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="grid gap-[1.1rem]">
          <h2 className="text-[0.95rem] font-extrabold text-foreground">Export settings</h2>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Pages</span>
            <select
              className={cn(field, "select-caret w-full cursor-pointer appearance-none pr-7")}
              value={pageMode}
              onChange={(event) => {
                setPageMode(event.target.value as PageMode);
                clearOutput();
              }}
            >
              <option value="all">All pages</option>
              <option value="selected">Selected pages</option>
            </select>
          </label>

          {pageMode === "selected" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="editorial"
                size="sm"
                className="rounded-full"
                type="button"
                onClick={selectAllPages}
              >
                Select all
              </Button>
              <Button
                variant="editorial"
                size="sm"
                className="rounded-full"
                type="button"
                onClick={clearSelectedPages}
              >
                Clear
              </Button>
            </div>
          ) : null}

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Image type</span>
            <select
              className={cn(field, "select-caret w-full cursor-pointer appearance-none pr-7")}
              value={format}
              onChange={(event) => {
                setFormat(event.target.value as PdfImageFormat);
                clearOutput();
              }}
            >
              {FORMATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Render DPI</span>
            <select
              className={cn(field, "select-caret w-full cursor-pointer appearance-none pr-7")}
              value={dpi}
              onChange={(event) => {
                setDpi(Number(event.target.value));
                clearOutput();
              }}
            >
              <option value={96}>96 DPI</option>
              <option value={144}>144 DPI</option>
              <option value={200}>200 DPI</option>
              <option value={300}>300 DPI</option>
            </select>
          </label>

          {format === "image/jpeg" ? (
            <label className={fieldLabel}>
              <span className={fieldLabelText}>JPG quality</span>
              <input
                className="accent-primary"
                type="range"
                min="0.6"
                max="0.95"
                step="0.05"
                value={quality}
                onChange={(event) => {
                  setQuality(Number(event.target.value));
                  clearOutput();
                }}
              />
              <span className="text-[0.9rem] text-muted-foreground">
                {Math.round(quality * 100)}%
              </span>
            </label>
          ) : null}

          <p className="text-[0.9rem] leading-[1.5] text-muted-foreground">
            {selectedFormat.hint}. Higher DPI creates sharper pages and a larger ZIP.
          </p>

          <Button
            variant="editorial-primary"
            size="pill"
            className="w-fit border-0"
            onClick={handleConvert}
            disabled={!canConvert}
          >
            {phase === "working" ? busyLabel : "Convert PDF"}
          </Button>
        </div>

        {error ? (
          <p
            className="border-t border-border pt-[1.1rem] text-[0.95rem] leading-[1.5] text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {file ? (
          <dl className="grid gap-[0.85rem] border-t border-border pt-[1.2rem]">
            {(
              [
                ["Source", "PDF"],
                ["File size", formatBytes(file.size)],
                ["Pages", pageMode === "selected" ? String(selectedPages.length) : "All"],
                ["Output", `${formatLabel(format)} images`],
                ["DPI", String(dpi)],
                ...(result
                  ? [
                      ["Exported", String(result.pageCount)],
                      ["ZIP size", formatBytes(result.outputBytes)],
                      ["Took", formatDuration(result.durationMs)],
                    ]
                  : []),
              ] as const
            ).map(([label, value]) => (
              <div
                className="flex min-w-0 items-baseline justify-between gap-4 border-b border-border pb-[0.55rem]"
                key={label}
              >
                <dt className="mono-label text-muted-foreground">{label}</dt>
                <dd className="text-right font-[750] text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {phase === "done" && result ? (
          <div className="grid gap-[0.85rem] border-t border-border pt-[1.2rem]">
            <Button
              variant="cta-filled"
              size="pill-cta"
              className="w-fit"
              onClick={handleDownload}
            >
              <Download aria-hidden="true" />
              Download ZIP
              <ButtonArrow />
            </Button>
            <Button variant="editorial" size="pill" className="w-fit" onClick={clearOutput}>
              <RotateCcw aria-hidden="true" />
              Change settings
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
