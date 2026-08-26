"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { projects } from "../data/projects";

/** Dwell per slide -- long enough to read the caption before it moves on. */
const AUTOPLAY_MS = 5600;
/** Horizontal drag distance that counts as a deliberate swipe. */
const SWIPE_THRESHOLD = 56;

/**
 * The slide travels a short distance rather than a full panel width: the
 * crossfade carries the transition, so a large x-offset only reads as jitter.
 */
const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? "6%" : "-6%" }),
  center: { opacity: 1, x: "0%" },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? "-6%" : "6%" }),
};

export function HeroCarousel() {
  /** Index paired with travel direction so exit and enter animate the same way. */
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const count = projects.length;
  const project = projects[index];

  const step = useCallback(
    (delta: number) =>
      setSlide(([current]) => [(current + delta + count) % count, Math.sign(delta)]),
    [count]
  );

  const jumpTo = useCallback(
    (next: number) =>
      setSlide(([current]) => [next, Math.sign(next - current)]),
    []
  );

  useEffect(() => {
    /* Reduced-motion visitors get a static first slide plus the controls. */
    if (paused || reduceMotion) return;
    const timer = setInterval(() => step(1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, step]);

  return (
    <div
      className="relative grid max-h-[880px] min-h-[min(76vh,820px)] grid-rows-[minmax(0,1fr)_auto] gap-[0.7rem] overflow-hidden rounded-lg bg-secondary p-[0.9rem] shadow-editorial [animation:fade_0.9s_ease_0.15s_both] max-[900px]:min-h-[560px] max-[560px]:min-h-[410px]"
      role="group"
      aria-roledescription="carousel"
      aria-label="Selected work"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") step(-1);
        if (event.key === "ArrowRight") step(1);
      }}
    >
      <div className="relative min-h-0 overflow-hidden border border-[rgb(216_209_197/0.72)] bg-card">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            className="absolute inset-0"
            key={project.slug}
            custom={direction}
            variants={reduceMotion ? undefined : slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 0.61, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) step(1);
              else if (info.offset.x > SWIPE_THRESHOLD) step(-1);
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}: ${project.title}`}
          >
            <Link
              className="group/slide block size-full"
              href={`/works/${project.slug}`}
              aria-label={`View the ${project.title} case study`}
              /* Otherwise a swipe that ends on the image also navigates. */
              draggable={false}
            >
              <img
                className="block size-full object-contain object-top transition-transform duration-[450ms] group-hover/slide:scale-[1.02]"
                src={project.image}
                alt={project.alt}
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-3">
        {/* Only the caption is live: announcing the whole panel would re-read
            the controls on every advance. */}
        <div className="grid min-w-0 gap-[0.12rem]" aria-live="polite" aria-atomic="true">
          <span className="mono-label text-[0.62rem] text-muted-foreground">{project.kicker}</span>
          <Link
            className="display truncate text-[clamp(1rem,1.15vw,1.25rem)] leading-tight text-foreground no-underline transition-colors hover:text-brand"
            href={`/works/${project.slug}`}
          >
            {project.title}
          </Link>
        </div>

        <div className="flex flex-none items-center gap-[0.55rem]">
          <div className="flex items-center gap-[0.32rem]">
            {projects.map((item, itemIndex) => (
              <button
                className={cn(
                  "h-[6px] cursor-pointer rounded-full border-0 transition-all",
                  itemIndex === index
                    ? "w-[18px] bg-foreground"
                    : "w-[6px] bg-[rgb(21_20_18/0.24)] hover:bg-[rgb(21_20_18/0.44)]"
                )}
                type="button"
                key={item.slug}
                onClick={() => jumpTo(itemIndex)}
                aria-label={`Show ${item.title}`}
                aria-current={itemIndex === index}
              />
            ))}
          </div>

          {(
            [
              ["Previous work", -1, "<-"],
              ["Next work", 1, "->"],
            ] as const
          ).map(([label, delta, glyph]) => (
            <button
              className="grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-card font-mono text-[0.72rem] text-brand-dark transition-colors hover:border-foreground hover:text-foreground"
              type="button"
              key={label}
              onClick={() => step(delta)}
              aria-label={label}
            >
              <span aria-hidden="true">{glyph}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
