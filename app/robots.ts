import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = "https://www.bokzgacilo.com";

/* Assistants that browse on a person's behalf are welcomed explicitly rather
   than left to the wildcard, so a stricter default here never blocks them. */
const agents = [
  "ChatGPT-User",
  "OAI-SearchBot",
  "GPTBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "cohere-ai",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes accept POSTs and return no readable content.
        disallow: ["/api/"],
      },
      ...agents.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/"],
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
