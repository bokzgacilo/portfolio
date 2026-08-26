"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { categories, categoryLabel, toolHref, tools } from "./data";

const ALL = "All";

export function ToolsIndex() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === ALL || tool.category === activeCategory;
      const matchesSearch =
        !search ||
        [
          tool.title,
          tool.description,
          categoryLabel(tool.category),
          ...tool.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const tool of tools) {
      map.set(tool.category, (map.get(tool.category) ?? 0) + 1);
    }
    return map;
  }, []);

  return (
    <div className="grid grid-cols-[minmax(260px,0.28fr)_minmax(0,1fr)] border-t border-l border-border max-[900px]:grid-cols-1">
      <aside
        className="border-r border-b border-border bg-[rgb(255_253_248/0.4)]"
        aria-label="Tool filters"
      >
        <div className="reveal sticky top-[5.25rem] grid content-start gap-[1.8rem] p-[clamp(1rem,2.5vw,1.6rem)] max-[900px]:static">
          <label className="grid gap-[0.6rem]">
            <span className="text-[0.95rem] font-extrabold text-foreground">
              Search
            </span>
            <Input
              type="search"
              className="min-h-11 rounded-full border-border bg-card px-4 py-[0.65rem] text-base text-foreground md:text-base"
              placeholder="Search tools"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search tools"
            />
          </label>

          <div className="grid gap-[0.72rem]">
            <h2 className="text-[0.95rem] font-extrabold text-foreground">
              Category
            </h2>
            {[ALL, ...categories.map((category) => category.slug)].map(
              (slug) => {
                const label = slug === ALL ? ALL : categoryLabel(slug);
                const count =
                  slug === ALL ? tools.length : (counts.get(slug) ?? 0);

                return (
                  <button
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-2 text-left font-[650] transition-colors hover:text-foreground",
                      activeCategory === slug
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    type="button"
                    key={slug}
                    onClick={() => setActiveCategory(slug)}
                    aria-pressed={activeCategory === slug}
                  >
                    {label}
                    <span className="mono-label text-muted-foreground">
                      {count}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <p className="border-t border-border pt-[1.1rem] text-[0.92rem] leading-[1.5] text-muted-foreground">
            Everything here is free and needs no account. Tools marked{" "}
            <span className="mono-label text-brand">in browser</span> never
            upload your file.
          </p>
        </div>
      </aside>

      <div className="grid grid-cols-2 max-[1100px]:grid-cols-1">
        {filtered.map((tool) => (
          <article
            className="reveal group/tool flex min-h-[260px] flex-col border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1.2rem,2.5vw,1.7rem)] transition-colors hover:bg-[rgb(255_253_248/0.72)]"
            key={`${tool.category}/${tool.slug}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="mono-label text-brand">
                {categoryLabel(tool.category)}
              </span>
              <span
                className={cn(
                  "mono-label rounded-full border px-[0.55rem] py-[0.25rem]",
                  tool.status === "live"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {tool.status === "live" ? "Live" : "Soon"}
              </span>
            </div>

            <h3 className="display mt-[1.1rem] mb-3 text-[clamp(1.6rem,2.4vw,2.15rem)] leading-none">
              {tool.title}
            </h3>
            <p className="mb-4 max-w-[46ch] text-muted-foreground">
              {tool.description}
            </p>

            <div className="mb-5 flex flex-wrap gap-[0.7rem]">
              {tool.tags.map((tag) => (
                <Badge variant="chip" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-[0.9rem]">
              <span className="mono-label text-muted-foreground">
                {tool.runs === "browser" ? "In browser" : "On server"}
              </span>
              <Link
                className="inline-flex items-center gap-2 font-extrabold text-brand-dark underline decoration-border underline-offset-[0.35em]"
                href={toolHref(tool)}
              >
                {tool.status === "live" ? "Open tool" : "Details"}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover/tool:translate-x-[3px]"
                >
                  -&gt;
                </span>
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <p className="border-r border-b border-border p-[clamp(1.2rem,2.5vw,1.7rem)] text-muted-foreground max-[1100px]:col-span-1 col-span-2">
            No tools match that search yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
