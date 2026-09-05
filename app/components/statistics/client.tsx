"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { blogKey, statisticResources, type ResourceStats } from "./registry";
import { blogs } from "@/app/data/blogs";

let memoryVisitor: string | undefined;
function visitorId() {
  if (memoryVisitor) return memoryVisitor;
  try {
    const stored = localStorage.getItem("statistics-visitor");
    if (stored && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)) memoryVisitor = stored;
  } catch { /* Fall back to an identifier for this page session. */ }
  memoryVisitor ??= crypto.randomUUID();
  try { localStorage.setItem("statistics-visitor", memoryVisitor); } catch { /* Optional storage. */ }
  return memoryVisitor;
}

export function recordStatistic(resource: string, event: "visit" | "complete" | "open") {
  if (typeof window === "undefined") return;
  // Tracking must never interfere with an output, download, or navigation.
  try {
    void fetch("/api/statistics", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ resource, event, visitor: visitorId(), eventId: crypto.randomUUID() }),
    }).then(response => { if (response.ok) window.dispatchEvent(new Event("statistics-change")); }).catch(() => {});
  } catch { /* Best-effort analytics. */ }
}

type State = { stats: Record<string, ResourceStats>; status: "loading" | "live" | "unavailable" };
const StatisticsContext = createContext<State>({ stats: {}, status: "loading" });

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<State>({ stats: {}, status: "loading" });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const resource = statisticResources.find(item => item.kind === "tool" && `/tools/${item.key.slice(5)}` === pathname);
    if (resource) recordStatistic(resource.key, "visit");
  }, [pathname]);

  useEffect(() => {
    // Delegate blog clicks so homepage, blog index, and navigation links agree.
    function opened(event: MouseEvent) {
      if (event.type === "auxclick" && event.button !== 1) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      const blog = blogs.find(item => item.href === link?.href);
      if (blog) recordStatistic(blogKey(blog.href), "open");
    }
    document.addEventListener("click", opened);
    document.addEventListener("auxclick", opened);
    return () => { document.removeEventListener("click", opened); document.removeEventListener("auxclick", opened); };
  }, []);

  useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;
    let refreshing = false;
    let queued = false;
    async function refresh() {
      if (document.hidden) return;
      if (refreshing) { queued = true; return; }
      refreshing = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10000);
      try {
        const response = await fetch("/api/statistics", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (!Array.isArray(data.stats)) throw new Error("Invalid statistics");
        if (!disposed) setState({ stats: Object.fromEntries(data.stats.map((row: ResourceStats) => [row.resource_key, row])), status: "live" });
      } catch { if (!disposed) setState(current => ({ ...current, status: "unavailable" })); }
      finally {
        clearTimeout(timeout); refreshing = false;
        if (queued && !disposed) { queued = false; void refresh(); }
      }
    }
    void refresh();
    const timer = setInterval(refresh, 15000);
    window.addEventListener("statistics-change", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true; controller?.abort(); clearInterval(timer);
      window.removeEventListener("statistics-change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return <StatisticsContext.Provider value={state}>{children}</StatisticsContext.Provider>;
}

export function ResourceStatistics({ resource, kind }: { resource: string; kind: "tool" | "blog" }) {
  const { stats, status } = useContext(StatisticsContext);
  const row = stats[resource];
  const value = (count: number | undefined) => status === "live" ? new Intl.NumberFormat("en-US").format(count ?? 0) : "—";
  return (
    <span className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground" data-resource-statistics={resource}>
      <span><strong className="font-mono font-medium tabular-nums text-foreground">{value(row?.visitors)}</strong> visitors</span>
      <span><strong className="font-mono font-medium tabular-nums text-foreground">{value(kind === "tool" ? row?.completed : row?.opens)}</strong> {kind === "tool" ? "tasks completed" : "article opens"}</span>
      <span className="inline-flex items-center gap-1.5" title={kind === "tool" ? "Unique browsers and successful actions since tracking began. Refreshes every 15 seconds." : "Unique browsers opening this article from this site. Reading completion on Medium is not measured. Refreshes every 15 seconds."}>
        <span aria-hidden="true" className={`size-1.5 rounded-full ${status === "live" ? "bg-brand" : "bg-border"}`} />
        {status === "live" ? "Live · 15s" : status === "loading" ? "Loading stats…" : "Stats unavailable"}
      </span>
    </span>
  );
}
