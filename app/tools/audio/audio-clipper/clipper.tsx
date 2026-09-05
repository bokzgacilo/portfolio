"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AudioLines, Download, Loader2, Pause, Play, RotateCcw, Scissors, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordToolOutput, usageKey } from "../../usage";
import { encodeWav, formatTime, waveformPeaks } from "./audio";

type Track = { name: string; buffer: AudioBuffer; peaks: Float32Array };
const field = "min-h-12 w-full rounded-lg border border-input bg-card px-3 font-mono text-base tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AudioClipper() {
  const [track, setTrack] = useState<Track | null>(null);
  const [range, setRange] = useState({ start: 0, end: 0 });
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState<"loading" | "saving" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const wave = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const context = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const frame = useRef(0);
  const generation = useRef(0);
  const playGeneration = useRef(0);
  const busyRef = useRef(false);
  const duration = track?.buffer.duration ?? 0;
  const minClip = track ? Math.min(0.01, duration) : 0.01;

  function stop() {
    playGeneration.current++;
    if (source.current) {
      source.current.onended = null;
      source.current.stop();
      source.current.disconnect();
      source.current = null;
    }
    cancelAnimationFrame(frame.current);
    setPlaying(false);
  }

  useEffect(() => () => {
    generation.current++;
    playGeneration.current++;
    cancelAnimationFrame(frame.current);
    if (source.current) { source.current.onended = null; source.current.stop(); source.current.disconnect(); }
    void context.current?.close();
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!element || !track) return;
    const draw = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      const ctx = element.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      const styles = getComputedStyle(element);
      const peak = Math.max(0.01, ...track.peaks);
      const bars = Math.max(1, Math.floor(width / 3));
      ctx.fillStyle = styles.getPropertyValue("--border").trim();
      ctx.fillRect(0, height / 2, width, 1);
      for (let i = 0; i < bars; i++) {
        const from = Math.floor(i * track.peaks.length / bars);
        const to = Math.max(from + 1, Math.floor((i + 1) * track.peaks.length / bars));
        let value = 0;
        for (let j = from; j < to; j++) value = Math.max(value, track.peaks[j] ?? 0);
        const time = i / bars * duration;
        ctx.fillStyle = styles.getPropertyValue(time >= range.start && time <= range.end ? "--brand" : "--border").trim();
        const barHeight = Math.max(2, value / peak * height * 0.8);
        ctx.fillRect(i * width / bars, (height - barHeight) / 2, 2, barHeight);
      }
    };
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    draw();
    return () => observer.disconnect();
  }, [track, duration, range, busy]);

  async function importFile(file?: File) {
    if (!file || busyRef.current) return;
    setError(""); setNotice("");
    if (!file.size) { setError("This file is empty. Choose an audio file with some sound."); return; }
    if (file.size > 100 * 1024 * 1024) { setError("Choose an audio file smaller than 100 MB."); return; }
    stop();
    const id = ++generation.current;
    busyRef.current = true;
    setBusy("loading");
    try {
      context.current ??= new AudioContext();
      const buffer = await context.current.decodeAudioData(await file.arrayBuffer());
      if (id !== generation.current) return;
      if (!buffer.length || !Number.isFinite(buffer.duration)) throw new Error("This file has no readable audio.");
      if (buffer.duration > 1800) throw new Error("Choose a track up to 30 minutes long.");
      if (buffer.numberOfChannels > 2) throw new Error("Choose a mono or stereo audio file. Surround audio is not supported.");
      const peaks = waveformPeaks(buffer);
      setTrack({ name: file.name, buffer, peaks });
      setRange({ start: 0, end: buffer.duration }); setCursor(0);
      setNotice("Audio loaded. Drag the handles or enter start and end times.");
    } catch (cause) {
      if (id === generation.current) setError(cause instanceof Error && cause.name === "Error" ? cause.message : "This audio could not be decoded. Try a WAV or MP3 file, or another browser.");
    } finally {
      if (id === generation.current) { setBusy(null); busyRef.current = false; }
    }
  }

  function changeRange(edge: "start" | "end", value: number) {
    if (!Number.isFinite(value)) return;
    stop(); setNotice("");
    const next = edge === "start"
      ? { ...range, start: Math.max(0, Math.min(value, range.end - minClip)) }
      : { ...range, end: Math.min(duration, Math.max(value, range.start + minClip)) };
    setRange(next);
    setCursor(next.start);
  }

  function pointerTime(event: PointerEvent) {
    const rect = wave.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * duration;
  }

  async function play() {
    if (playing) { stop(); return; }
    if (!track || busyRef.current) return;
    const id = ++playGeneration.current;
    try {
      const ctx = context.current!;
      await ctx.resume();
      if (id !== playGeneration.current) return;
      const offset = cursor >= range.start && cursor < range.end ? cursor : range.start;
      const node = ctx.createBufferSource();
      node.buffer = track.buffer; node.connect(ctx.destination);
      source.current = node;
      const began = ctx.currentTime;
      node.onended = () => {
        cancelAnimationFrame(frame.current);
        node.disconnect(); source.current = null;
        setPlaying(false); setCursor(range.start);
      };
      node.start(0, offset, range.end - offset);
      setPlaying(true); setError("");
      const tick = () => {
        setCursor(Math.min(range.end, offset + ctx.currentTime - began));
        frame.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { setError("Playback could not start. Try pressing play again."); stop(); }
  }

  async function download() {
    if (!track || busyRef.current) return;
    stop(); busyRef.current = true; setBusy("saving"); setError(""); setNotice("");
    const id = generation.current;
    // Let the saving state paint before encoding the PCM samples.
    await new Promise(resolve => setTimeout(resolve, 30));
    if (id !== generation.current) return;
    try {
      const blob = encodeWav(track.buffer, range.start, range.end);
      const name = `${track.name.replace(/\.[^.]+$/, "") || "audio"}-clip-${range.start.toFixed(3)}-${range.end.toFixed(3)}.wav`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = name;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNotice(`Download started: ${name}. Adjust the selection to make another clip.`);
      try { recordToolOutput(usageKey("audio", "audio-clipper")); } catch { /* Storage is optional. */ }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save this clip. Try a shorter selection."); }
    finally { setBusy(null); busyRef.current = false; }
  }

  return (
    <section aria-label="Audio editor" aria-busy={!!busy} className="border-y border-border py-6">
      <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm" className="sr-only" aria-label="Import audio file" disabled={!!busy}
        onChange={event => { void importFile(event.target.files?.[0]); event.target.value = ""; }} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <AudioLines className="size-6 shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="break-all font-semibold">{track ? track.name : "Your audio workspace"}</h2>
            <p className="text-sm text-muted-foreground">{track ? `${formatTime(duration)} · ${track.buffer.numberOfChannels === 1 ? "Mono" : "Stereo"} · ${track.buffer.sampleRate.toLocaleString()} Hz` : "Local processing · No upload"}</p>
          </div>
        </div>
        {track && <Button variant="editorial" size="pill" disabled={!!busy} onClick={() => input.current?.click()} className="gap-2"><Upload />Replace audio</Button>}
      </div>

      <div onDragOver={event => { event.preventDefault(); if (!busy) setDragOver(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(false); }}
        onDrop={event => { event.preventDefault(); setDragOver(false); void importFile(event.dataTransfer.files[0]); }}
        className={`rounded-xl border bg-card p-6 transition-colors max-sm:p-4 ${dragOver ? "border-brand bg-accent" : "border-border"}`}>
        {busy === "loading" ? (
          <div role="status" className="flex min-h-64 flex-col items-center justify-center gap-4"><Loader2 className="size-8 animate-spin text-brand" /><p>Decoding audio and drawing the waveform…</p></div>
        ) : !track ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <AudioLines className="mb-5 size-12 text-brand" strokeWidth={1} aria-hidden="true" />
            <h3 className="display mb-2 text-3xl">Start with an audio file</h3>
            <p className="mb-6 text-sm text-muted-foreground">Drop it here, or choose a file from your device.</p>
            <Button variant="editorial-primary" size="pill" onClick={() => input.current?.click()} className="gap-2"><Upload />Import audio</Button>
            <p className="mt-4 text-xs text-muted-foreground">MP3, WAV, M4A, and more · Up to 100 MB / 30 min</p>
          </div>
        ) : (
          <div className="motion-safe:animate-[fade_200ms_ease-out]">
            <div className="mb-5 flex items-center justify-between gap-2"><span className="mono-label text-brand">Waveform</span><span className="text-xs text-muted-foreground">Selected section will be kept</span></div>
            <div ref={wave} className="relative mx-3 h-52 touch-none select-none sm:h-60" onPointerDown={event => {
              if (busy) return;
              stop(); setCursor(Math.max(range.start, Math.min(range.end, pointerTime(event))));
            }}>
              <canvas ref={canvas} className="h-full w-full" aria-label="Audio waveform. Use the start and end controls to select a clip." role="img" />
              <div className="pointer-events-none absolute inset-y-0 border-y border-brand/50 bg-brand/5" style={{ left: `${range.start / duration * 100}%`, width: `${(range.end - range.start) / duration * 100}%` }} />
              <div className="pointer-events-none absolute inset-y-0 w-px bg-foreground" style={{ left: `${cursor / duration * 100}%` }}><span className="absolute -left-1 -top-1 size-2 rotate-45 bg-foreground" /></div>
              {(["start", "end"] as const).map(edge => (
                <button key={edge} type="button" role="slider" aria-label={`${edge === "start" ? "Start" : "End"} trim handle`} aria-orientation="horizontal"
                  aria-valuemin={edge === "start" ? 0 : range.start + minClip} aria-valuemax={edge === "start" ? range.end - minClip : duration}
                  aria-valuenow={range[edge]} aria-valuetext={formatTime(range[edge])} disabled={!!busy}
                  className="absolute inset-y-0 z-10 flex w-8 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ left: `${range[edge] / duration * 100}%` }}
                  onPointerDown={event => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); stop(); }}
                  onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) changeRange(edge, pointerTime(event)); }}
                  onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
                  onKeyDown={event => {
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    changeRange(edge, event.key === "Home" ? 0 : event.key === "End" ? duration : range[edge] + (["ArrowLeft", "ArrowDown"].includes(event.key) ? -1 : 1) * (event.shiftKey ? 1 : 0.01));
                  }}>
                  <span className="absolute inset-y-0 w-0.5 bg-brand" /><span className="relative flex h-10 w-5 items-center justify-center rounded bg-brand text-xs font-bold text-primary-foreground">Ⅱ</span>
                </button>
              ))}
            </div>
            <div className="mx-3 mt-3 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs">
              {[0, 0.25, 0.5, 0.75, 1].map(part => <span key={part} className={part === 0.25 || part === 0.75 ? "max-sm:hidden" : ""}>{formatTime(duration * part)}</span>)}
            </div>
            <p className="mt-5 text-center text-xs text-muted-foreground">Drag either handle to trim. Click the waveform to seek within your selection.</p>
          </div>
        )}
      </div>

      {track && <>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5">
          <div className="flex items-center gap-4">
            <Button variant="editorial-primary" size="pill" disabled={!!busy} onClick={() => void play()} className="gap-2">{playing ? <Pause /> : <Play />}{playing ? "Pause" : "Play selection"}</Button>
            <span className="font-mono text-sm tabular-nums" aria-label="Playback position">{formatTime(cursor)}</span>
          </div>
          <Button variant="ghost" className="min-h-11 gap-2" disabled={!!busy} onClick={() => { stop(); setRange({ start: 0, end: duration }); setCursor(0); setNotice(""); }}><RotateCcw />Reset selection</Button>
        </div>
        <fieldset disabled={!!busy} className="mt-6 grid min-w-0 grid-cols-2 items-end gap-4 sm:grid-cols-[1fr_1fr_1fr]">
          <legend className="sr-only">Clip boundaries in seconds</legend>
          {(["start", "end"] as const).map(edge => <label key={edge} className="grid min-w-0 gap-2"><span className="mono-label text-muted-foreground">{edge} (seconds)</span>
            <input type="number" aria-label={`${edge === "start" ? "Start" : "End"} time in seconds`} className={field} step="0.001"
              min={edge === "start" ? 0 : range.start + minClip} max={edge === "start" ? range.end - minClip : duration}
              key={`${edge}-${range[edge]}`} defaultValue={Number(range[edge].toFixed(3))}
              onBlur={event => {
                const value = event.target.valueAsNumber;
                const bounded = !Number.isFinite(value) ? range[edge] : edge === "start"
                  ? Math.max(0, Math.min(value, range.end - minClip))
                  : Math.min(duration, Math.max(value, range.start + minClip));
                event.target.value = bounded.toFixed(3);
                changeRange(edge, bounded);
              }}
              onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />
          </label>)}
          <div className="col-span-2 sm:col-span-1"><p className="mono-label mb-2 text-muted-foreground">Clip duration</p><p className="flex min-h-12 items-center gap-2 font-mono text-xl tabular-nums"><Scissors className="size-4 text-brand" />{formatTime(range.end - range.start)}</p></div>
        </fieldset>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">WAV · 16-bit PCM · Approx. {((Math.round(range.end * track.buffer.sampleRate) - Math.round(range.start * track.buffer.sampleRate)) * track.buffer.numberOfChannels * 2 / 1024 / 1024).toFixed(2)} MB</p>
          <Button variant="editorial-primary" size="pill" disabled={!!busy} onClick={() => void download()} className="gap-2">{busy === "saving" ? <Loader2 className="animate-spin" /> : <Download />}{busy === "saving" ? "Saving clip…" : "Save clip as WAV"}</Button>
        </div>
      </>}
      {error && <p role="alert" className="mt-5 break-words rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
      <p role="status" className="mt-4 break-words text-sm text-muted-foreground">{notice || "Your original audio stays unchanged. All editing happens in your browser."}</p>
    </section>
  );
}
