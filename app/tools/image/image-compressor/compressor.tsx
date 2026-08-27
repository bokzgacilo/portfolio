"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordToolOutput, usageKey } from "@/app/tools/usage";
import { ToolDownloadSuccess } from "@/app/tools/tool-download-success";

import {
  type CompressionResult,
  type OutputFormat,
  SUPPORTED_INPUT,
  compressToTarget,
  formatBytes,
  formatDuration,
} from "./compress";

/** Largest source file we will decode in the browser. */
const MAX_INPUT_BYTES = 40 * 1024 * 1024;

/* The target slider spans 30% of the source file up to the file itself.
   Below 30% is where quality collapses for most photographs, and above 100%
   there is nothing to compress.

   The slider carries a percentage rather than a byte count: a byte-valued
   range quantises to min + n*step, so the top stop lands short of the file
   size and the control can never actually reach 100%. */
const MIN_TARGET_PCT = 30;
const DEFAULT_TARGET_PCT = 50;
const TARGET_PCT_STEP = 0.5;

type Phase = "idle" | "ready" | "working" | "done" | "archiving" | "archived";

/** Kept after the blob is discarded so the receipt can still be rendered. */
type Receipt = {
  name: string;
  originalBytes: number;
  compressedBytes: number;
  durationMs: number;
  width: number;
  height: number;
  format: string;
  archivedAt: string;
};

const field = cn(
  "min-h-11 rounded-full border-border bg-card px-4 py-[0.65rem]",
  "text-base text-foreground md:text-base"
);
const fieldLabel = "grid gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";

const FORMATS: ReadonlyArray<{ value: OutputFormat; label: string }> = [
  { value: "auto", label: "Auto (best available)" },
  { value: "image/webp", label: "WebP" },
  { value: "image/jpeg", label: "JPEG" },
];

function extensionFor(mime: string) {
  return mime === "image/webp" ? "webp" : "jpg";
}

function outputName(name: string, mime: string) {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}-compressed.${extensionFor(mime)}`;
}

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [pass, setPass] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [targetPct, setTargetPct] = useState(DEFAULT_TARGET_PCT);
  const [format, setFormat] = useState<OutputFormat>("auto");

  const inputRef = useRef<HTMLInputElement>(null);

  /* Object URLs are revoked by the effect that owns them, so switching files
     or unmounting mid-flow cannot leak a blob. */
  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (!resultUrl) return;
    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const reset = useCallback(() => {
    setFile(null);
    setSourceUrl(null);
    setResult(null);
    setResultUrl(null);
    setReceipt(null);
    setError(null);
    setPhase("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const accept = useCallback((next: File) => {
    if (!SUPPORTED_INPUT.includes(next.type)) {
      setError(`${next.type || "That file type"} is not a supported image.`);
      return;
    }
    if (next.size > MAX_INPUT_BYTES) {
      setError(`That file is ${formatBytes(next.size)}. The limit is 40 MB.`);
      return;
    }

    setError(null);
    setResult(null);
    setResultUrl(null);
    setReceipt(null);
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
    setPhase("ready");
  }, []);

  async function handleCompress() {
    if (!file || targetBytes === null) return;

    setPhase("working");
    setError(null);
    setResult(null);
    setResultUrl(null);
    setPass(0);

    try {
      const next = await compressToTarget(file, targetBytes, format, setPass);
      setResult(next);
      setResultUrl(URL.createObjectURL(next.blob));
      recordToolOutput(usageKey("image", "image-compressor"));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Compression failed.");
      setPhase("ready");
    }
  }

  async function handleDownload() {
    if (!file || !result) return;

    setPhase("archiving");
    setError(null);

    const body = new FormData();
    const name = outputName(file.name, result.blob.type);
    body.append("file", result.blob, name);
    body.append("originalName", file.name);
    body.append("originalBytes", String(file.size));
    body.append("targetBytes", String(targetBytes ?? ""));
    body.append("quality", result.quality.toFixed(3));
    body.append("width", String(result.width));
    body.append("height", String(result.height));
    body.append("durationMs", String(result.durationMs));

    try {
      const link = document.createElement("a");
      const href = URL.createObjectURL(result.blob);
      link.href = href;
      link.download = name;
      link.click();
      URL.revokeObjectURL(href);

      /* Archive after download. Storage problems should not block the user
         from receiving the compressed file they already made in-browser. */
      const response = await fetch("/api/tools/image-compressor", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => ({}))) as {
        archivedAt?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? `Archive failed (${response.status}).`);
      }

      setReceipt({
        name,
        originalBytes: file.size,
        compressedBytes: result.blob.size,
        durationMs: result.durationMs,
        width: result.width,
        height: result.height,
        format: result.blob.type,
        archivedAt: payload.archivedAt ?? new Date().toISOString(),
      });

      /* The point of no return: the compressed blob and its preview URL are
         dropped, so the file exists only in the visitor's downloads folder
         and in the archive bucket. */
      setResult(null);
      setResultUrl(null);
      setFile(null);
      setSourceUrl(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setPhase("archived");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `${cause.message} Your compressed file was still downloaded.`
          : "Archive failed. Your compressed file was still downloaded."
      );
      setPhase("done");
    }
  }

  /* Percent is the source of truth; bytes are derived, so the endpoints are
     exactly 30% and exactly the original file size. */
  const targetBytes = file ? Math.round((file.size * targetPct) / 100) : null;
  const minTarget = file ? Math.round((file.size * MIN_TARGET_PCT) / 100) : 0;
  /* WebKit cannot paint a filled track on its own -- see .range-editorial. */
  const fillPct = ((targetPct - MIN_TARGET_PCT) / (100 - MIN_TARGET_PCT)) * 100;

  const savedBytes = file && result ? file.size - result.blob.size : 0;
  const savedPct = file && result ? (savedBytes / file.size) * 100 : 0;
  /* A target at or near 100% can re-encode larger than the source. Clamping
     that to "0 B saved" next to a negative percentage would read as a bug, so
     say what actually happened. */
  const savedLabel =
    savedBytes > 0
      ? `${formatBytes(savedBytes)} · ${savedPct.toFixed(1)}%`
      : `No saving · ${formatBytes(Math.abs(savedBytes))} larger`;

  return (
    <div className="grid grid-cols-[minmax(0,1.02fr)_minmax(300px,0.98fr)] border-t border-l border-border max-[900px]:grid-cols-[minmax(0,1fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Canvas: dropzone, preview, or receipt                            */}
      {/* ---------------------------------------------------------------- */}
      <div className="min-w-0 border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.6rem)]">
        {phase === "archived" && receipt ? (
          <ToolDownloadSuccess
            eyebrow="Archived & downloaded"
            fileName={receipt.name}
            toolName="Image Compressor"
            body="The compressed copy has been cleared from this page. It is no longer available here; the archived original of this conversion lives in private storage for retrieval."
            actionLabel="Compress another image"
            onAction={reset}
          />
        ) : sourceUrl ? (
          <div className="grid gap-4">
            <div className="relative grid min-h-[220px] w-full min-w-0 place-items-center overflow-hidden border border-border bg-card max-[900px]:min-h-[260px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="block max-h-[420px] w-full max-w-full object-contain max-[900px]:max-h-[50vh]"
                src={resultUrl ?? sourceUrl}
                alt={result ? "Compressed result preview" : "Selected image preview"}
              />
              <span className="mono-label absolute top-3 left-3 rounded-full border border-border bg-[rgb(255_253_248/0.9)] px-[0.62rem] py-[0.32rem] text-brand-dark backdrop-blur-md">
                {result ? "Compressed" : "Original"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="min-w-0 truncate text-[0.95rem] font-semibold text-foreground">
                {file?.name}
              </span>
              <button
                className="mono-label flex-none cursor-pointer border-0 bg-transparent text-brand-dark underline decoration-border underline-offset-[0.35em]"
                type="button"
                onClick={reset}
              >
                Remove
              </button>
            </div>
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
              accept={SUPPORTED_INPUT.join(",")}
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (picked) accept(picked);
              }}
            />
            <span className="grid max-w-[34ch] justify-items-center gap-3">
              <span className="display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1]">
                Drop an image here
              </span>
              <span className="text-muted-foreground">
                or click to choose a file. JPG, PNG, WebP, or AVIF up to 40 MB.
              </span>
              <span className="mono-label mt-1 text-brand">
                Compression runs in your browser
              </span>
            </span>
          </label>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Settings, stats, and the download CTA                            */}
      {/* ---------------------------------------------------------------- */}
      <aside className="grid min-w-0 content-start gap-[1.5rem] border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="grid gap-[1.1rem]">
          <h2 className="text-[0.95rem] font-extrabold text-foreground">
            Compression settings
          </h2>

          <div className="grid gap-[0.45rem]">
            <div className="flex items-baseline justify-between gap-3">
              <label className={fieldLabelText} htmlFor="target-size">
                Target size
              </label>
              {file && targetBytes ? (
                <span className="font-[750] text-foreground">
                  {formatBytes(targetBytes)}{" "}
                  <span className="mono-label text-muted-foreground">
                    {targetPct}%
                  </span>
                </span>
              ) : null}
            </div>

            <input
              className="range-editorial"
              id="target-size"
              type="range"
              min={MIN_TARGET_PCT}
              max={100}
              step={TARGET_PCT_STEP}
              value={targetPct}
              disabled={!file}
              style={{ "--range-fill": `${fillPct}%` } as CSSProperties}
              onChange={(event) => setTargetPct(Number(event.target.value))}
              aria-valuetext={
                targetBytes ? `${formatBytes(targetBytes)}, ${targetPct}% of original` : undefined
              }
            />

            {file ? (
              <div className="flex items-baseline justify-between gap-3">
                <span className="mono-label text-muted-foreground">
                  {formatBytes(minTarget)} · {MIN_TARGET_PCT}%
                </span>
                <span className="mono-label text-muted-foreground">
                  {formatBytes(file.size)} · original
                </span>
              </div>
            ) : (
              <p className="text-[0.88rem] leading-[1.5] text-muted-foreground">
                Choose an image first — the range is set from its file size.
              </p>
            )}
          </div>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Output format</span>
            <select
              className={cn(
                field,
                "select-caret w-full cursor-pointer appearance-none border pr-7 outline-none focus:border-foreground"
              )}
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
            >
              {FORMATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="editorial-primary"
            size="pill"
            className="w-fit border-0"
            onClick={handleCompress}
            disabled={!file || targetBytes === null || phase === "working" || phase === "archiving"}
          >
            {phase === "working" ? `Compressing… pass ${pass}` : "Compress image"}
          </Button>

          {phase === "working" ? (
            <p className="text-[0.88rem] leading-[1.5] text-muted-foreground" role="status">
              Searching for the best quality that fits. A large photo can take
              a few seconds per pass.
            </p>
          ) : null}
        </div>

        {error ? (
          <p
            className="border-t border-border pt-[1.1rem] text-[0.95rem] leading-[1.5] text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Live stats for the finished compression. */}
        {phase === "done" || phase === "archiving" ? (
          file && result ? (
            <div className="grid gap-[1.1rem] border-t border-border pt-[1.2rem]">
              {!result.hitTarget ? (
                <p className="text-[0.92rem] leading-[1.5] text-muted-foreground">
                  Could not reach {formatBytes(targetBytes ?? 0)} without
                  destroying the image. This is the smallest usable result.
                </p>
              ) : null}

              <dl className="grid gap-[0.85rem]">
                {(
                  [
                    ["Original", formatBytes(file.size)],
                    ["Compressed", formatBytes(result.blob.size)],
                    ["Saved", savedLabel],
                    ["Dimensions", `${result.width} × ${result.height}`],
                    ["Took", formatDuration(result.durationMs)],
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

              <Button
                variant="cta-filled"
                size="pill-cta"
                className="w-fit"
                onClick={handleDownload}
                disabled={phase === "archiving"}
              >
                {phase === "archiving" ? "Saving…" : "Download"}
                <ButtonArrow />
              </Button>
              <p className="text-[0.88rem] leading-[1.5] text-muted-foreground">
                Downloading archives a copy to private storage and clears the
                file from this page.
              </p>
            </div>
          ) : null
        ) : null}

        {/* Receipt for the archived conversion. */}
        {phase === "archived" && receipt ? (
          <dl className="grid gap-[0.85rem] border-t border-border pt-[1.2rem]">
            {(
              [
                ["Original", formatBytes(receipt.originalBytes)],
                ["Compressed", formatBytes(receipt.compressedBytes)],
                [
                  "Saved",
                  receipt.originalBytes > receipt.compressedBytes
                    ? `${formatBytes(receipt.originalBytes - receipt.compressedBytes)} · ${(
                        ((receipt.originalBytes - receipt.compressedBytes) /
                          receipt.originalBytes) *
                        100
                      ).toFixed(1)}%`
                    : "No saving",
                ],
                ["Dimensions", `${receipt.width} × ${receipt.height}`],
                ["Took", formatDuration(receipt.durationMs)],
                [
                  "Archived",
                  new Date(receipt.archivedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                ],
              ] as const
            ).map(([label, value]) => (
              <div
                className="flex items-baseline justify-between gap-4 border-b border-border pb-[0.55rem]"
                key={label}
              >
                <dt className="mono-label text-muted-foreground">{label}</dt>
                <dd className="text-right font-[750] text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </aside>
    </div>
  );
}
