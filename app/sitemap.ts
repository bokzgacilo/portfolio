import type { MetadataRoute } from "next";

import { projects } from "./data/projects";
import { storefronts } from "./storefronts/data";
import { toolHref, tools } from "./tools/data";

export const dynamic = "force-static";

const siteUrl = "https://www.bokzgacilo.com";

/** Single build stamp so every entry agrees on freshness. */
const lastModified = new Date();

function url(path: string) {
  return `${siteUrl}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/works"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/tools"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/storefronts"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.8 },
    { url: url("/blogs"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms-and-conditions"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const workRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: url(`/works/${project.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  /* Shipped tools outrank the placeholders: a "soon" page has nothing to rank
     for yet, but it is still a real, crawlable route. */
  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: url(toolHref(tool)),
    changeFrequency: tool.status === "live" ? "weekly" : "monthly",
    priority: tool.status === "live" ? 0.8 : 0.4,
  }));

  const storefrontRoutes: MetadataRoute.Sitemap = storefronts.map((storefront) => ({
    url: url(`/storefronts/${storefront.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...workRoutes, ...toolRoutes, ...storefrontRoutes].map((entry) => ({
    ...entry,
    lastModified,
  }));
}
