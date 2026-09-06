"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, FileSpreadsheet, KeyRound, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { recordToolOutput, usageKey } from "../../usage";

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 5;
type Result = { name: string; size: number; url: string; totalSheets: number; lockedSheets: number; unlockedSheets: number };

function errorMessage(response: Response, body: string) {
  try {
    const parsed = JSON.parse(body) as { error?: string; detail?: string };
    return parsed.error || parsed.detail || "The workbook could not be unlocked.";
  } catch {
    return response.status === 413 ? "That workbook is larger than the 50 MB limit." : "The workbook could not be unlocked.";
  }
}

export default function ExcelUnlocker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => () => results.forEach((result) => URL.revokeObjectURL(result.url)), [results]);

  const choose = (selected: FileList | null) => {
    setError("");
    if (!selected) return;
    const next = [...files, ...Array.from(selected)];
    if (next.length > MAX_FILES) { setError(`Choose up to ${MAX_FILES} workbooks at a time.`); return; }
    const invalid = next.find((file) => !/\.(xlsx|xlsm)$/i.test(file.name));
    if (invalid) { setError(`${invalid.name} is not an .xlsx or .xlsm workbook.`); return; }
    const oversized = next.find((file) => file.size > MAX_BYTES);
    if (oversized) { setError(`${oversized.name} is larger than the 50 MB limit.`); return; }
    results.forEach((result) => URL.revokeObjectURL(result.url));
    setResults([]); setFiles(next);
  };

  const remove = (index: number) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));

  async function submit() {
    if (!files.length || busy) return;
    setBusy(true); setError("");
    const nextResults: Result[] = [];
    const failures: string[] = [];
    try {
      for (const file of files) {
        try {
        const form = new FormData(); form.append("file", file); form.append("password", password);
        const response = await fetch("/api/tools/excel-unlocker", { method: "POST", body: form });
        if (!response.ok) throw new Error(`${file.name}: ${errorMessage(response, await response.text())}`);
        const blob = await response.blob();
        const name = response.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/)?.[1] || `${file.name.replace(/\.(xlsx|xlsm)$/i, "")}-unlocked${/\.xlsm$/i.test(file.name) ? ".xlsm" : ".xlsx"}`;
        nextResults.push({
          name,
          size: blob.size,
          url: URL.createObjectURL(blob),
          totalSheets: Number(response.headers.get("X-Excel-Total-Sheets") || 0),
          lockedSheets: Number(response.headers.get("X-Excel-Locked-Sheets") || 0),
          unlockedSheets: Number(response.headers.get("X-Excel-Unlocked-Sheets") || 0),
        });
        } catch (cause) {
          failures.push(cause instanceof Error ? cause.message : `${file.name}: could not be unlocked`);
        }
      }
      setResults(nextResults);
      if (nextResults.length) recordToolOutput(usageKey("data", "excel-unlocker"));
      if (failures.length) setError(failures.join(" "));
    } catch (cause) {
      nextResults.forEach((result) => URL.revokeObjectURL(result.url));
      setError(cause instanceof Error ? cause.message : "The workbooks could not be unlocked.");
    } finally { setBusy(false); }
  }

  return (
    <section className="border border-border bg-[rgb(255_253_248/0.42)] p-[clamp(1rem,3vw,2rem)]" aria-label="Excel unlocker">
      <input ref={inputRef} className="sr-only" type="file" multiple accept=".xlsx,.xlsm" onChange={(event) => choose(event.target.files)} />
      {!files.length ? (
        <button type="button" onClick={() => inputRef.current?.click()} className="grid min-h-[230px] w-full place-items-center border border-dashed border-border p-8 text-center transition-colors hover:bg-background">
          <span className="grid justify-items-center gap-3"><Upload className="size-8 text-brand" /><strong className="display text-2xl">Choose Excel workbooks</strong><span className="text-muted-foreground">XLSX or XLSM, up to 50 MB each · maximum 5 files</span></span>
        </button>
      ) : (
        <div className="grid gap-5">
          <div className="grid gap-2">{files.map((file, index) => <div className="flex items-center gap-3 border-b border-border py-3" key={`${file.name}-${file.lastModified}`}><FileSpreadsheet className="size-6 shrink-0 text-brand" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{file.name}</p><p className="mono-label text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" aria-label={`Remove ${file.name}`} onClick={() => remove(index)}><X className="size-5" /></button></div>)}</div>
          <button type="button" onClick={() => inputRef.current?.click()} className="justify-self-start text-sm font-semibold text-brand underline underline-offset-4">Add more files ({files.length}/{MAX_FILES})</button>
          <label className="grid gap-2"><span className="mono-label text-muted-foreground">File password <span className="normal-case">(only needed for encrypted files)</span></span><span className="relative"><KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Optional password" className="h-11 w-full border border-border bg-background pl-10 pr-3 outline-none focus:border-brand" /></span></label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <Button type="button" onClick={submit} disabled={busy} variant="cta-filled" size="pill-cta" className="min-h-[64px] w-full justify-between px-6 text-lg md:text-xl"><span className="inline-flex items-center gap-2">{busy && <Loader2 className="size-5 animate-spin" />}{busy ? `Unlocking ${files.length} file${files.length === 1 ? "" : "s"}...` : `Unlock ${files.length} file${files.length === 1 ? "" : "s"}`}</span><ButtonArrow className="size-8 text-base" /></Button>
        </div>
      )}
      <AnimatePresence>{results.length > 0 && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-border pt-6"><div className="mb-4 flex items-center gap-2 text-green-700"><Check className="size-5" /><h2 className="display text-2xl">Thank you for using the tool.</h2></div><p className="mb-4 text-sm text-muted-foreground">Your unlocked files are ready below.</p><div className="grid gap-2">{results.map((result) => <div className="flex items-center gap-3 border border-border bg-background p-3" key={result.name}><FileSpreadsheet className="size-5 shrink-0 text-brand" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{result.name}</p><p className="mt-1 text-xs text-muted-foreground">{result.totalSheets} total sheets · {result.lockedSheets} locked detected · {result.unlockedSheets} unlocked</p></div><a className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4" href={result.url} download={result.name}><Download className="size-4" />Download</a></div>)}</div></motion.div>}</AnimatePresence>
      <p className="mt-4 text-xs text-muted-foreground">Processed in memory. Your workbooks are returned directly and are not stored.</p>
    </section>
  );
}
