import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { categoryLabel, getAdjacentTools, getTool, toolHref, tools } from "../../data";
import { ToolPagination } from "../../tool-pagination";

/** Tools with a hand-built route of their own are excluded: a static segment
 *  wins over this dynamic one, so prerendering both would be wasted work. */
const OWN_ROUTE = new Set([
  "audio/audio-clipper",
  "data/json-formatter",
  "image/background-remover",
  "image/image-compressor",
  "image/image-extension-converter",
  "image/image-resizer",
  "converter/pdf-to-image",
]);

export function generateStaticParams() {
  return tools
    .filter((tool) => !OWN_ROUTE.has(`${tool.category}/${tool.slug}`))
    .map((tool) => ({ category: tool.category, slug: tool.slug }));
}

type ToolPageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: ToolPageProps) {
  const { category, slug } = await params;
  const tool = getTool(category, slug);

  if (!tool) {
    return {};
  }

  return {
    title: `${tool.title} | Free Tool`,
    description: tool.description,
    alternates: { canonical: toolHref(tool) },
    openGraph: {
      type: "website",
      title: `${tool.title} | Free Tool`,
      description: tool.description,
      url: absoluteUrl(toolHref(tool)),
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { category, slug } = await params;
  const tool = getTool(category, slug);

  if (!tool) {
    notFound();
  }

  const related = tools
    .filter((item) => item.category === tool.category && item.slug !== tool.slug)
    .slice(0, 3);
  const adjacent = getAdjacentTools(tool.category, tool.slug);

  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl(toolHref(tool))}#tool`,
            name: tool.title,
            url: absoluteUrl(toolHref(tool)),
            description: tool.description,
            applicationCategory: `${categoryLabel(tool.category)} tool`,
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            keywords: [...tool.tags].join(", "),
            /* "soon" tools are real routes with nothing to run yet -- saying so
               beats letting a crawler infer a broken tool. */
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability:
              tool.status === "live"
                ? "https://schema.org/InStock"
                : "https://schema.org/PreOrder",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            [tool.title, toolHref(tool)],
          ]),
        ]}
      />

      <section className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[820px]">
        <Eyebrow>
          <Link className="underline decoration-border underline-offset-[0.35em]" href="/tools">
            Tools
          </Link>{" "}
          / {categoryLabel(tool.category)}
        </Eyebrow>
        <h1 className="display mb-[1.2rem] text-[clamp(2.6rem,6vw,5rem)] leading-[0.94]">
          {tool.title}
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          {tool.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {tool.tags.map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      {/* Placeholder for the real tool surface. Swap this block for the working
          UI when the tool ships -- nothing else on the page needs to change. */}
      <section
        className="grid min-h-[340px] place-items-center border border-dashed border-border bg-[rgb(255_253_248/0.42)] p-[clamp(1.5rem,4vw,3rem)] text-center"
        aria-label={`${tool.title} status`}
      >
        <div className="grid max-w-[46ch] justify-items-center gap-4">
          <span className="mono-label rounded-full border border-border px-[0.62rem] py-[0.32rem] text-muted-foreground">
            Not built yet
          </span>
          <h2 className="display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.05]">
            This one is still on the bench.
          </h2>
          <p className="text-muted-foreground">
            {tool.runs === "browser"
              ? "It will run entirely in your browser — your file never leaves your device."
              : "It will run on the server, so the file is uploaded, processed, and deleted within 24 hours."}
          </p>
          <Button variant="editorial" size="pill" asChild className="mt-2">
            <Link href="/contact">Ask me to build this next</Link>
          </Button>
        </div>
      </section>

      <ToolPagination previous={adjacent.previous} next={adjacent.next} />

      <section className="mt-[clamp(3rem,7vw,5rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)]">
        <Eyebrow>More in {categoryLabel(tool.category)}</Eyebrow>
        {related.length > 0 ? (
          <div className="grid grid-cols-3 border-t border-l border-border max-[900px]:grid-cols-1">
            {related.map((item) => (
              <Link
                className="group/related flex min-h-[160px] flex-col border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,2.5vw,1.5rem)] no-underline transition-colors hover:bg-[rgb(255_253_248/0.72)]"
                key={item.slug}
                href={toolHref(item)}
              >
                <span className="display text-[1.5rem] leading-none">{item.title}</span>
                <span className="mt-3 text-[0.95rem] text-muted-foreground">
                  {item.description}
                </span>
                <span className="mono-label mt-auto pt-4 text-brand">
                  Details{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover/related:translate-x-[3px]"
                  >
                    -&gt;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nothing else here yet.</p>
        )}
      </section>
    </main>
  );
}
