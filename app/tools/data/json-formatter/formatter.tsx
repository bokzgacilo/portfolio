"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Clipboard, Download, FileJson, FoldHorizontal, Sparkles, Trash2 } from "lucide-react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { recordToolOutput, usageKey } from "@/app/tools/usage";

import { type JsonValue, parseJson, previewValue, valueKind } from "./json";

const SAMPLE_JSON = `{
  "project": "portfolio tools",
  "live": true,
  "formats": ["json", "tree", "minified"],
  "owner": {
    "name": "Ariel",
    "timezone": "Asia/Manila"
  },
  "limits": {
    "maxDepth": 12,
    "localOnly": true
  }
}`;

type ViewMode = "tree" | "pretty" | "minified";

function pathKey(path: string[]) {
  return JSON.stringify(path);
}

function countChildren(value: JsonValue) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return 0;
}

function collectExpandable(value: JsonValue, path: string[] = [], keys = new Set<string>()) {
  if (!value || typeof value !== "object") return keys;
  keys.add(pathKey(path));

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);

  for (const [key, child] of entries) {
    collectExpandable(child, [...path, key], keys);
  }

  return keys;
}

function JsonTreeNode({
  name,
  value,
  path,
  collapsed,
  onToggle,
}: {
  name: string;
  value: JsonValue;
  path: string[];
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  const kind = valueKind(value);
  const expandable = Boolean(value && typeof value === "object");
  const key = pathKey(path);
  const isCollapsed = collapsed.has(key);
  const children = countChildren(value);
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : value && typeof value === "object"
      ? Object.entries(value)
      : [];

  return (
    <li className="min-w-0">
      <div className="group/tree flex min-h-8 min-w-0 items-center gap-2 border-b border-border/70 py-1.5">
        {expandable ? (
          <button
            className="grid size-7 flex-none cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[rgb(21_20_18/0.06)] hover:text-foreground"
            type="button"
            onClick={() => onToggle(key)}
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${name}`}
          >
            {isCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>
        ) : (
          <span className="size-7 flex-none" aria-hidden="true" />
        )}
        <span className="min-w-0 truncate font-mono text-[0.86rem] font-[750] text-foreground">
          {name}
        </span>
        <span
          className={cn(
            "mono-label flex-none rounded-full border px-2 py-0.5",
            kind === "string" && "border-brand/20 text-brand",
            kind === "number" && "border-primary/20 text-primary",
            kind === "boolean" && "border-foreground/20 text-foreground",
            kind === "null" && "border-muted-foreground/20 text-muted-foreground",
            (kind === "object" || kind === "array") && "border-border text-muted-foreground"
          )}
        >
          {kind}
        </span>
        <span className="min-w-0 truncate font-mono text-[0.84rem] text-muted-foreground">
          {expandable ? `${children} ${children === 1 ? "item" : "items"}` : previewValue(value)}
        </span>
      </div>
      {expandable && !isCollapsed ? (
        <ol className="ml-4 border-l border-border pl-3">
          {entries.map(([childName, child]) => (
            <JsonTreeNode
              key={pathKey([...path, childName])}
              name={Array.isArray(value) ? `[${childName}]` : childName}
              value={child as JsonValue}
              path={[...path, childName]}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    return parseJson(input);
  }, [input]);

  const formatted = parsed?.ok ? parsed.pretty : "";
  const minified = parsed?.ok ? parsed.minified : "";
  const outputText = viewMode === "minified" ? minified : formatted;

  useEffect(() => {
    setCopied(false);
  }, [input, viewMode]);

  function formatInput() {
    if (!parsed?.ok) return;
    setInput(parsed.pretty);
    setViewMode("tree");
    setCollapsed(new Set());
    recordToolOutput(usageKey("data", "json-formatter"));
  }

  function minifyInput() {
    if (!parsed?.ok) return;
    setInput(parsed.minified);
    setViewMode("minified");
    recordToolOutput(usageKey("data", "json-formatter"));
  }

  async function copyOutput() {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    recordToolOutput(usageKey("data", "json-formatter"));
  }

  function downloadOutput() {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "formatted.json";
    link.click();
    URL.revokeObjectURL(href);
    recordToolOutput(usageKey("data", "json-formatter"));
  }

  function toggleNode(key: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function collapseAll() {
    if (!parsed?.ok) return;
    setCollapsed(collectExpandable(parsed.value));
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  const isValid = parsed?.ok === true;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] border-t border-l border-border max-[980px]:grid-cols-1">
      <section className="grid min-w-0 content-start gap-4 border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.95rem] font-extrabold text-foreground">JSON input</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="editorial" size="pill" className="min-h-10 px-4 py-2" onClick={() => setInput(SAMPLE_JSON)}>
              <FileJson aria-hidden="true" />
              Sample
            </Button>
            <Button variant="editorial" size="pill" className="min-h-10 px-4 py-2" onClick={() => setInput("")}>
              <Trash2 aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        <Textarea
          className="min-h-[520px] resize-y rounded-none border-border bg-card p-4 font-mono text-[0.92rem] leading-[1.65] shadow-none focus-visible:border-foreground focus-visible:ring-0 max-[980px]:min-h-[340px]"
          spellCheck={false}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='Paste JSON here, like {"name":"Ariel"}'
          aria-label="JSON input"
        />

        {parsed && !parsed.ok ? (
          <p className="border-t border-border pt-3 text-[0.95rem] leading-[1.5] text-destructive" role="alert">
            {parsed.line && parsed.column
              ? `Invalid JSON at line ${parsed.line}, column ${parsed.column}: ${parsed.message}`
              : `Invalid JSON: ${parsed.message}`}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="editorial-primary" size="pill" className="border-0" disabled={!isValid} onClick={formatInput}>
            <Sparkles aria-hidden="true" />
            Prettify
          </Button>
          <Button variant="editorial" size="pill" disabled={!isValid} onClick={minifyInput}>
            Minify
          </Button>
        </div>
      </section>

      <aside className="grid min-w-0 content-start gap-[1.3rem] border-r border-b border-border p-[clamp(1rem,2.5vw,1.6rem)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[0.95rem] font-extrabold text-foreground">Output viewer</h2>
            <p className="mt-1 text-[0.9rem] text-muted-foreground">
              {isValid ? "Valid JSON, ready to inspect or copy." : "Paste valid JSON to generate the viewer."}
            </p>
          </div>
          <span
            className={cn(
              "mono-label rounded-full border px-[0.66rem] py-[0.32rem]",
              isValid ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            )}
          >
            {isValid ? "Valid" : "Waiting"}
          </span>
        </div>

        <div className="grid grid-cols-3 rounded-full border border-border bg-card p-1">
          {(["tree", "pretty", "minified"] as const).map((mode) => (
            <button
              className={cn(
                "min-h-9 cursor-pointer rounded-full px-3 text-[0.82rem] font-bold transition-colors",
                viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
            >
              {mode === "tree" ? "Tree" : mode === "pretty" ? "Pretty" : "Minified"}
            </button>
          ))}
        </div>

        {parsed?.ok ? (
          <dl className="grid grid-cols-4 gap-px overflow-hidden border border-border bg-border max-[520px]:grid-cols-2">
            {(
              [
                ["Keys", parsed.stats.keys],
                ["Objects", parsed.stats.objects],
                ["Arrays", parsed.stats.arrays],
                ["Depth", parsed.stats.depth],
              ] as const
            ).map(([label, value]) => (
              <div className="bg-[rgb(255_253_248/0.72)] p-3" key={label}>
                <dt className="mono-label text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-[1.15rem] font-extrabold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="min-h-[420px] overflow-auto border border-border bg-card p-3">
          {parsed?.ok ? (
            viewMode === "tree" ? (
              <ol>
                <JsonTreeNode
                  name="$"
                  value={parsed.value}
                  path={[]}
                  collapsed={collapsed}
                  onToggle={toggleNode}
                />
              </ol>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-[0.84rem] leading-[1.65] text-foreground">
                {outputText}
              </pre>
            )
          ) : (
            <div className="grid min-h-[390px] place-items-center text-center text-muted-foreground">
              <span className="max-w-[32ch]">The formatted output and tree view will appear here.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {viewMode === "tree" ? (
            <>
              <Button variant="editorial" size="pill" disabled={!isValid} onClick={collapseAll}>
                <FoldHorizontal aria-hidden="true" />
                Collapse all
              </Button>
              <Button variant="editorial" size="pill" disabled={!isValid} onClick={expandAll}>
                Expand all
              </Button>
            </>
          ) : null}
          <Button variant="cta-filled" size="pill-cta" disabled={!isValid} onClick={copyOutput}>
            {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
            <ButtonArrow />
          </Button>
          <Button variant="editorial" size="pill" disabled={!isValid} onClick={downloadOutput}>
            <Download aria-hidden="true" />
            Download
          </Button>
        </div>
      </aside>
    </div>
  );
}
