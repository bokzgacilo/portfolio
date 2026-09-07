"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  Check,
  Download,
  FileAudio,
  Loader2,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { recordToolOutput, usageKey } from "../../usage";

const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPTED_INPUT = "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm";

const FORMATS = [
  { value: "mp3", label: "MP3", hint: "Small and widely compatible" },
  { value: "wav", label: "WAV", hint: "Uncompressed editing format" },
  { value: "ogg", label: "OGG", hint: "Open compressed audio" },
  { value: "flac", label: "FLAC", hint: "Lossless compressed audio" },
  { value: "aac", label: "AAC", hint: "Efficient mobile-friendly audio" },
] as const;

type OutputFormat = (typeof FORMATS)[number]["value"];
type Phase = "idle" | "ready" | "converting" | "done" | "downloaded";
type ConvertedAudio = { name: string; url: string; bytes: number; mime: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fallbackName(name: string, format: OutputFormat) {
  const base = name.replace(/\.[^./\\]+$/, "") || "audio";
  return `${base}.${format}`;
}

function headerFileName(disposition: string | null) {
  if (!disposition) return null;
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.replace(/"/g, ""));
    } catch {
      return encoded.replace(/"/g, "");
    }
  }
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
}

async function errorMessage(response: Response) {
  const body = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(body) as { error?: string; detail?: string };
    return parsed.error || parsed.detail || "The audio could not be converted.";
  } catch {
    if (response.status === 413) return "That audio file is larger than the 50 MB limit.";
    if (response.status === 415) return "That audio format is not supported.";
    if (response.status >= 500) return "The audio conversion service is unavailable right now.";
    return body || "The audio could not be converted.";
  }
}

export function AudioConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("mp3");
  const [phase, setPhase] = useState<Phase>("idle");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConvertedAudio | null>(null);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const selectedFormat = useMemo(
    () => FORMATS.find((option) => option.value === format) ?? FORMATS[0],
    [format]
  );

  function clearResult() {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setPhase(file ? "ready" : "idle");
  }

  function reset() {
    clearResult();
    setFile(null);
    setError("");
    setDragging(false);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  function choose(next?: File) {
    if (!next) return;
    setError("");
    if (next.size === 0) {
      setError("Choose an audio file with some sound.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError(`${next.name} is larger than the 50 MB limit.`);
      return;
    }
    clearResult();
    setFile(next);
    setPhase("ready");
  }

  async function convert() {
    if (!file || phase === "converting") return;
    clearResult();
    setError("");
    setPhase("converting");

    const form = new FormData();
    form.append("file", file, file.name);
    form.append("target", format);

    try {
      const response = await fetch("/api/tools/audio-converter", {
        method: "POST",
        body: form,
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const blob = await response.blob();
      if (!blob.size) throw new Error("The converter returned an empty file.");
      const name = headerFileName(response.headers.get("content-disposition")) ?? fallbackName(file.name, format);
      setResult({
        name,
        bytes: blob.size,
        mime: response.headers.get("content-type") || blob.type || "audio/mpeg",
        url: URL.createObjectURL(blob),
      });
      recordToolOutput(usageKey("audio", "audio-converter"));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The audio could not be converted.");
      setPhase("ready");
    }
  }

  function markDownloaded() {
    setPhase("downloaded");
  }

  return (
    <section
      className="grid max-w-full grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] overflow-hidden border-t border-l border-border max-[900px]:block"
      aria-label="Audio converter"
      aria-busy={phase === "converting"}
    >
      <div className="min-w-0 border-r border-b border-border bg-[rgb(255_253_248/0.36)] p-[clamp(1rem,2.5vw,1.6rem)]">
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept={ACCEPTED_INPUT}
          onChange={(event) => {
            choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              choose(event.dataTransfer.files[0]);
            }}
            className={cn(
              "grid min-h-[360px] w-full max-w-full place-items-center overflow-hidden border border-dashed p-6 text-center transition-colors max-sm:p-4",
              dragging
                ? "border-foreground bg-[rgb(255_253_248/0.82)]"
                : "border-border hover:bg-[rgb(255_253_248/0.62)]"
            )}
          >
            <span className="grid max-w-full justify-items-center gap-3 sm:max-w-[36ch]">
              <AudioLines className="size-10 text-brand" aria-hidden="true" />
              <span className="display text-[clamp(1.55rem,2.8vw,2.35rem)] leading-[1.05]">
                Upload audio
              </span>
              <span className="max-w-full text-wrap text-muted-foreground">
                Drop a track here, or choose MP3, WAV, M4A, AAC, OGG, FLAC, or WebM from your device.
              </span>
              <span className="mono-label mt-1 text-brand">Up to 50 MB</span>
            </span>
          </button>
        ) : (
          <div className="grid min-h-[360px] content-between gap-8">
            <div className="flex min-w-0 items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-full border border-border bg-card">
                <FileAudio className="size-7 text-brand" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mono-label mb-2 text-brand">Selected audio</p>
                <h2 className="break-words text-[clamp(1.35rem,2.6vw,2.1rem)] font-extrabold leading-tight">
                  {file.name}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {formatBytes(file.size)} · {file.type || "Audio file"}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={reset}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-4">
              <div className="h-3 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full bg-brand"
                  initial={false}
                  animate={{ width: phase === "converting" ? "72%" : result ? "100%" : "18%" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </div>
              <p className="text-sm text-muted-foreground" role="status">
                {phase === "converting"
                  ? `Converting to ${selectedFormat.label}...`
                  : result
                    ? `${result.name} is ready to download.`
                    : `Ready to convert to ${selectedFormat.label}.`}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {phase === "downloaded" && result ? (
                <motion.div
                  key="downloaded"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-t border-border pt-5"
                >
                  <div className="mb-3 flex items-center gap-2 text-green-700">
                    <Check className="size-5" aria-hidden="true" />
                    <h3 className="display text-2xl">Download started.</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.name} was prepared as a new copy. Your original file is unchanged.
                  </p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-3 border-t border-border pt-5"
                >
                  <p className="mono-label text-brand">Converted output</p>
                  <div className="flex min-w-0 items-center justify-between gap-4 border border-border bg-background p-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{result.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatBytes(result.bytes)} · {result.mime}
                      </p>
                    </div>
                    <a
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                      href={result.url}
                      download={result.name}
                      onClick={markDownloaded}
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Download
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>

      <aside className="grid min-w-0 content-start gap-6 overflow-hidden border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="grid gap-4">
          <div>
            <p className="mono-label mb-2 text-brand">Output format</p>
            <h2 className="text-[0.95rem] font-extrabold text-foreground">
              Choose the converted file type
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 sm:grid-cols-5 min-[901px]:grid-cols-2">
            {FORMATS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={format === option.value}
                disabled={phase === "converting"}
                onClick={() => {
                  setFormat(option.value);
                  clearResult();
                  setError("");
                }}
                className={cn(
                  "min-h-16 min-w-0 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50",
                  format === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-brand"
                )}
              >
                <span className="block font-extrabold">{option.label}</span>
                <span className={cn("mt-1 block break-words text-xs", format === option.value ? "text-primary-foreground/78" : "text-muted-foreground")}>
                  {option.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <dl className="grid gap-3 border-t border-border pt-5">
          {[
            ["Source", file ? file.type || "Audio file" : "No file selected"],
            ["Limit", "50 MB"],
            ["Target", selectedFormat.label],
            ["Processing", "Backend conversion"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex min-w-0 items-baseline justify-between gap-4 border-b border-border pb-2"
            >
              <dt className="mono-label text-muted-foreground">{label}</dt>
              <dd className="text-right text-sm font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {error ? (
          <p
            role="alert"
            className="break-words border-t border-border pt-5 text-sm leading-6 text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-3 border-t border-border pt-5">
          <Button
            variant="cta-filled"
            size="pill-cta"
            className="min-h-[58px] w-full justify-between px-5"
            disabled={!file || phase === "converting"}
            onClick={() => void convert()}
          >
            <span className="inline-flex items-center gap-2">
              {phase === "converting" ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="size-5" aria-hidden="true" />
              )}
              {phase === "converting" ? "Converting..." : `Convert to ${selectedFormat.label}`}
            </span>
            <ButtonArrow />
          </Button>
          {file ? (
            <Button
              variant="editorial"
              size="pill"
              className="w-fit gap-2"
              disabled={phase === "converting"}
              onClick={reset}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Start over
            </Button>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
