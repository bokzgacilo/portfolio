"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  categories,
  categoryLabel,
  toolHref,
  tools,
  type ToolStatus,
} from "./data";
import { formatLastRequest, readToolUsage, usageKey, type ToolUsage } from "./usage";

const ALL = "All";

/** "All" plus the two registry states. Kept in this order so the filter reads
 *  widest-first, the same way the category list does. */
const STATUSES = [ALL, "live", "soon"] as const;
type StatusFilter = (typeof STATUSES)[number];

/** The cards badge these as "LIVE" and "Soon", so the filter says the same. */
const STATUS_LABELS: Record<ToolStatus, string> = {
  live: "Live",
  soon: "Soon",
};

/** One row of a filter group: label on the left, how many tools it would leave
 *  on the right. Shared so the two groups cannot drift apart visually. */
function FilterOption({
  label,
  count,
  active,
  onSelect,
}: {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2 text-left font-[650] transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
    >
      {label}
      <span className="mono-label text-muted-foreground">{count}</span>
    </button>
  );
}

export function ToolsIndex() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>(ALL);
  const [usage, setUsage] = useState<Record<string, ToolUsage>>({});

  useEffect(() => {
    function refreshUsage() {
      setUsage(
        Object.fromEntries(
          tools.map((tool) => {
            const key = usageKey(tool.category, tool.slug);
            return [key, readToolUsage(key)];
          })
        )
      );
    }

    refreshUsage();
    window.addEventListener("storage", refreshUsage);
    window.addEventListener("tool-usage-change", refreshUsage);
    return () => {
      window.removeEventListener("storage", refreshUsage);
      window.removeEventListener("tool-usage-change", refreshUsage);
    };
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === ALL || tool.category === activeCategory;
      const matchesStatus = activeStatus === ALL || tool.status === activeStatus;
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

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [activeCategory, activeStatus, query]);

  /* Each group counts against the *other* group's selection, so a number is
     what you would actually get by clicking it -- pick "Soon" and a category
     with nothing planned reads 0 rather than its lifetime total. The search box
     is deliberately left out: counts churning on every keystroke reads as
     noise. */
  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    const byStatus = new Map<StatusFilter, number>();

    for (const tool of tools) {
      if (activeStatus === ALL || tool.status === activeStatus) {
        byCategory.set(tool.category, (byCategory.get(tool.category) ?? 0) + 1);
      }
      if (activeCategory === ALL || tool.category === activeCategory) {
        byStatus.set(tool.status, (byStatus.get(tool.status) ?? 0) + 1);
      }
    }

    return {
      category: byCategory,
      categoryTotal: tools.filter(
        (tool) => activeStatus === ALL || tool.status === activeStatus,
      ).length,
      status: byStatus,
      statusTotal: tools.filter(
        (tool) => activeCategory === ALL || tool.category === activeCategory,
      ).length,
    };
  }, [activeCategory, activeStatus]);

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
              (slug) => (
                <FilterOption
                  key={slug}
                  label={slug === ALL ? ALL : categoryLabel(slug)}
                  count={
                    slug === ALL
                      ? counts.categoryTotal
                      : (counts.category.get(slug) ?? 0)
                  }
                  active={activeCategory === slug}
                  onSelect={() => setActiveCategory(slug)}
                />
              ),
            )}
          </div>

          <div className="grid gap-[0.72rem]">
            <h2 className="text-[0.95rem] font-extrabold text-foreground">
              Status
            </h2>
            {STATUSES.map((status) => (
              <FilterOption
                key={status}
                label={status === ALL ? ALL : STATUS_LABELS[status]}
                count={
                  status === ALL
                    ? counts.statusTotal
                    : (counts.status.get(status) ?? 0)
                }
                active={activeStatus === status}
                onSelect={() => setActiveStatus(status)}
              />
            ))}
          </div>

          <p className="border-t border-border pt-[1.1rem] text-[0.92rem] leading-[1.5] text-muted-foreground">
            Everything here is free and needs no account. Tools marked{" "}
            <span className="mono-label text-brand">in browser</span> never
            upload your file.
          </p>
        </div>
      </aside>

      <div className="grid grid-cols-2 max-[1100px]:grid-cols-1">
        {filtered.map((tool) => {
          const key = usageKey(tool.category, tool.slug);
          const toolUsage = usage[key] ?? { outputs: 0, lastRequestAt: null };
          const isLive = tool.status === "live";
          const cardClassName = cn(
            "reveal group/tool flex min-h-[280px] flex-col border-r border-b border-border p-[clamp(1.2rem,2.5vw,1.7rem)] transition-colors",
            isLive
              ? "bg-card no-underline shadow-[inset_0_0_0_1px_rgb(21_20_18/0.08)] hover:bg-[rgb(255_253_248/0.86)]"
              : "bg-[rgb(255_253_248/0.28)]"
          );
          const cardContent = (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="mono-label text-brand">
                  {categoryLabel(tool.category)}
                </span>
                <span
                  className={cn(
                    "mono-label rounded-full border px-[0.66rem] py-[0.32rem]",
                    isLive
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_22px_rgb(21_20_18/0.14)]"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {isLive ? "LIVE" : "Soon"}
                </span>
              </div>

              <h3
                className={cn(
                  "display mt-[1.1rem] mb-3 text-[clamp(1.6rem,2.4vw,2.15rem)] leading-none",
                  isLive ? "text-foreground" : "text-muted-foreground"
                )}
              >
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

              <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-[0.9rem]">
                <dl className="flex min-w-0 flex-wrap gap-x-5 gap-y-2">
                  {(
                    [
                      ["Outputs", String(toolUsage.outputs)],
                      ["Last request", formatLastRequest(toolUsage.lastRequestAt)],
                    ] as const
                  ).map(([label, value]) => (
                    <div className="min-w-0" key={label}>
                      <dt className="mono-label text-muted-foreground">{label}</dt>
                      <dd
                        className={cn(
                          "mt-0.5 font-bold leading-tight tabular-nums",
                          label === "Outputs"
                            ? "text-[0.84rem] text-foreground"
                            : "text-[0.8rem] text-muted-foreground"
                        )}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <span className="inline-flex items-center gap-2 font-extrabold text-brand-dark underline decoration-border underline-offset-[0.35em]">
                  {isLive ? "Open tool" : "Details"}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover/tool:translate-x-[3px]"
                  >
                    -&gt;
                  </span>
                </span>
              </div>
            </>
          );

          return isLive ? (
            <Link className={cardClassName} href={toolHref(tool)} key={key}>
              {cardContent}
            </Link>
          ) : (
            <article className={cardClassName} key={key}>
              {cardContent}
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <p className="border-r border-b border-border p-[clamp(1.2rem,2.5vw,1.7rem)] text-muted-foreground max-[1100px]:col-span-1 col-span-2">
            No tools match those filters yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
