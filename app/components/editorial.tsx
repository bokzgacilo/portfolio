import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Shared editorial primitives. These exist so the long utility strings for
 * this site's recurring shapes -- page gutters, section rhythm, the mono
 * micro-type -- live in one place instead of being retyped per page.
 *
 * Breakpoints use `max-[900px]:` / `max-[560px]:` to mirror the desktop-first
 * media queries the original stylesheet was written against.
 */

/** Page gutter widths. Each page picks the measure its layout was designed for. */
export const measure = {
  text: "mx-auto w-[var(--measure-text)]",
  wide: "mx-auto w-[var(--measure-wide)]",
  gallery: "mx-auto w-[var(--measure-gallery)]",
  map: "mx-auto w-[var(--measure-map)]",
} as const;

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mono-label mb-4 text-brand", className)} {...props} />;
}

export function Kicker({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("mono-label text-muted-foreground", className)} {...props} />;
}

export function Section({
  className,
  compact,
  width = "text",
  ...props
}: ComponentProps<"section"> & {
  compact?: boolean;
  width?: keyof typeof measure;
}) {
  return (
    <section
      className={cn(
        measure[width],
        "border-t border-border py-[clamp(4.5rem,9vw,8rem)]",
        compact && "pt-[clamp(3.5rem,7vw,6rem)]",
        className
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="reveal mb-[clamp(2rem,5vw,4rem)]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="display text-[4rem] leading-none whitespace-nowrap max-[900px]:text-[3rem] max-[560px]:max-w-none max-[560px]:text-[1.9rem]">
        {title} <em className="text-brand italic">{accent}</em>
      </h2>
    </div>
  );
}

export function TagRow({
  tags,
  className,
}: {
  tags: readonly string[];
  className?: string;
}) {
  return (
    <span className={cn("flex flex-wrap gap-[0.7rem]", className)}>
      {tags.map((tag) => (
        <Badge variant="chip" key={tag}>
          {tag}
        </Badge>
      ))}
    </span>
  );
}

/** The dotted-underline text link used to leave a card. */
export function TextLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "mt-[1.35rem] inline-flex w-fit font-extrabold text-brand-dark underline",
        "decoration-border underline-offset-[0.35em]",
        className
      )}
      {...props}
    />
  );
}

/** A page-level heading slot: eyebrow, oversized title, lede. */
export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="mb-[clamp(2.5rem,6vw,5rem)] max-w-[820px]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="display mb-[1.2rem] max-w-[920px] text-[clamp(3rem,8vw,7rem)] leading-[0.92]">
        {title}
      </h1>
      {children ? (
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          {children}
        </p>
      ) : null}
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer
      className={cn(
        measure.text,
        "print-hidden flex justify-between gap-4 border-t border-border py-8",
        "text-[0.9rem] text-muted-foreground"
      )}
    >
      <span>Ariel Jericko Gacilo · {new Date().getFullYear()}</span>
      <a className="font-bold" href="mailto:bokzgacilo@gmail.com">
        bokzgacilo@gmail.com
      </a>
    </footer>
  );
}

/** Standard sub-page shell: text measure plus the header-clearing top pad. */
export function SubPage({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      className={cn(
        measure.text,
        "pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]",
        className
      )}
      {...props}
    />
  );
}

/** Hairline-divided card grid used by the tools and blogs listings. */
export function ListingGrid({
  className,
  single,
  ...props
}: ComponentProps<"section"> & { single?: boolean }) {
  return (
    <section
      className={cn(
        "grid border-t border-l border-border max-[900px]:grid-cols-1",
        single ? "grid-cols-[minmax(0,0.68fr)]" : "grid-cols-3",
        className
      )}
      {...props}
    />
  );
}

export function ListingItem({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "min-h-[320px] border-r border-b border-border bg-[rgb(255_253_248/0.34)]",
        "p-[clamp(1.2rem,3vw,1.8rem)]",
        className
      )}
      {...props}
    />
  );
}

export function ListingTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "display mb-4 text-[clamp(1.7rem,3vw,2.8rem)] leading-none tracking-[-0.02em]",
        className
      )}
      {...props}
    />
  );
}

/* --------------------------------------------------------------------------
   Case-study shell. Shared between the route and WorkDetailView so the two
   cannot drift apart.
-------------------------------------------------------------------------- */

export const caseStudy = {
  page: cn(
    measure.wide,
    "pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]",
    "print:w-full print:p-0"
  ),
  hero: "relative z-2 mb-[clamp(2.5rem,6vw,5rem)] max-w-[920px]",
  /* max-w-[12ch] keeps the line breaks identical at both ends of the title's
     travel, so the text never reflows mid-flight. */
  title:
    "display max-w-[12ch] text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.92] origin-top-left will-change-transform",
  lede: "max-w-[720px] text-[1.08rem] text-muted-foreground",
  layout:
    "grid grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] items-start gap-[clamp(1rem,4vw,3rem)] border-t border-border max-[900px]:grid-cols-1 print:grid-cols-1",
  gallery: "grid gap-4 pt-4",
  galleryImage:
    "w-full aspect-[16/10] object-contain object-left-top border border-border bg-card",
  details: "sticky top-[5.5rem] pt-4 max-[900px]:static print:static",
  stickyTitle:
    "grid gap-[0.55rem] mb-[1.4rem] border-b border-border pb-[1.2rem] max-[900px]:hidden",
  stickyTarget: "display text-[clamp(2.15rem,3.4vw,4.1rem)] leading-[0.92]",
} as const;

export function CaseMeta({ duration, stack }: { duration: string; stack: string }) {
  return (
    <dl className="my-8 grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
      {[
        ["Duration", duration],
        ["Tech stack", stack],
      ].map(([label, value]) => (
        <div className="border-t border-border pt-[0.85rem]" key={label}>
          <dt className="mono-label text-brand">{label}</dt>
          <dd className="mt-[0.35rem] font-[750] text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DrawerSection({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="mb-6">
      <h2 className="mono-label mb-3 font-medium text-brand">{title}</h2>
      <ul className="mt-3 grid list-none gap-[0.6rem]">
        {items.map((item) => (
          <li className="border-b border-border pb-[0.6rem] text-muted-foreground" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
