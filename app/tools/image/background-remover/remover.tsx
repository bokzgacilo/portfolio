"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordToolOutput, usageKey } from "@/app/tools/usage";
import { ToolDownloadSuccess } from "@/app/tools/tool-download-success";

import {
  type ApiState,
  type Cutout,
  MAX_DIMENSION,
  MAX_INPUT_BYTES,
  SUPPORTED_INPUT,
  apiBase,
  checkApi,
  cutoutName,
  formatBytes,
  formatDuration,
  removeBackground,
} from "./remove";

type Phase = "idle" | "ready" | "working" | "done" | "archiving" | "archived";

/** Kept after the blob is discarded so the receipt can still be rendered. */
type Receipt = {
  name: string;
  originalBytes: number;
  cutoutBytes: number;
  width: number;
  height: number;
  processingMs: number;
  model: string;
  archivedAt: string;
};

/** What the cutout is previewed against. Transparency is invisible on its own,
 *  and edge quality only shows up over a contrasting backdrop. */
type Backdrop = "checker" | "light" | "dark";

const BACKDROPS: ReadonlyArray<{ value: Backdrop; label: string }> = [
  { value: "checker", label: "Checker" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const CHECKER: CSSProperties = {
  backgroundImage:
    "conic-gradient(rgb(0 0 0/0.09) 0deg 90deg, transparent 90deg 180deg, rgb(0 0 0/0.09) 180deg 270deg, transparent 270deg)",
  backgroundSize: "20px 20px",
};

const STATUS_COPY: Record<ApiState, string> = {
  unknown: "Checking…",
  ready: "Ready",
  waking: "Waking up",
  offline: "Unreachable",
  unconfigured: "Not configured",
};

function backdropStyle(backdrop: Backdrop): CSSProperties {
  if (backdrop === "checker") return CHECKER;
  return { backgroundColor: backdrop === "dark" ? "rgb(24 24 24)" : "rgb(255 255 255)" };
}

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [cutout, setCutout] = useState<Cutout | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [backdrop, setBackdrop] = useState<Backdrop>("checker");
  const [elapsed, setElapsed] = useState(0);

  const [api, setApi] = useState<ApiState>(apiBase() ? "unknown" : "unconfigured");
  const [model, setModel] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* Ping on mount. On a sleeping free instance this request is what starts the
     wake-up, so it usually finishes while the visitor is still picking a file. */
  useEffect(() => {
    if (!apiBase()) return;

    let active = true;
    checkApi().then((result) => {
      if (!active) return;
      setApi(result.state);
      if (result.model) setModel(result.model);
    });
    return () => {
      active = false;
    };
  }, []);

  /* Object URLs are revoked by the effect that owns them, so switching files or
     unmounting mid-flow cannot leak a blob. */
  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (!cutoutUrl) return;
    return () => URL.revokeObjectURL(cutoutUrl);
  }, [cutoutUrl]);

  /* A cold instance can take most of a minute, which is far too long to show a
     motionless "Removing…". Counting up is the honest version of a progress
     bar when the server cannot report progress. */
  useEffect(() => {
    if (phase !== "working") return;

    const started = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const reset = useCallback(() => {
    setFile(null);
    setSourceUrl(null);
    setCutout(null);
    setCutoutUrl(null);
    setReceipt(null);
    setError(null);
    setShowOriginal(false);
    setPhase("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const accept = useCallback((next: File) => {
    if (!SUPPORTED_INPUT.includes(next.type as (typeof SUPPORTED_INPUT)[number])) {
      setError(`${next.type || "That file type"} is not supported. Use JPG, PNG, or WebP.`);
      return;
    }
    if (next.size > MAX_INPUT_BYTES) {
      setError(`That file is ${formatBytes(next.size)}. The limit is 10 MB.`);
      return;
    }

    setError(null);
    setCutout(null);
    setCutoutUrl(null);
    setReceipt(null);
    setShowOriginal(false);
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
    setPhase("ready");
  }, []);

  async function handleRemove() {
    if (!file) return;

    setPhase("working");
    setError(null);
    setCutout(null);
    setCutoutUrl(null);

    try {
      const result = await removeBackground(file);
      setCutout(result);
      setCutoutUrl(URL.createObjectURL(result.blob));
      setModel(result.model);
      setApi("ready");
      recordToolOutput(usageKey("image", "background-remover"));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Background removal failed.");
      setPhase("ready");
    }
  }

  async function handleDownload() {
    if (!file || !cutout) return;

    setPhase("archiving");
    setError(null);

    const name = cutoutName(file.name);
    const body = new FormData();
    body.append("file", cutout.blob, name);
    body.append("originalName", file.name);
    body.append("originalBytes", String(file.size));
    body.append("sourceFormat", file.type);
    body.append("model", cutout.model);
    body.append("processingMs", String(cutout.processingMs));
    body.append("originalWidth", String(cutout.originalWidth));
    body.append("originalHeight", String(cutout.originalHeight));
    body.append("width", String(cutout.width));
    body.append("height", String(cutout.height));
    body.append("downscaled", cutout.downscaled ? "1" : "0");

    try {
      const link = document.createElement("a");
      const href = URL.createObjectURL(cutout.blob);
      link.href = href;
      link.download = name;
      link.click();
      URL.revokeObjectURL(href);

      /* Archive after download. A storage problem should not cost the visitor
         the cutout they already have in hand. */
      const response = await fetch("/api/tools/background-remover", {
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
        cutoutBytes: cutout.blob.size,
        width: cutout.width,
        height: cutout.height,
        processingMs: cutout.processingMs,
        model: cutout.model,
        archivedAt: payload.archivedAt ?? new Date().toISOString(),
      });

      /* The point of no return: the cutout and its preview URL are dropped, so
         the PNG exists only in the visitor's downloads folder and in the
         archive bucket. */
      setCutout(null);
      setCutoutUrl(null);
      setFile(null);
      setSourceUrl(null);
      setShowOriginal(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setPhase("archived");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `${cause.message} Your cutout was still downloaded.`
          : "Archive failed. Your cutout was still downloaded."
      );
      setPhase("done");
    }
  }

  const previewUrl = showOriginal || !cutoutUrl ? sourceUrl : cutoutUrl;
  const showingCutout = Boolean(cutoutUrl) && !showOriginal;

  return (
    <div className="grid grid-cols-[minmax(0,1.02fr)_minmax(300px,0.98fr)] border-t border-l border-border max-[900px]:grid-cols-[minmax(0,1fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Canvas: dropzone or preview                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="min-w-0 border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.6rem)]">
        {phase === "archived" && receipt ? (
          <ToolDownloadSuccess
            eyebrow="Archived & downloaded"
            fileName={receipt.name}
            toolName="Background Remover"
            body="The cutout has been cleared from this page. It is no longer available here; the archived copy lives in private storage for retrieval."
            actionLabel="Remove another background"
            onAction={reset}
          />
        ) : previewUrl ? (
          <div className="grid gap-4">
            <div
              className="relative grid min-h-[220px] w-full min-w-0 place-items-center overflow-hidden border border-border max-[900px]:min-h-[260px]"
              style={showingCutout ? backdropStyle(backdrop) : { backgroundColor: "var(--card)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="block max-h-[420px] w-full max-w-full object-contain max-[900px]:max-h-[50vh]"
                src={previewUrl}
                alt={showingCutout ? "Cutout preview" : "Selected image preview"}
              />
              <span className="mono-label absolute top-3 left-3 rounded-full border border-border bg-[rgb(255_253_248/0.9)] px-[0.62rem] py-[0.32rem] text-brand-dark backdrop-blur-md">
                {showingCutout ? "Cutout" : "Original"}
              </span>
              {phase === "working" || phase === "archiving" ? (
                <span
                  className="absolute inset-0 grid place-items-center bg-[rgb(255_253_248/0.72)] backdrop-blur-[2px]"
                  role="status"
                >
                  <span className="mono-label text-brand-dark">
                    {phase === "archiving"
                      ? "Saving to the archive…"
                      : `Removing background… ${elapsed}s`}
                  </span>
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="min-w-0 truncate text-[0.95rem] font-semibold text-foreground">
                {file?.name}
              </span>
              <div className="flex flex-none items-center gap-4">
                {cutoutUrl ? (
                  <button
                    className="mono-label cursor-pointer border-0 bg-transparent text-brand-dark underline decoration-border underline-offset-[0.35em]"
                    type="button"
                    onClick={() => setShowOriginal((current) => !current)}
                  >
                    {showOriginal ? "Show cutout" : "Show original"}
                  </button>
                ) : null}
                <button
                  className="mono-label cursor-pointer border-0 bg-transparent text-brand-dark underline decoration-border underline-offset-[0.35em]"
                  type="button"
                  onClick={reset}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Only useful once there is transparency to judge. */}
            {showingCutout ? (
              <div className="flex flex-wrap items-center gap-[0.6rem]">
                <span className="mono-label text-muted-foreground">Preview on</span>
                {BACKDROPS.map((option) => (
                  <button
                    className={cn(
                      "mono-label cursor-pointer rounded-full border px-[0.62rem] py-[0.32rem] transition-colors",
                      backdrop === option.value
                        ? "border-foreground bg-card text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                    type="button"
                    key={option.value}
                    onClick={() => setBackdrop(option.value)}
                    aria-pressed={backdrop === option.value}
                  >
                    {option.label}
                  </button>
                ))}
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
              accept={SUPPORTED_INPUT.join(",")}
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (picked) accept(picked);
              }}
            />
            <span className="grid max-w-[34ch] justify-items-center gap-3">
              <span className="display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1]">
                Drop a photo here
              </span>
              <span className="text-muted-foreground">
                or click to choose a file. JPG, PNG, or WebP up to 10 MB.
              </span>
              <span className="mono-label mt-1 text-brand">
                Cutout runs on the server
              </span>
            </span>
          </label>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Status, action, stats, download                                  */}
      {/* ---------------------------------------------------------------- */}
      <aside className="grid min-w-0 content-start gap-[1.5rem] border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="grid gap-[1.1rem]">
          <h2 className="text-[0.95rem] font-extrabold text-foreground">Cutout</h2>

          <div className="flex items-baseline justify-between gap-3 border-b border-border pb-[0.55rem]">
            <span className="mono-label text-muted-foreground">Service</span>
            <span
              className={cn(
                "flex items-center gap-2 text-right font-[750]",
                api === "offline" || api === "unconfigured"
                  ? "text-destructive"
                  : "text-foreground"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-[7px] rounded-full",
                  api === "ready"
                    ? "bg-brand"
                    : api === "offline" || api === "unconfigured"
                      ? "bg-destructive"
                      : "bg-muted-foreground"
                )}
              />
              {STATUS_COPY[api]}
            </span>
          </div>

          {model ? (
            <div className="flex items-baseline justify-between gap-3 border-b border-border pb-[0.55rem]">
              <span className="mono-label text-muted-foreground">Model</span>
              <span className="text-right font-[750] text-foreground">{model}</span>
            </div>
          ) : null}

          <Button
            variant="editorial-primary"
            size="pill"
            className="w-fit border-0"
            onClick={handleRemove}
            disabled={
              !file ||
              phase === "working" ||
              phase === "archiving" ||
              api === "unconfigured"
            }
          >
            {phase === "working" ? `Removing… ${elapsed}s` : "Remove background"}
          </Button>

          <p className="text-[0.88rem] leading-[1.5] text-muted-foreground">
            {api === "unconfigured"
              ? "Set NEXT_PUBLIC_BACKGROUND_REMOVER_API to the deployed API URL to enable this tool."
              : phase === "working"
                ? "The image is uploaded to the API, masked, and sent back as a transparent PNG. A sleeping free-tier instance can add up to a minute on the first request."
                : `Uploads are masked in memory and never written to disk by the API. Images wider or taller than ${MAX_DIMENSION}px are scaled down to that first.`}
          </p>
        </div>

        {error ? (
          <p
            className="border-t border-border pt-[1.1rem] text-[0.95rem] leading-[1.5] text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {(phase === "done" || phase === "archiving") && file && cutout ? (
          <div className="grid gap-[1.1rem] border-t border-border pt-[1.2rem]">
            {cutout.downscaled ? (
              <p className="text-[0.92rem] leading-[1.5] text-muted-foreground">
                The upload was scaled to {cutout.width} × {cutout.height} before
                masking — the model works at a fixed resolution, so the extra
                pixels would not have improved the edges.
              </p>
            ) : null}

            <dl className="grid gap-[0.85rem]">
              {(
                [
                  ["Uploaded", formatBytes(file.size)],
                  ["Cutout PNG", formatBytes(cutout.blob.size)],
                  ["Dimensions", `${cutout.width} × ${cutout.height}`],
                  ["Masked in", formatDuration(cutout.processingMs)],
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
              {phase === "archiving" ? "Saving…" : "Download PNG"}
              <ButtonArrow />
            </Button>
            <p className="text-[0.88rem] leading-[1.5] text-muted-foreground">
              Downloading archives the PNG to private storage and clears it from
              this page. Transparency needs PNG — saving it as JPG would fill the
              background back in with black.
            </p>
          </div>
        ) : null}

        {/* Receipt for the archived cutout. */}
        {phase === "archived" && receipt ? (
          <dl className="grid gap-[0.85rem] border-t border-border pt-[1.2rem]">
            {(
              [
                ["Uploaded", formatBytes(receipt.originalBytes)],
                ["Cutout PNG", formatBytes(receipt.cutoutBytes)],
                ["Dimensions", `${receipt.width} × ${receipt.height}`],
                ["Masked in", formatDuration(receipt.processingMs)],
                ["Model", receipt.model],
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
                className="flex min-w-0 items-baseline justify-between gap-4 border-b border-border pb-[0.55rem]"
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
