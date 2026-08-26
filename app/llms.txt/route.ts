import { blogs } from "../data/blogs";
import { projects } from "../data/projects";
import { services } from "../data/services";
import { absoluteUrl, contactLinks, site } from "../data/site";
import { categoryLabel, toolHref, tools } from "../tools/data";

/* llms.txt — https://llmstxt.org. Generated from the same registries the pages
   render from, so it cannot drift from what a crawler actually finds. */

export const dynamic = "force-static";

function link(name: string, path: string, description: string) {
  return `- [${name}](${absoluteUrl(path)}): ${description}`;
}

export function GET() {
  const liveTools = tools.filter((tool) => tool.status === "live");
  const plannedTools = tools.filter((tool) => tool.status !== "live");

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.summary}`,
    "",
    `${site.role}. Based in ${site.location}. ${site.engagement}`,
    "",
    "## Pages",
    "",
    link("Home", "/", `Overview, services, and capability map. ${site.availability}.`),
    link("Works", "/works", "Case studies filterable by project type, tag, and technology."),
    link("Tools", "/tools", `Free browser and server utilities — ${liveTools.length} live, ${plannedTools.length} planned. No signup.`),
    link("Blogs", "/blogs", "Technical writing and implementation notes from client work."),
    link("Contact", "/contact", "Scope-review form plus direct email, phone, LinkedIn, and GitHub."),
    "",
    "## Services",
    "",
    ...services.map((service) => `- **${service.title}**: ${service.body} (${service.tags.join(", ")})`),
    "",
    "## Case studies",
    "",
    ...projects.map((project) =>
      link(project.title, `/works/${project.slug}`, `${project.type} — ${project.description} Built with ${project.techStack.join(", ")}. Live at ${project.href}`)
    ),
    "",
    "## Tools available now",
    "",
    ...liveTools.map((tool) =>
      link(tool.title, toolHref(tool), `${categoryLabel(tool.category)} — ${tool.description} Runs ${tool.runs === "browser" ? "entirely in the browser" : "on the server"}.`)
    ),
    "",
    "## Writing",
    "",
    ...blogs.map((blog) => `- [${blog.title}](${blog.href}): ${blog.description} (${blog.source})`),
    "",
    "## Contact",
    "",
    ...contactLinks.map(([label, value, href]) => `- ${label}: [${value}](${href})`),
    "",
    "## Optional",
    "",
    link("Full site content", "/llms-full.txt", "Every page, service, case study, and tool expanded into one plain-text document."),
    link("Sitemap", "/sitemap.xml", "Machine-readable list of every canonical URL."),
    ...plannedTools.map((tool) =>
      link(tool.title, toolHref(tool), `${categoryLabel(tool.category)} — planned, not built yet. ${tool.description}`)
    ),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
