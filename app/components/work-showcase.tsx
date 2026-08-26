"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ButtonArrow, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { projects, projectTypes } from "../data/projects";

const cardShell =
  "reveal relative overflow-hidden border-r border-b border-border bg-card transition-[border-color,box-shadow] hover:border-[rgb(21_20_18/0.22)] hover:shadow-lift";

export function WorkShowcase({ variant = "catalog" }: { variant?: "carousel" | "catalog" }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<(typeof projectTypes)[number]>("All");

  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesType = activeType === "All" || project.type === activeType;
      const matchesSearch =
        !search ||
        [project.title, project.kicker, project.description, project.type, ...project.tags, ...project.techStack]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesType && matchesSearch;
    });
  }, [activeType, query]);

  const isCarousel = variant === "carousel";

  return (
    <div
      className={
        isCarousel
          ? "mx-[calc(var(--gallery-bleed)_*_-1)]"
          : "grid grid-cols-[minmax(260px,0.28fr)_minmax(0,1fr)] items-start border-t border-l border-border max-[900px]:grid-cols-1"
      }
    >
      {isCarousel ? null : (
        <aside
          className="reveal sticky top-[5.25rem] grid min-h-[720px] content-start gap-[1.8rem] border-r border-b border-border bg-[rgb(255_253_248/0.4)] p-[clamp(1rem,2.5vw,1.6rem)] max-[900px]:static max-[900px]:min-h-0"
          aria-label="Recent work filters"
        >
          <label className="grid gap-[0.6rem]">
            <span className="text-[0.95rem] font-extrabold text-foreground">Search</span>
            <Input
              type="search"
              className="min-h-11 rounded-full border-border bg-card px-4 py-[0.65rem] text-base text-foreground md:text-base"
              placeholder="Search projects"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search projects"
            />
          </label>

          <div className="grid gap-[0.72rem]">
            <h3 className="text-[0.95rem] font-extrabold text-foreground">Type</h3>
            {projectTypes.map((item) => (
              <button
                className={cn(
                  "w-full cursor-pointer text-left font-[650] transition-colors hover:text-foreground",
                  activeType === item ? "text-foreground" : "text-muted-foreground"
                )}
                type="button"
                key={item}
                onClick={() => setActiveType(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-[0.72rem]">
            <h3 className="text-[0.95rem] font-extrabold text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-[0.7rem]">
              {Array.from(new Set(projects.flatMap((project) => project.tags))).map((tag) => (
                <Badge variant="chip" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </aside>
      )}

      <div
        className={
          isCarousel
            ? "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [padding-inline:var(--gallery-bleed)] [scrollbar-width:thin]"
            : "grid"
        }
      >
        {filteredProjects.map((project, index) => (
          <motion.article
            className={cn(
              cardShell,
              isCarousel
                ? "min-h-[min(72vw,700px)] flex-[0_0_min(84vw,1040px)] snap-start border border-border max-[900px]:min-h-[560px] max-[900px]:flex-[0_0_min(88vw,720px)] max-[560px]:min-h-[520px]"
                : "min-h-[620px] max-[560px]:min-h-[520px]"
            )}
            key={project.title}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              className="group/card relative isolate grid min-h-[inherit] items-end text-inherit no-underline"
              href={`/works/${project.slug}`}
              aria-label={`View ${project.title} case study`}
            >
              <span className="absolute inset-0 -z-2 size-full overflow-hidden bg-secondary">
                <img
                  className="block size-full object-contain object-top transition-transform duration-[450ms] group-hover/card:scale-[1.025] group-focus-visible/card:scale-[1.025]"
                  src={project.image}
                  alt={project.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </span>

              {/* Scrim that lifts the copy panel off the screenshot. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-1 [background-image:linear-gradient(180deg,rgb(255_253_248/0)_34%,rgb(255_253_248/0.84)_70%,rgb(255_253_248/0.98)_100%),linear-gradient(90deg,rgb(21_20_18/0.08),rgb(21_20_18/0))]"
              />

              <span
                className={cn(
                  "mx-4 mt-auto mb-4 flex flex-col justify-between gap-[1.25rem] border border-[rgb(21_20_18/0.1)] bg-[rgb(255_253_248/0.9)] p-[clamp(1rem,2vw,1.45rem)] backdrop-blur-[18px]",
                  isCarousel ? "w-[min(720px,calc(100%_-_2rem))]" : "w-[min(680px,calc(100%_-_2rem))]",
                  "max-[900px]:mx-3 max-[900px]:mb-3 max-[900px]:w-[calc(100%_-_1.5rem)]"
                )}
              >
                <span className="grid gap-[0.85rem]">
                  <span className="mono-label text-muted-foreground">{project.kicker}</span>
                  <span className="display block text-[clamp(2.4rem,4vw,4.6rem)] font-bold leading-none max-[560px]:text-[2.35rem]">
                    {project.title}
                  </span>
                  <span className="block max-w-[58ch] text-[1.05rem] leading-[1.55] text-muted-foreground">
                    {project.description}
                  </span>
                </span>

                <span className="grid gap-[0.85rem]">
                  <span className="flex flex-wrap gap-[0.7rem]">
                    {project.tags.map((tag) => (
                      <Badge variant="chip" key={tag}>
                        {tag}
                      </Badge>
                    ))}
                  </span>
                  {/* A span, not a Button: it already sits inside the card's link. */}
                  <span
                    data-variant="cta-filled"
                    className={buttonVariants({ variant: "cta-filled", size: "pill-cta" })}
                  >
                    View Case Study
                    <ButtonArrow />
                  </span>
                </span>
              </span>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
