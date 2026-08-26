import { blogs } from "../data/blogs";
import { projects } from "../data/projects";
import { services } from "../data/services";
import { absoluteUrl, contactLinks, site } from "../data/site";
import { categories, categoryLabel, toolHref, tools } from "../tools/data";

/* The expanded companion to /llms.txt: enough detail that an agent can answer
   questions about this site without fetching every page. */

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    `# ${site.name} — full site content`,
    "",
    `> ${site.summary}`,
    "",
    `Source: ${site.url}`,
    `Role: ${site.role}`,
    `Location: ${site.location}`,
    `Availability: ${site.availability}`,
    `Engagement: ${site.engagement}`,
    "",
    "---",
    "",
    "## Services",
    "",
  ];

  for (const service of services) {
    lines.push(`### ${service.title}`, "", service.body, "", `Stack: ${service.tags.join(", ")}`, "");
  }

  lines.push("---", "", "## Case studies", "");

  for (const project of projects) {
    lines.push(
      `### ${project.title}`,
      "",
      `URL: ${absoluteUrl(`/works/${project.slug}`)}`,
      `Live site: ${project.href}`,
      `Type: ${project.type}`,
      `Duration: ${project.duration}`,
      `Stack: ${project.techStack.join(", ")}`,
      `Tags: ${project.tags.join(", ")}`,
      "",
      project.description,
      "",
      "Highlights:",
      ...project.features.map((feature) => `- ${feature}`),
      ""
    );
  }

  lines.push("---", "", "## Tools", "", `${tools.filter((t) => t.status === "live").length} live, ${tools.filter((t) => t.status !== "live").length} planned. Free, no signup.`, "");

  for (const category of categories) {
    const inCategory = tools.filter((tool) => tool.category === category.slug);
    if (inCategory.length === 0) continue;

    lines.push(`### ${category.label}`, "");
    for (const tool of inCategory) {
      lines.push(
        `- **${tool.title}** (${tool.status === "live" ? "live" : "planned"}, runs ${tool.runs}) — ${tool.description} ${absoluteUrl(toolHref(tool))}`
      );
    }
    lines.push("");
  }

  lines.push("---", "", "## Writing", "");
  for (const blog of blogs) {
    lines.push(`### ${blog.title}`, "", `Published on ${blog.source}: ${blog.href}`, "", blog.description, "");
  }

  lines.push("---", "", "## Contact", "", `Form: ${absoluteUrl("/contact")}`);
  for (const [label, value, href] of contactLinks) {
    lines.push(`${label}: ${value} (${href})`);
  }
  lines.push("", `Category labels used across the tools hub: ${categories.map((c) => categoryLabel(c.slug)).join(", ")}.`, "");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
