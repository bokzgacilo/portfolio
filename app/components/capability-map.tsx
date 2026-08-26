"use client";

import { motion } from "framer-motion";

const capabilities = [
  {
    title: "Product Builds",
    body: "Customer portals, admin tools, dashboards, and workflow systems.",
  },
  {
    title: "Backend & APIs",
    body: "Server logic, account flows, integrations, and data-backed features.",
  },
  {
    title: "Commerce Growth",
    body: "Shopify setup, product pages, storefront fixes, and sales flows.",
  },
  {
    title: "Data Operations",
    body: "Excel cleanup, ETL pipelines, scraping, reports, and datasets.",
  },
  {
    title: "Launch Support",
    body: "Vercel launches, VPS setup, domains, environments, and fixes.",
  },
  {
    title: "Advisory & Fixes",
    body: "Technical discovery, debugging, refactors, recovery, and improvements.",
  },
] as const;

export function CapabilityMap() {
  return (
    <motion.div
      className="reveal grid gap-[1.1rem] border-t border-l border-border"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      aria-label="Capability map"
    >
      <motion.div
        className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] border-r border-b border-border bg-primary text-primary-foreground max-[900px]:grid-cols-1"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="p-[clamp(1.2rem,3vw,2rem)]">
          <span className="mono-label text-[rgb(255_253_248/0.68)]">Technical partnership</span>
          <h3 className="display mt-4 max-w-[13ch] text-[clamp(2.2rem,4vw,4.4rem)] leading-[0.95]">
            Plan, build, improve, launch.
          </h3>
        </div>
        <p className="self-end p-[clamp(1.2rem,3vw,2rem)] text-[clamp(1rem,1.4vw,1.18rem)] leading-[1.6] text-[rgb(255_253_248/0.72)]">
          One partner for product, commerce, automation, data, and delivery work.
        </p>
      </motion.div>

      <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        {capabilities.map((capability, index) => (
          <motion.article
            className="grid min-h-[230px] content-start gap-3 border-r border-b border-border bg-[rgb(255_253_248/0.38)] p-[clamp(1.1rem,2.4vw,1.6rem)] transition-colors hover:bg-paper"
            key={capability.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.36, delay: index * 0.04, ease: "easeOut" }}
          >
            <span className="mono-label text-brand">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4 className="display text-[clamp(1.45rem,2vw,2rem)] leading-none">
              {capability.title}
            </h4>
            <p className="max-w-[34ch] text-[0.95rem] leading-[1.55] text-muted-foreground">
              {capability.body}
            </p>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
