"use client";

export type ToolUsage = {
  outputs: number;
  lastRequestAt: string | null;
};

const EMPTY_USAGE: ToolUsage = { outputs: 0, lastRequestAt: null };

export function usageKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

function storageKey(key: string) {
  return `tool-usage:${key}`;
}

export function readToolUsage(key: string): ToolUsage {
  if (typeof window === "undefined") return EMPTY_USAGE;

  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return EMPTY_USAGE;

    const parsed = JSON.parse(raw) as Partial<ToolUsage>;
    return {
      outputs: Number.isFinite(parsed.outputs) ? Number(parsed.outputs) : 0,
      lastRequestAt: typeof parsed.lastRequestAt === "string" ? parsed.lastRequestAt : null,
    };
  } catch {
    return EMPTY_USAGE;
  }
}

export function recordToolOutput(key: string) {
  if (typeof window === "undefined") return;

  const current = readToolUsage(key);
  const next: ToolUsage = {
    outputs: current.outputs + 1,
    lastRequestAt: new Date().toISOString(),
  };

  window.localStorage.setItem(storageKey(key), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("tool-usage-change", { detail: { key, usage: next } }));
}

export function formatLastRequest(value: string | null) {
  if (!value) return "No requests yet";

  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(then) || diff < 0) return "Just now";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
