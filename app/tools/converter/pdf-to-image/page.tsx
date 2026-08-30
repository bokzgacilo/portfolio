import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { PdfToImageConverter } from "./converter";

const tool = getTool("converter", "pdf-to-image");
const adjacent = getAdjacentTools("converter", "pdf-to-image");

export const metadata = {
  title: "PDF to Image — Export PDF Pages as PNG or JPG | Free Tool",
  description:
    "Upload a PDF, render every page as a PNG or JPG image, and download the images together as a ZIP file.",
  alternates: { canonical: "/tools/converter/pdf-to-image" },
  openGraph: {
    type: "website",
    title: "PDF to Image — Export PDF Pages as PNG or JPG | Free Tool",
    description:
      "Upload a PDF, render every page as a PNG or JPG image, and download the images together as a ZIP file.",
    url: "https://www.bokzgacilo.com/tools/converter/pdf-to-image",
  },
};

export default function PdfToImagePage() {
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl("/tools/converter/pdf-to-image")}#tool`,
            name: "PDF to Image",
            url: absoluteUrl("/tools/converter/pdf-to-image"),
            description:
              "Render each PDF page as a PNG or JPG image and download all pages in one ZIP file.",
            applicationCategory: "Converter tool",
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            featureList: [
              "Upload one PDF",
              "Choose PNG or JPG output",
              "Select render DPI",
              "Download a ZIP with one image per PDF page",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            ["PDF to Image", "/tools/converter/pdf-to-image"],
          ]),
        ]}
      />

      <section className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[820px]">
        <Eyebrow>
          <Link className="underline decoration-border underline-offset-[0.35em]" href="/tools">
            Tools
          </Link>{" "}
          / Converter
        </Eyebrow>
        <h1 className="display mb-[1.2rem] text-[clamp(2.6rem,6vw,5rem)] leading-[0.94]">
          PDF to Image
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          Upload a PDF, choose PNG or JPG, and download a ZIP containing one
          image for every page. Rendering and ZIP creation happen in your browser.
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {(tool?.tags ?? ["PDF", "PNG", "ZIP"]).map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <PdfToImageConverter />

      <section className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[900px]:grid-cols-1">
        {(
          [
            ["One PDF in", "Choose a PDF from your device or drop it directly on the upload surface."],
            ["Every page out", "Each PDF page is rendered as its own numbered PNG or JPG image file."],
            ["ZIP download", "The images are packaged together locally so you get one clean download."],
          ] as const
        ).map(([heading, body]) => (
          <div key={heading}>
            <h2 className="mono-label mb-[0.7rem] text-brand">{heading}</h2>
            <p className="text-[0.95rem] leading-[1.6] text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <ToolFaqs faqs={tool?.faqs ?? []} />
      <ToolFeedbackForm
        toolTitle="PDF to Image"
        toolSlug="pdf-to-image"
        toolCategory="converter"
      />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
