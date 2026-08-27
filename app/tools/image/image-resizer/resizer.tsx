"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, ImageIcon, Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordToolOutput, usageKey } from "@/app/tools/usage";
import { ToolDownloadSuccess } from "@/app/tools/tool-download-success";

import {
  PRESETS,
  SUPPORTED_INPUT,
  type ResizeFormat,
  type ResizeResult,
  formatBytes,
  formatDuration,
  resizeImage,
  resizedName,
} from "./resize";

const MAX_INPUT_BYTES = 40 * 1024 * 1024;
const MAX_DIMENSION = 8000;
const MIN_DIMENSION = 16;
const DEFAULT_CANVAS = { width: 1200, height: 800 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 400;

type Phase = "idle" | "ready" | "working" | "done" | "downloaded";

const field = cn(
  "min-h-11 rounded-full border border-border bg-card px-4 py-[0.65rem]",
  "text-base text-foreground outline-none focus:border-foreground md:text-base"
);
const fieldLabel = "grid gap-[0.45rem]";
const fieldLabelText = "mono-label text-muted-foreground";

const FORMATS: ReadonlyArray<{ value: ResizeFormat; label: string }> = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
];

function clampDimension(value: number) {
  if (!Number.isFinite(value)) return MIN_DIMENSION;
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(value)));
}

function clampZoom(value: number) {
  if (!Number.isFinite(value)) return MIN_ZOOM;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
}

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [downloadedName, setDownloadedName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sourceSize, setSourceSize] = useState<{ width: number; height: number } | null>(null);

  const [width, setWidth] = useState<number>(DEFAULT_CANVAS.width);
  const [height, setHeight] = useState<number>(DEFAULT_CANVAS.height);
  const [format, setFormat] = useState<ResizeFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [imageZoom, setImageZoom] = useState(100);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [draggingFrame, setDraggingFrame] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: 0,
    startX: 0,
    startY: 0,
    imageOffsetX: 0,
    imageOffsetY: 0,
  });

  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  const sliderMax = useMemo(() => {
    const sourceMax = sourceSize ? Math.max(sourceSize.width, sourceSize.height) * 2 : 3000;
    return Math.min(MAX_DIMENSION, Math.max(2048, sourceMax, width, height));
  }, [height, sourceSize, width]);

  const widthFillPct = ((width - MIN_DIMENSION) / (sliderMax - MIN_DIMENSION)) * 100;
  const heightFillPct = ((height - MIN_DIMENSION) / (sliderMax - MIN_DIMENSION)) * 100;
  const frameRatio = width / height;
  const frameMaxWidth = frameRatio < 0.78 ? "min(100%, 460px)" : "min(100%, 980px)";
  const fittedScale = sourceSize ? Math.min(width / sourceSize.width, height / sourceSize.height) : 1;
  const imageWidthPct = sourceSize
    ? ((sourceSize.width * fittedScale * imageZoom) / width)
    : 100;
  const imageLeftPct = ((width / 2 + imageOffsetX) / width) * 100;
  const imageTopPct = ((height / 2 + imageOffsetY) / height) * 100;

  function clearOutput() {
    setResult(null);
    setDownloadedName(null);
    setPhase(file ? "ready" : "idle");
  }

  function frameScale() {
    const frame = frameRef.current;
    if (!frame) return 1;
    return frame.getBoundingClientRect().width / width;
  }

  function handleFramePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!sourceUrl) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      imageOffsetX,
      imageOffsetY,
    };
    setDraggingFrame(true);
  }

  function handleFramePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingFrame || dragRef.current.pointerId !== event.pointerId) return;

    const scale = frameScale();
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    setImageOffsetX(Math.round(dragRef.current.imageOffsetX + deltaX / scale));
    setImageOffsetY(Math.round(dragRef.current.imageOffsetY + deltaY / scale));
    clearOutput();
  }

  function handleFramePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDraggingFrame(false);
    }
  }

  const reset = useCallback(() => {
    setFile(null);
    setSourceUrl(null);
    setResult(null);
    setDownloadedName(null);
    setSourceSize(null);
    setError(null);
    setPhase("idle");
    setImageZoom(100);
    setImageOffsetX(0);
    setImageOffsetY(0);
    setDraggingFrame(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const accept = useCallback(async (next: File) => {
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
    setDownloadedName(null);
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
    setPhase("ready");

    try {
      const bitmap = await createImageBitmap(next);
      const nextSourceSize = { width: bitmap.width, height: bitmap.height };
      setSourceSize(nextSourceSize);
      setImageZoom(100);
      setImageOffsetX(0);
      setImageOffsetY(0);
      bitmap.close();
    } catch {
      setError("That file could not be decoded as an image.");
      setPhase("idle");
    }
  }, [height, width]);

  function updateWidth(value: number) {
    const nextWidth = clampDimension(value);
    setWidth(nextWidth);
    clearOutput();
  }

  function updateHeight(value: number) {
    const nextHeight = clampDimension(value);
    setHeight(nextHeight);
    clearOutput();
  }

  function updateImageZoom(value: number) {
    setImageZoom(clampZoom(value));
    clearOutput();
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setWidth(preset.width);
    setHeight(preset.height);
    clearOutput();
  }

  async function handleResize() {
    if (!file) return;

    setPhase("working");
    setError(null);
    setResult(null);
    setDownloadedName(null);

    try {
      const next = await resizeImage(
        file,
        width,
        height,
        format,
        quality / 100,
        imageZoom,
        imageOffsetX,
        imageOffsetY
      );
      setResult(next);
      recordToolOutput(usageKey("image", "image-resizer"));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Resize failed.");
      setPhase("ready");
    }
  }

  function handleDownload() {
    if (!file || !result) return;
    const name = resizedName(file.name, result.format, result.width, result.height);
    const link = document.createElement("a");
    const href = URL.createObjectURL(result.blob);
    link.href = href;
    link.download = name;
    link.click();
    URL.revokeObjectURL(href);
    setDownloadedName(name);
    setPhase("downloaded");
  }

  const qualityFillPct = ((quality - 50) / 50) * 100;

  return (
    <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] border-t border-l border-border max-[1000px]:grid-cols-[minmax(0,1fr)]">
      <div className="min-w-0 border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.6rem)]">
        {phase === "downloaded" && downloadedName ? (
          <ToolDownloadSuccess
            eyebrow="Downloaded locally"
            fileName={downloadedName}
            toolName="Image Resizer"
            body="The resized file was created in your browser. Nothing was uploaded or archived, so this page is ready for another canvas when you are."
            actionLabel="Resize another image"
            onAction={reset}
          />
        ) : sourceUrl ? (
          <div className="grid gap-4">
            <div className="grid min-h-[clamp(440px,60vw,680px)] w-full min-w-0 place-items-center overflow-auto border border-border bg-[rgb(21_20_18/0.04)] p-[clamp(1rem,3vw,2rem)] max-[900px]:min-h-[420px]">
              <div
                ref={frameRef}
                className={cn(
                  "relative grid w-full touch-none overflow-hidden border border-border bg-white shadow-lift",
                  draggingFrame ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  aspectRatio: `${width} / ${height}`,
                  maxWidth: frameMaxWidth,
                  maxHeight: "min(68vh, 620px)",
                }}
                onPointerDown={handleFramePointerDown}
                onPointerMove={handleFramePointerMove}
                onPointerUp={handleFramePointerUp}
                onPointerCancel={handleFramePointerUp}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="pointer-events-none absolute block max-w-none select-none"
                  style={{
                    width: `${imageWidthPct}%`,
                    height: "auto",
                    left: `${imageLeftPct}%`,
                    top: `${imageTopPct}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  src={sourceUrl}
                  alt="Selected image layer"
                  draggable={false}
                />
                <span className="mono-label absolute top-3 left-3 rounded-full border border-border bg-[rgb(255_253_248/0.9)] px-[0.62rem] py-[0.32rem] text-brand-dark backdrop-blur-md">
                  {result ? "Rendered" : "Live canvas"}
                </span>
                <span className="mono-label absolute right-3 bottom-3 rounded-full border border-border bg-[rgb(255_253_248/0.9)] px-[0.62rem] py-[0.32rem] text-muted-foreground backdrop-blur-md">
                  {width} x {height}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="block truncate text-[0.95rem] font-semibold text-foreground">
                  {file?.name}
                </span>
                {sourceSize ? (
                  <span className="mono-label text-muted-foreground">
                    {sourceSize.width} x {sourceSize.height} · {file ? formatBytes(file.size) : null}
                  </span>
                ) : null}
              </div>
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
              "grid min-h-[360px] cursor-pointer place-items-center border border-dashed p-6 text-center transition-colors",
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
              if (dropped) void accept(dropped);
            }}
          >
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept={SUPPORTED_INPUT.join(",")}
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (picked) void accept(picked);
              }}
            />
            <span className="grid max-w-[34ch] justify-items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full border border-border bg-card text-brand-dark">
                <ImageIcon className="size-5" aria-hidden="true" />
              </span>
              <span className="display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1]">
                Drop an image here
              </span>
              <span className="text-muted-foreground">
                or click to choose a file. JPG, PNG, WebP, or AVIF up to 40 MB.
              </span>
              <span className="mono-label mt-1 text-brand">Resize runs in your browser</span>
            </span>
          </label>
        )}
      </div>

      <aside className="grid min-w-0 content-start gap-[1.5rem] border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="grid gap-[1.1rem]">
          <h2 className="text-[0.95rem] font-extrabold text-foreground">Canvas size</h2>

          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                className={cn(
                  "mono-label min-h-10 cursor-pointer rounded-full border px-3 transition-colors hover:border-foreground hover:text-foreground",
                  width === preset.width && height === preset.height
                    ? "border-foreground bg-card text-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
                type="button"
                key={preset.label}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Width</span>
              <input
                className={field}
                type="number"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                value={width}
                onChange={(event) => updateWidth(Number(event.target.value))}
              />
            </label>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Height</span>
              <input
                className={field}
                type="number"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                value={height}
                onChange={(event) => updateHeight(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="grid gap-[0.85rem]">
            <div className="grid gap-[0.35rem]">
              <div className="flex items-baseline justify-between gap-3">
                <label className={fieldLabelText} htmlFor="resize-width-slider">
                  Width axis
                </label>
                <span className="mono-label text-muted-foreground">
                  min {MIN_DIMENSION}px · max {sliderMax}px
                </span>
              </div>
              <input
                className="range-editorial"
                id="resize-width-slider"
                type="range"
                min={MIN_DIMENSION}
                max={sliderMax}
                step={1}
                value={width}
                style={{ "--range-fill": `${widthFillPct}%` } as CSSProperties}
                onChange={(event) => updateWidth(Number(event.target.value))}
              />
            </div>

            <div className="grid gap-[0.35rem]">
              <div className="flex items-baseline justify-between gap-3">
                <label className={fieldLabelText} htmlFor="resize-height-slider">
                  Height axis
                </label>
                <span className="mono-label text-muted-foreground">
                  min {MIN_DIMENSION}px · max {sliderMax}px
                </span>
              </div>
              <input
                className="range-editorial"
                id="resize-height-slider"
                type="range"
                min={MIN_DIMENSION}
                max={sliderMax}
                step={1}
                value={height}
                style={{ "--range-fill": `${heightFillPct}%` } as CSSProperties}
                onChange={(event) => updateHeight(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-[0.85rem] border-t border-border pt-[1rem]">
            <h3 className="text-[0.95rem] font-extrabold text-foreground">Image layer</h3>
            <div className="grid gap-[0.35rem]">
              <div className="flex items-baseline justify-between gap-3">
                <label className={fieldLabelText} htmlFor="image-zoom">
                  Zoom
                </label>
                <span className="mono-label text-muted-foreground">
                  {MIN_ZOOM}% - {MAX_ZOOM}%
                </span>
              </div>
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden rounded-full border border-border bg-card">
                <button
                  className="grid min-h-11 cursor-pointer place-items-center border-r border-border text-brand-dark transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => updateImageZoom(imageZoom - 5)}
                  disabled={!file || imageZoom <= MIN_ZOOM}
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                  <input
                    className="min-h-11 min-w-0 border-0 bg-transparent px-4 text-center text-base font-[750] text-foreground outline-none md:text-base"
                    id="image-zoom"
                    type="number"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={1}
                    value={imageZoom}
                    onChange={(event) => updateImageZoom(Number(event.target.value))}
                    disabled={!file}
                  />
                  <span className="pr-4 text-[0.95rem] font-[750] text-muted-foreground">%</span>
                </div>
                <button
                  className="grid min-h-11 cursor-pointer place-items-center border-l border-border text-brand-dark transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => updateImageZoom(imageZoom + 5)}
                  disabled={!file || imageZoom >= MAX_ZOOM}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <Button
              variant="editorial"
              size="pill"
              type="button"
              className="w-fit"
              onClick={() => {
                if (sourceSize) {
                  setImageZoom(100);
                }
                setImageOffsetX(0);
                setImageOffsetY(0);
                clearOutput();
              }}
              disabled={!file}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset image
            </Button>
          </div>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Output format</span>
            <select
              className={cn(field, "select-caret w-full cursor-pointer appearance-none pr-7")}
              value={format}
              onChange={(event) => {
                setFormat(event.target.value as ResizeFormat);
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

          {format !== "image/png" ? (
            <div className="grid gap-[0.45rem]">
              <div className="flex items-baseline justify-between gap-3">
                <label className={fieldLabelText} htmlFor="resize-quality">
                  Quality
                </label>
                <span className="font-[750] text-foreground">{quality}%</span>
              </div>
              <input
                className="range-editorial"
                id="resize-quality"
                type="range"
                min={50}
                max={100}
                step={1}
                value={quality}
                style={{ "--range-fill": `${qualityFillPct}%` } as CSSProperties}
                onChange={(event) => {
                  setQuality(Number(event.target.value));
                  clearOutput();
                }}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="editorial-primary"
              size="pill"
              className="border-0"
              onClick={handleResize}
              disabled={!file || phase === "working"}
            >
              {phase === "working" ? "Resizing..." : "Resize image"}
            </Button>
            <Button
              variant="editorial"
              size="pill"
              type="button"
              onClick={() => {
                setWidth(DEFAULT_CANVAS.width);
                setHeight(DEFAULT_CANVAS.height);
                if (sourceSize) {
                  setImageZoom(100);
                }
                setImageOffsetX(0);
                setImageOffsetY(0);
                clearOutput();
              }}
              disabled={!file}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset all
            </Button>
          </div>

          {phase === "working" ? (
            <p className="text-[0.88rem] leading-[1.5] text-muted-foreground" role="status">
              Rendering the new canvas. Very large source images can take a few seconds.
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

        {phase === "done" && file && result ? (
          <div className="grid gap-[1.1rem] border-t border-border pt-[1.2rem]">
            <dl className="grid gap-[0.85rem]">
              {(
                [
                  ["Original", `${result.sourceWidth} x ${result.sourceHeight}`],
                  ["Output", `${result.width} x ${result.height}`],
                  ["File size", formatBytes(result.blob.size)],
                  ["Format", result.format.replace("image/", "").toUpperCase()],
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

            <Button variant="cta-filled" size="pill-cta" className="w-fit" onClick={handleDownload}>
              Download
              <Download className="size-4" aria-hidden="true" />
            </Button>
            <p className="text-[0.88rem] leading-[1.5] text-muted-foreground">
              The resized file is created locally. Nothing is uploaded or archived.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
