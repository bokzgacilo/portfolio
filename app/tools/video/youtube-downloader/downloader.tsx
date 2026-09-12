"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Film, Link2, Loader2, Music, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { recordToolOutput, usageKey } from "../../usage";

type VideoInfo = {
  jobId: string;
  title: string;
  thumbnail: string | null;
  channel: string | null;
  durationSeconds: number;
  tooLong: boolean;
  maxDurationSeconds: number;
};

type Result = { name: string; size: number; url: string; format: "mp3" | "mp4"; elapsedMs: number };

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function formatElapsed(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}

function downloadSteps(format: "mp3" | "mp4") {
  return [
    "Getting the video from YouTube",
    `Converting to ${format.toUpperCase()}`,
    "Creating your download file",
  ];
}

function extractError(body: string, fallback: string) {
  try {
    const parsed = JSON.parse(body) as { error?: string; detail?: string };
    return parsed.error || parsed.detail || fallback;
  } catch {
    return fallback;
  }
}

export default function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp3" | "mp4">("mp4");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [looking, setLooking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearProgressTimers() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    stepTimeoutsRef.current.forEach(clearTimeout);
    stepTimeoutsRef.current = [];
  }

  useEffect(() => clearProgressTimers, []);

  async function lookUp() {
    const trimmed = url.trim();
    if (!trimmed || looking) return;
    setLooking(true);
    setError("");
    setInfo(null);
    setResult(null);
    try {
      const response = await fetch("/api/tools/youtube-downloader/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const body = await response.text();
      if (!response.ok) throw new Error(extractError(body, "Could not read that video."));
      setInfo(JSON.parse(body) as VideoInfo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read that video.");
    } finally {
      setLooking(false);
    }
  }

  async function download() {
    if (!info?.jobId || downloading || info.tooLong) return;
    setDownloading(true);
    setError("");
    setResult(null);

    clearProgressTimers();
    setStepIndex(0);
    setElapsedMs(0);
    const startedAt = Date.now();
    timerRef.current = setInterval(() => setElapsedMs(Date.now() - startedAt), 100);
    // There is no real progress feed from the backend -- it is one request that
    // downloads and converts before responding -- so these are timed guesses
    // that give the user a sense of motion rather than a literal status.
    stepTimeoutsRef.current.push(setTimeout(() => setStepIndex(1), 1200));
    stepTimeoutsRef.current.push(setTimeout(() => setStepIndex(2), 3500));

    try {
      const response = await fetch("/api/tools/youtube-downloader/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: info.jobId, format }),
      });
      const body = await response.text();
      if (!response.ok) throw new Error(extractError(body, "The download failed."));
      const parsed = JSON.parse(body) as { downloadUrl: string; sizeBytes: number };
      const name = `${(info.title || "video").slice(0, 80)}.${format}`;
      setStepIndex(downloadSteps(format).length);
      const finalElapsedMs = Date.now() - startedAt;
      setResult({ name, size: parsed.sizeBytes, url: parsed.downloadUrl, format, elapsedMs: finalElapsedMs });
      recordToolOutput(usageKey("video", "youtube-downloader"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The download failed.");
    } finally {
      clearProgressTimers();
      setElapsedMs(Date.now() - startedAt);
      setDownloading(false);
    }
  }

  return (
    <section className="border border-border bg-[rgb(255_253_248/0.42)] p-[clamp(1rem,3vw,2rem)]" aria-label="YouTube downloader">
      <label className="grid gap-2">
        <span className="mono-label text-muted-foreground">YouTube video URL</span>
        <span className="flex flex-col gap-2 sm:flex-row">
          <span className="relative min-w-0 flex-1">
            <Link2 className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(event) => { setUrl(event.target.value); setInfo(null); setError(""); }}
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); lookUp(); } }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-12 w-full border border-border bg-background pl-10 pr-3 outline-none focus:border-brand"
            />
          </span>
          <Button type="button" onClick={lookUp} disabled={!url.trim() || looking} variant="outline" className="h-12 shrink-0 gap-2 px-5">
            {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {looking ? "Looking up..." : "Look up"}
          </Button>
        </span>
      </label>

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

      {info && (
        <div className="mt-6 grid gap-5">
          <div className="flex items-start gap-4 border-b border-border pb-5">
            {info.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.thumbnail} alt="" className="h-20 w-32 shrink-0 rounded object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{info.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{info.channel} · {formatDuration(info.durationSeconds)}</p>
              {info.tooLong && (
                <p className="mt-2 text-sm text-red-700">
                  That video is longer than the {Math.floor(info.maxDurationSeconds / 60)}-minute limit for this tool.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <span className="mono-label text-muted-foreground">Format</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setFormat("mp4")}
                className={`flex flex-1 items-start justify-center gap-2 border px-4 py-3 text-center transition-colors ${format === "mp4" ? "border-brand bg-brand/10" : "border-border hover:bg-background"}`}
              >
                <Film className="mt-0.5 size-4 shrink-0" /> MP4 video (up to 720p)
              </button>
              <button
                type="button"
                onClick={() => setFormat("mp3")}
                className={`flex flex-1 items-start justify-center gap-2 border px-4 py-3 text-center transition-colors ${format === "mp3" ? "border-brand bg-brand/10" : "border-border hover:bg-background"}`}
              >
                <Music className="mt-0.5 size-4 shrink-0" /> MP3 audio
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={download}
            disabled={downloading || info.tooLong}
            variant="cta-filled"
            size="pill-cta"
            className="min-h-[64px] w-full justify-between px-6 text-lg md:text-xl"
          >
            <span className="inline-flex items-center gap-2">
              {downloading && <Loader2 className="size-5 animate-spin" />}
              {downloading ? "Working..." : `Download ${format.toUpperCase()}`}
            </span>
            <ButtonArrow className="size-8 text-base" />
          </Button>

          {downloading && (
            <div className="grid gap-2 border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="mono-label text-muted-foreground">Progress</span>
                <span className="mono-label text-brand-dark">{formatElapsed(elapsedMs)}</span>
              </div>
              <ul className="grid gap-2">
                {downloadSteps(format).map((label, index) => {
                  const state = index < stepIndex ? "done" : index === stepIndex ? "active" : "pending";
                  return (
                    <li key={label} className="flex items-center gap-2 text-sm">
                      {state === "done" && <Check className="size-4 shrink-0 text-green-700" />}
                      {state === "active" && <Loader2 className="size-4 shrink-0 animate-spin text-brand" />}
                      {state === "pending" && <span className="size-4 shrink-0 rounded-full border border-border" />}
                      <span className={state === "pending" ? "text-muted-foreground" : "text-foreground"}>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-border pt-6">
            <div className="mb-1 flex items-center gap-2 text-green-700">
              <Check className="size-5" />
              <h2 className="display text-2xl">Thank you for using the tool.</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Ready in {formatElapsed(result.elapsedMs)}.</p>
            <div className="flex items-center gap-3 border border-border bg-background p-3">
              {result.format === "mp3" ? <Music className="size-5 shrink-0 text-brand" /> : <Film className="size-5 shrink-0 text-brand" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{result.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{(result.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <a className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4" href={result.url} download={result.name}>
                <Download className="size-4" />Download
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 text-xs text-muted-foreground">
        Processed on the server; your download link stays available for about an hour, then the file is deleted.
        Only download videos you own or have permission to save, and respect YouTube&apos;s Terms of Service and
        applicable copyright law.
      </p>
    </section>
  );
}
