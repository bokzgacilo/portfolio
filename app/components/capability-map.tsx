"use client";

import { motion } from "framer-motion";

/**
 * Positions are absolute percentages around the core. `[translate:...]` is used
 * instead of Tailwind's translate utilities on purpose: framer-motion owns the
 * `transform` property on these elements, so centring has to ride on the
 * separate `translate` property or the two fight each other.
 */
const capabilities = [
  {
    title: "Product Builds",
    outcome: "Customer portals, admin tools, dashboards, and workflow systems.",
    tools: ["React", "Next.js", "TypeScript"],
    position: "top-[3%] left-1/2 [translate:-50%_0]",
  },
  {
    title: "Backend & APIs",
    outcome: "Server logic, account flows, integrations, and data-backed features.",
    tools: ["Node.js", "Express", "NestJS"],
    position: "top-[15%] right-[3%]",
  },
  {
    title: "Commerce Growth",
    outcome: "Shopify setup, product pages, storefront fixes, and sales flows.",
    tools: ["Shopify", "Liquid", "E-commerce"],
    position: "right-[7%] bottom-[9%]",
  },
  {
    title: "Data Operations",
    outcome: "Excel cleanup, ETL pipelines, scraping, reports, and datasets.",
    tools: ["Excel", "ETL", "Scraping"],
    position: "bottom-[3%] left-1/2 [translate:-50%_0]",
  },
  {
    title: "Launch Support",
    outcome: "Vercel launches, VPS setup, domains, environments, and fixes.",
    tools: ["Vercel", "VPS", "Domains"],
    position: "bottom-[9%] left-[7%]",
    isStatic: true,
  },
  {
    title: "Advisory & Fixes",
    outcome: "Technical discovery, debugging, refactors, recovery, and improvements.",
    tools: ["Debugging", "Git", "QA"],
    position: "top-[15%] left-[3%]",
  },
] as const;

/** Collapses every absolutely-placed piece into a single stacked column. */
const stackOnMobile =
  "max-[900px]:relative max-[900px]:inset-auto max-[900px]:w-full max-[900px]:min-h-0 max-[900px]:aspect-auto max-[900px]:rounded-lg max-[900px]:[translate:none]";

const nodeBase =
  "group/node absolute z-3 grid w-[min(29%,280px)] min-h-[250px] content-start gap-[0.65rem] rounded-t-[999px] rounded-b-lg border border-border bg-[rgb(255_253_248/0.9)] p-[1.55rem] text-left text-foreground shadow-node";

export function CapabilityMap() {
  return (
    <motion.div
      className="reveal block"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div
        className="relative min-h-[980px] overflow-hidden border border-border bg-[rgb(255_253_248/0.42)] [background-image:linear-gradient(rgb(117_99_77/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(117_99_77/0.05)_1px,transparent_1px)] [background-size:44px_44px] max-[900px]:grid max-[900px]:min-h-0 max-[900px]:gap-4 max-[900px]:p-4"
        aria-label="Capability map"
      >
        <div
          className="capability-lines absolute inset-[10%] rounded-full border border-[rgb(117_99_77/0.28)] max-[900px]:hidden"
          aria-hidden="true"
        />

        <motion.div
          className={`absolute top-1/2 left-1/2 z-2 flex aspect-square w-[min(35%,360px)] flex-col items-center justify-center gap-[0.8rem] rounded-full border border-brand bg-primary p-8 text-center text-primary-foreground shadow-core [translate:-50%_-50%] ${stackOnMobile}`}
          initial={{ scale: 0.94, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="font-mono text-[0.68rem] tracking-[0.04em] uppercase">
            Technical partnership
          </span>
          <strong className="display max-w-[13ch] text-[clamp(2rem,3.7vw,3.4rem)] font-semibold leading-[0.98]">
            Plan, build, improve, launch.
          </strong>
          <p className="max-w-[25ch] text-[0.95rem] leading-[1.45] text-[rgb(255_253_248/0.72)]">
            One partner for product, commerce, automation, data, and delivery work.
          </p>
        </motion.div>

        {capabilities.map((capability, index) => {
          const isStatic = "isStatic" in capability && capability.isStatic;

          return (
            <motion.button
              type="button"
              className={[
                nodeBase,
                capability.position,
                stackOnMobile,
                isStatic
                  ? "cursor-default rounded-lg"
                  : "cursor-pointer hover:border-brand hover:bg-paper focus:border-brand focus:bg-paper focus:outline-none",
              ].join(" ")}
              key={capability.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={isStatic ? undefined : { y: -8, scale: 1.03 }}
              whileFocus={isStatic ? undefined : { y: -8, scale: 1.03 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
            >
              {/* Inset hairline, drawn as an element so it can inherit the
                  node's rounding without a pseudo-element rule. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[0.55rem] rounded-[inherit] border border-[rgb(117_99_77/0.3)]"
              />
              <span className="relative z-1 font-mono text-[0.68rem] tracking-[0.04em] text-brand uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong className="display relative z-1 mt-[0.35rem] text-[1.75rem] leading-none">
                {capability.title}
              </strong>
              <p className="relative z-1 text-[0.92rem] leading-[1.35] text-muted-foreground">
                {capability.outcome}
              </p>
              <span className="relative z-1 mt-1 flex flex-wrap gap-[0.35rem]">
                {capability.tools.map((tool) => (
                  <span
                    className="mono-label rounded-full border border-[rgb(216_209_197/0.88)] bg-[rgb(247_245_240/0.82)] px-[0.48rem] py-[0.24rem] text-muted-foreground"
                    key={tool}
                  >
                    {tool}
                  </span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
