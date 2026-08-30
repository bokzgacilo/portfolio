"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileImage, RotateCcw } from "lucide-react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ToolDownloadSuccess } from "@/app/tools/tool-download-success";
import { recordToolOutput, usageKey } from "@/app/tools/usage";

import {
  SUPPORTED_INPUT,
  type ConvertFormat,
  type ConvertResult,
  convertImage,
  convertedName,
  formatBytes,
  formatDuration,
  formatLabel,
  isSupportedInput,
} from "./convert";

const MAX_INPUT_BYTES = 40 * 1024 * 1024;

type Phase = "idle" | "ready" | "working" | "done" | "downloaded";

const field = cn(
  "min-h-11 rounded-full border border-border bg-card px-4 py-[0.65rem]",
  "text-base text-foreground outline-none focus:border-foreground md:text-base"
);
const fieldLabel = "grid gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";

const FORMATS: ReadonlyArray<{ value: ConvertFormat; label: string; hint: string }> = [
  { value: "image/png", label: "PNG", hint: "Lossless, keeps transparency" },
  { value: "image/jpeg", label: "JPEG", hint: "Small photo format, white matte" },
  { value: "image/webp", label: "WebP", hint: "Modern web image format" },
];

function usesServer(file: File | null) {
  return Boolean(file && (file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name)));
}

export function ImageExtensionConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [downloadedName, setDownloadedName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState<ConvertFormat>("image/png");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  const reset = useCallback(() => {
    setFile(null);
    setSourceUrl(null);
    setResult(null);
    setDownloadedName(null);
    setError(null);
    setPhase("idle");
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const clearOutput = useCallback(() => {
    setResult(null);
    setDownloadedName(null);
    setPhase(file ? "ready" : "idle");
  }, [file]);

  const accept = useCallback((next: File) => {
    if (!isSupportedInput(next)) {
      setError(`${next.type || "That file type"} is not a supported image.`);
      return;
    }
    if (next.size > MAX_INPUT_BYTES) {
      setError(`That file is ${formatBytes(next.size)}. The limit is 40 MB.`);
      return;
    }

    setError(null);
    setResult(null);
    setDownloadedName(null);
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
    setPhase("ready");
  }, []);

  async function handleConvert() {
    if (!file) return;

    setPhase("working");
    setError(null);
    setResult(null);
    setDownloadedName(null);

    try {
      const next = await convertImage(file, format);
      setResult(next);
      recordToolOutput(usageKey("image", "image-extension-converter"));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Conversion failed.");
      setPhase("ready");
    }
  }

  function handleDownload() {
    if (!file || !result) return;

    const name = convertedName(file.name, result.format);
    const link = document.createElement("a");
    const href = URL.createObjectURL(result.blob);
    link.href = href;
    link.download = name;
    link.click();
    URL.revokeObjectURL(href);
    setDownloadedName(name);
    setPhase("downloaded");
  }

  const selectedFormat = FORMATS.find((option) => option.value === format) ?? FORMATS[0];
  const serverConversion = usesServer(file);

  return (
    <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] border-t border-l border-border max-[900px]:grid-cols-[minmax(0,1fr)]">
      <div className="min-w-0 border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.6rem)]">
        {phase === "downloaded" && downloadedName ? (
          <ToolDownloadSuccess
            eyebrow="Downloaded locally"
            fileName={downloadedName}
            toolName="Image Extension Converter"
            body="The converted copy was created in your browser and downloaded to your device. Nothing was uploaded or stored by this page."
            actionLabel="Convert another image"
            onAction={reset}
          />
        ) : sourceUrl ? (
          <div className="grid gap-4">
            <div className="relative grid min-h-[300px] w-full min-w-0 place-items-center overflow-hidden border border-border bg-card max-[900px]:min-h-[260px]">
              {serverConversion ? (
                <div className="grid max-w-[34ch] justify-items-center gap-3 p-6 text-center">
                  <FileImage className="size-10 text-brand" aria-hidden="true" />
                  <span className="display text-[clamp(1.45rem,2.5vw,2rem)] leading-[1.08]">
                    HEIC selected
                  </span>
                  <span className="text-muted-foreground">
                    This file will be decoded by the backend before download.
                  </span>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className="block max-h-[460px] w-full max-w-full object-contain max-[900px]:max-h-[50vh]"
                  src={sourceUrl}
                  alt="Selected image preview"
                />
              )}
              <span className="mono-label absolute top-3 left-3 rounded-full border border-border bg-[rgb(255_253_248/0.9)] px-[0.62rem] py-[0.32rem] text-brand-dark backdrop-blur-md">
                Original
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
              <FileImage className="size-9 text-brand" aria-hidden="true" />
              <span className="display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1]">
                Upload original image
              </span>
              <span className="text-muted-foreground">
                Drop a JPG, PNG, WebP, AVIF, HEIC, or HEIF here, or click to choose one.
              </span>
              <span className="mono-label mt-1 text-brand">
                HEIC uses the backend
              </span>
            </span>
          </label>
        )}
      </div>

      <aside className="grid min-w-0 content-start gap-[1.5rem] border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="grid gap-[1.1rem]">
          <h2 className="text-[0.95rem] font-extrabold text-foreground">
            Conversion settings
          </h2>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Target extension</span>
            <select
              className={cn(
                field,
                "select-caret w-full cursor-pointer appearance-none pr-7"
              )}
              value={format}
              onChange={(event) => {
                setFormat(event.target.value as ConvertFormat);
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

          <p className="text-[0.9rem] leading-[1.5] text-muted-foreground">
            {serverConversion
              ? `${selectedFormat.hint}. This source will be converted by the backend.`
              : selectedFormat.hint}
          </p>

          <Button
            variant="editorial-primary"
            size="pill"
            className="w-fit border-0"
            onClick={handleConvert}
            disabled={!file || phase === "working"}
          >
            {phase === "working" ? "Converting..." : "Convert image"}
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
                ["Original", formatLabel(file.type)],
                ["Target", selectedFormat.label],
                ["File size", formatBytes(file.size)],
                ...(result
                  ? [
                      ["Output", formatBytes(result.blob.size)],
                      ["Dimensions", `${result.width} x ${result.height}`],
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
              Download
              <ButtonArrow />
            </Button>
            <Button variant="editorial" size="pill" className="w-fit" onClick={clearOutput}>
              <RotateCcw aria-hidden="true" />
              Change target
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
