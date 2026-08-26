"use client";

import { motion } from "framer-motion";

const capabilities = [
  {
    title: "Product Builds",
    outcome: "Customer portals, admin tools, dashboards, and workflow systems.",
    tools: ["React", "Next.js", "TypeScript"],
    className: "capability-top",
  },
  {
    title: "Backend & APIs",
    outcome: "Server logic, account flows, integrations, and data-backed features.",
    tools: ["Node.js", "Express", "NestJS"],
    className: "capability-right-top",
  },
  {
    title: "Commerce Growth",
    outcome: "Shopify setup, product pages, storefront fixes, and sales flows.",
    tools: ["Shopify", "Liquid", "E-commerce"],
    className: "capability-right-bottom",
  },
  {
    title: "Data Operations",
    outcome: "Excel cleanup, ETL pipelines, scraping, reports, and datasets.",
    tools: ["Excel", "ETL", "Scraping"],
    className: "capability-bottom",
  },
  {
    title: "Launch Support",
    outcome: "Vercel launches, VPS setup, domains, environments, and fixes.",
    tools: ["Vercel", "VPS", "Domains"],
    className: "capability-left-bottom",
  },
  {
    title: "Advisory & Fixes",
    outcome: "Technical discovery, debugging, refactors, recovery, and improvements.",
    tools: ["Debugging", "Git", "QA"],
    className: "capability-left-top",
  },
] as const;

export function CapabilityMap() {
  return (
    <motion.div
      className="capability-map reveal"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="capability-canvas" aria-label="Capability map">
        <div className="capability-lines" aria-hidden="true" />
        <motion.div
          className="capability-core"
          initial={{ scale: 0.94, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span>Technical partnership</span>
          <strong>Plan, build, improve, launch.</strong>
          <p>One partner for product, commerce, automation, data, and delivery work.</p>
        </motion.div>

        {capabilities.map((capability, index) => {
          const isStaticBox = capability.className === "capability-left-bottom";

          return (
            <motion.button
              type="button"
              className={`capability-node ${capability.className}${isStaticBox ? " capability-static" : ""}`}
              key={capability.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={isStaticBox ? undefined : { y: -8, scale: 1.03 }}
              whileFocus={isStaticBox ? undefined : { y: -8, scale: 1.03 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
            >
              <span className="node-index">{String(index + 1).padStart(2, "0")}</span>
              <strong>{capability.title}</strong>
              <p>{capability.outcome}</p>
              <span className="node-tools">
                {capability.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
