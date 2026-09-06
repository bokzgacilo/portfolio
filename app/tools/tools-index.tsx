"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { categories, categoryLabel, toolHref, tools } from "./data";
import { usageKey } from "./usage";
import { ResourceStatistics } from "../components/statistics/client";

const ALL = "All";

export function ToolsIndex() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === ALL || tool.category === activeCategory;
      const matchesSearch = !search || [tool.title, tool.description, categoryLabel(tool.category), ...tool.tags].join(" ").toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  return (
    <div className="border-t border-l border-border">
      <div className="sticky top-[5.5rem] z-[5] flex flex-wrap items-center gap-3 border-r border-b border-border bg-[rgb(243_247_251/0.94)] p-[clamp(0.9rem,2vw,1.25rem)] backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1" aria-label="Tool categories">
          {[ALL, ...categories.map((category) => category.slug)].map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveCategory(slug)}
              aria-pressed={activeCategory === slug}
              className={cn(
                "mono-label shrink-0 rounded-full border px-4 py-2 transition-colors",
                activeCategory === slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-brand hover:text-brand-dark",
              )}
            >
              {slug === ALL ? ALL : categoryLabel(slug)}
            </button>
          ))}
        </div>
        <Input
          type="search"
          className="min-h-11 w-full rounded-full border-border bg-card px-4 py-[0.65rem] text-base text-foreground md:w-[min(320px,32vw)] md:text-base"
          placeholder="Search tools"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search tools"
        />
      </div>

      <div>
        {filtered.map((tool) => {
          const key = usageKey(tool.category, tool.slug);
          const isLive = tool.status === "live";
          const content = (
            <>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="mono-label text-brand">{categoryLabel(tool.category)}</span>
                  <span className={cn("mono-label rounded-full border px-2 py-1", isLive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>{isLive ? "LIVE" : "SOON"}</span>
                </div>
                <h3 className={cn("display mt-3 text-[clamp(1.45rem,2.4vw,2rem)] leading-none", !isLive && "text-muted-foreground")}>{tool.title}</h3>
                <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">{tool.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">{tool.tags.map((tag) => <Badge variant="chip" key={tag}>{tag}</Badge>)}</div>
              </div>
              <div className="flex shrink-0 items-end gap-5 max-[700px]:w-full max-[700px]:justify-between">
                {isLive && <ResourceStatistics resource={`tool/${key}`} kind="tool" />}
                <span className="font-extrabold text-brand-dark underline decoration-border underline-offset-[0.35em]">{isLive ? "Open tool" : "Details"} <span aria-hidden="true">-&gt;</span></span>
              </div>
            </>
          );
          const className = "reveal group/tool flex items-end gap-8 border-r border-b border-border bg-card p-[clamp(1rem,2.5vw,1.6rem)] transition-colors hover:bg-[rgb(232_242_251/0.7)] max-[700px]:flex-col max-[700px]:items-start";
          return isLive ? <Link className={className} href={toolHref(tool)} key={key}>{content}</Link> : <article className={className} key={key}>{content}</article>;
        })}
        {filtered.length === 0 && <p className="border-r border-b border-border p-6 text-muted-foreground">No tools match those filters yet.</p>}
      </div>
    </div>
  );
}
