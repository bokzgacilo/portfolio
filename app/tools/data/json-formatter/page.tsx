import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { JsonFormatter } from "./formatter";

const tool = getTool("data", "json-formatter");
const adjacent = getAdjacentTools("data", "json-formatter");

export const metadata = {
  title: "JSON Formatter — Prettify, Minify, and View JSON Trees | Free Tool",
  description:
    "Paste JSON to format, minify, validate, copy, download, and inspect it in a collapsible tree viewer.",
  alternates: { canonical: "/tools/data/json-formatter" },
  openGraph: {
    type: "website",
    title: "JSON Formatter — Prettify, Minify, and View JSON Trees | Free Tool",
    description:
      "Paste JSON to format, minify, validate, copy, download, and inspect it in a collapsible tree viewer.",
    url: "https://www.bokzgacilo.com/tools/data/json-formatter",
  },
};

export default function JsonFormatterPage() {
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl("/tools/data/json-formatter")}#tool`,
            name: "JSON Formatter & Prettier",
            url: absoluteUrl("/tools/data/json-formatter"),
            description:
              "Format, minify, validate, copy, download, and inspect JSON in a collapsible tree viewer.",
            applicationCategory: "Data tool",
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            featureList: [
              "Paste and validate JSON",
              "Pretty print JSON with two-space indentation",
              "Minify JSON",
              "Inspect a collapsible JSON tree",
              "Copy or download formatted output",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            ["JSON Formatter", "/tools/data/json-formatter"],
          ]),
        ]}
      />

      <section className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[820px]">
        <Eyebrow>
          <Link className="underline decoration-border underline-offset-[0.35em]" href="/tools">
            Tools
          </Link>{" "}
          / Data
        </Eyebrow>
        <h1 className="display mb-[1.2rem] text-[clamp(2.6rem,6vw,5rem)] leading-[0.94]">
          JSON Formatter & Prettier
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          Paste raw JSON, prettify or minify it, then inspect the result as a
          collapsible tree with quick copy and download actions.
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {(tool?.tags ?? ["JSON", "Validate", "Pretty"]).map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <JsonFormatter />

      <section className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[900px]:grid-cols-1">
        {(
          [
            ["Readable errors", "Invalid JSON reports the parser message and line details when the browser provides a position."],
            ["Tree first", "Objects and arrays can be expanded or collapsed so large payloads stay inspectable."],
            ["Local only", "Parsing, formatting, and copying happen in your browser. Nothing is uploaded."],
          ] as const
        ).map(([heading, body]) => (
          <div key={heading}>
            <h2 className="mono-label mb-[0.7rem] text-brand">{heading}</h2>
            <p className="text-[0.95rem] leading-[1.6] text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <ToolFaqs faqs={tool?.faqs ?? []} />
      <ToolFeedbackForm toolTitle="JSON Formatter" toolSlug="json-formatter" toolCategory="data" />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
