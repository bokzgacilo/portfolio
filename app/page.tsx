import Link from "next/link";
import { ResourceStatistics } from "./components/statistics/client";
import { blogKey } from "./components/statistics/registry";
import { ArrowUpRight } from "lucide-react";
import { Button, ButtonArrow } from "@/components/ui/button";
import { Eyebrow, measure, Section } from "./components/editorial";
import { blogs } from "./data/blogs";
import { categoryLabel, toolHref, tools } from "./tools/data";

// Registry order is the editorial order; only working tools are featured.
const featuredTools = tools.filter((tool) => tool.status === "live").slice(0, 5);
const featuredBlogs = blogs.slice(0, 5);
const entryClass = "group/entry grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-6 transition-colors hover:bg-card/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6 sm:py-8";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.bokzgacilo.com/#person",
    name: "Ariel Jericko Gacilo",
    url: "https://www.bokzgacilo.com/",
    image: "https://www.bokzgacilo.com/assets/headshot.jpeg",
    jobTitle: "Full-Stack Developer",
    description:
      "Technical partner for teams that need apps, games, desktop tools, commerce workflows, API integrations, automation, data pipelines, and reliable launch support.",
    email: "mailto:bokzgacilo@gmail.com",
    telephone: "+639762220951",
    nationality: { "@type": "Country", name: "Philippines" },
    sameAs: [
      "https://web.facebook.com/borobokbok",
      "https://www.linkedin.com/in/ariel-jericko-gacilo/",
      "https://github.com/bokzgacilo",
    ],
    knowsAbout: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "NestJS",
      "Shopify",
      "Salesforce",
      "SQLite",
      "Supabase",
      "API development",
      "ETL",
      "Excel automation",
      "Web scraping",
      "VPS deployment",
      "Domain configuration",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.bokzgacilo.com/#website",
    name: "Ariel Jericko Gacilo Portfolio",
    url: "https://www.bokzgacilo.com/",
    description:
      "Portfolio and partnership page for Ariel Jericko Gacilo, a full-stack technical partner for apps, games, desktop tools, commerce, automation, and business systems.",
    publisher: {
      "@type": "Person",
      "@id": "https://www.bokzgacilo.com/#person",
      name: "Ariel Jericko Gacilo",
    },
  },
];

export default function Home() {
  return (
    <>
      {structuredData.map((data) => (
        <script
          key={data["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <main>
        <Section id="tools" aria-labelledby="home-tools" className="border-t-0 pt-[clamp(8rem,14vw,11rem)] pb-[clamp(3rem,6vw,5rem)]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-10">
            <div>
              <Eyebrow>Free to use · No signup</Eyebrow>
              <h1 id="home-tools" className="display text-[clamp(2.8rem,6vw,5rem)] leading-none">Top tools<span className="ml-4 align-top font-mono text-sm text-brand">05</span></h1>
            </div>
            <Button variant="editorial" size="pill" asChild>
              <Link href="/tools" className="gap-3">View all tools <ArrowUpRight aria-hidden="true" /></Link>
            </Button>
          </div>
          <ol className="border-t border-border" aria-label="Featured tools">
            {featuredTools.map((tool, index) => (
              <li key={tool.slug}>
                <Link href={toolHref(tool)} className={entryClass}>
                  <span className="self-start pt-1 font-mono text-xs text-brand sm:text-sm" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <span className="mono-label text-brand">{categoryLabel(tool.category)}</span>
                    <h2 className="display mt-1 mb-2 text-[clamp(1.5rem,3vw,2.3rem)] leading-tight transition-colors group-hover/entry:text-brand">{tool.title}</h2>
                    <p className="max-w-[65ch] text-sm text-muted-foreground sm:text-base">{tool.description}</p>
                    <ResourceStatistics resource={`tool/${tool.category}/${tool.slug}`} kind="tool" />
                  </div>
                  <ArrowUpRight className="size-5 text-brand transition-transform group-hover/entry:translate-x-1 group-hover/entry:-translate-y-1 sm:size-6" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="blogs" aria-labelledby="home-blogs" className="border-t-0 pt-4 pb-[clamp(4rem,8vw,7rem)]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-10">
            <div>
              <Eyebrow>Notes from project work</Eyebrow>
              <h2 id="home-blogs" className="display text-[clamp(2.8rem,6vw,5rem)] leading-none">Top blogs</h2>
            </div>
            <Button variant="editorial" size="pill" asChild>
              <Link href="/blogs" className="gap-3">View blogs <ArrowUpRight aria-hidden="true" /></Link>
            </Button>
          </div>
          <ol className="border-t border-border" aria-label="Featured blogs">
            {featuredBlogs.map((blog, index) => (
              <li key={blog.href}>
                <a href={blog.href} target="_blank" rel="noopener noreferrer" className={entryClass}>
                  <span className="self-start pt-1 font-mono text-xs text-brand sm:text-sm" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <span className="mono-label text-brand">{blog.source}</span>
                    <h3 className="display mt-1 mb-2 max-w-[32ch] text-[clamp(1.5rem,3vw,2.3rem)] leading-tight transition-colors group-hover/entry:text-brand">{blog.title}</h3>
                    <p className="max-w-[65ch] text-sm text-muted-foreground sm:text-base">{blog.description}</p>
                    <ResourceStatistics resource={blogKey(blog.href)} kind="blog" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </div>
                  <ArrowUpRight className="size-5 text-brand transition-transform group-hover/entry:translate-x-1 group-hover/entry:-translate-y-1 sm:size-6" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </Section>

        <section className={`${measure.text} border-t border-border py-[clamp(4rem,9vw,8rem)]`} id="contact" aria-labelledby="home-contact">
          <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
            <Eyebrow className="mb-6">Ready to scope the work?</Eyebrow>
            <h2 id="home-contact" className="display max-w-[18ch] text-[clamp(2.7rem,6.8vw,6rem)] leading-[0.98]">
              Build the next system with a steady technical partner.
            </h2>
            <p className="mt-7 max-w-[600px] text-[clamp(1rem,1.4vw,1.16rem)] text-muted-foreground">
              Send the goal, bottleneck, timeline, and budget range. I&apos;ll help turn it into a practical next step.
            </p>
            <Button className="mt-10 min-h-[72px] max-w-full gap-5 px-7 py-5 text-[clamp(1.05rem,2.2vw,1.5rem)] sm:min-h-[88px] sm:gap-8 sm:px-9 sm:py-6" variant="cta-filled" size="pill-cta" asChild>
              <Link href="/contact">Start a conversation<ButtonArrow className="size-9 shrink-0 text-xl sm:size-11" /></Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
