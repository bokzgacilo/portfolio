"use client";

import { useEffect, useRef } from "react";

const COMPACT = "(max-width: 900px)";
const STILL = "(prefers-reduced-motion: reduce)";

type CaseTitleProps = {
  title: string;
};

/**
 * The one and only case-study title. It stays in the hero's flow and is never
 * re-parented -- scrolling only transforms it, so it appears to travel into the
 * sticky sidebar slot marked with `data-case-title-target`.
 */
export default function CaseTitle({ title }: CaseTitleProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const heading = headingRef.current;
    if (!anchor || !heading) return;

    const target = document.querySelector<HTMLElement>("[data-case-title-target]");
    const details = target?.closest<HTMLElement>(".case-details");
    if (!target || !details) return;

    const compact = window.matchMedia(COMPACT);
    const still = window.matchMedia(STILL);
    const root = document.documentElement;

    let scale = 1;
    let distance = 1;
    let enabled = false;
    let frame = 0;
    let state = "";

    const setState = (next: string) => {
      if (next === state) return;
      state = next;
      root.dataset.caseTitle = next;
    };

    const reset = () => {
      heading.style.transform = "";
      target.style.height = "";
      setState("off");
    };

    const measure = () => {
      enabled = !compact.matches && !still.matches;
      if (!enabled) {
        reset();
        return;
      }

      const headingBox = anchor.getBoundingClientRect();
      const targetBox = target.getBoundingClientRect();
      const detailsBox = details.getBoundingClientRect();

      const headingFont = parseFloat(getComputedStyle(heading).fontSize);
      const targetFont = parseFloat(getComputedStyle(target).fontSize);
      scale = headingFont > 0 ? targetFont / headingFont : 1;

      // The heading never enters the sidebar's flow, so the slot has to hold
      // open exactly the room the scaled-down title will occupy.
      target.style.height = `${headingBox.height * scale}px`;

      // Where the title parks: the sidebar's sticky offset plus the slot's
      // offset within it. Both rects are read in the same pass, so their
      // difference is independent of the current scroll position.
      const parked = (parseFloat(getComputedStyle(details).top) || 0) + (targetBox.top - detailsBox.top);
      distance = Math.max(headingBox.top + window.scrollY - parked, 1);
    };

    const update = () => {
      frame = 0;
      if (!enabled) return;

      const progress = Math.min(Math.max(window.scrollY / distance, 0), 1);

      if (progress === 0) {
        heading.style.transform = "";
        setState("idle");
        return;
      }

      const eased = progress * progress * (3 - 2 * progress);

      // Read both boxes every frame: once parked, the gap between them keeps
      // growing with scroll, and it shrinks again when the sidebar un-sticks
      // at the bottom of the layout.
      const headingBox = anchor.getBoundingClientRect();
      const targetBox = target.getBoundingClientRect();

      const x = (targetBox.left - headingBox.left) * eased;
      const y = (targetBox.top - headingBox.top) * eased;
      const step = 1 + (scale - 1) * eased;

      heading.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${step})`;
      setState(progress > 0.99 ? "parked" : "moving");
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const relayout = () => {
      measure();
      update();
    };

    relayout();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout);
    compact.addEventListener("change", relayout);
    still.addEventListener("change", relayout);

    // Fraunces landing changes the heading's height, which moves the park point.
    document.fonts?.ready.then(relayout).catch(() => {});

    // Only the heading box is observed: measure() writes to the slot's height,
    // so observing the sidebar too would feed its own output back in.
    const observer = new ResizeObserver(relayout);
    observer.observe(anchor);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", relayout);
      compact.removeEventListener("change", relayout);
      still.removeEventListener("change", relayout);
      observer.disconnect();
      reset();
      delete root.dataset.caseTitle;
    };
  }, []);

  return (
    <div className="case-title-anchor" ref={anchorRef}>
      <h1 ref={headingRef}>{title}</h1>
    </div>
  );
}
