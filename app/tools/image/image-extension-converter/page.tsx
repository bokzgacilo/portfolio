import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { ImageExtensionConverter } from "./converter";

const tool = getTool("image", "image-extension-converter");
const adjacent = getAdjacentTools("image", "image-extension-converter");

export const metadata = {
  title: "Image Extension Converter — Convert PNG, JPG, and WebP Online | Free Tool",
  description:
    "Upload an image, choose PNG, JPEG, or WebP, and download the converted file. HEIC conversion uses the backend.",
  alternates: { canonical: "/tools/image/image-extension-converter" },
  openGraph: {
    type: "website",
    title: "Image Extension Converter — Convert PNG, JPG, and WebP Online | Free Tool",
    description:
      "Upload an image, choose PNG, JPEG, or WebP, and download the converted file. HEIC conversion uses the backend.",
    url: "https://www.bokzgacilo.com/tools/image/image-extension-converter",
  },
};

export default function ImageExtensionConverterPage() {
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl("/tools/image/image-extension-converter")}#tool`,
            name: "Image Extension Converter",
            url: absoluteUrl("/tools/image/image-extension-converter"),
            description:
              "Convert JPG, PNG, WebP, AVIF, HEIC, and HEIF images to PNG, JPEG, or WebP.",
            applicationCategory: "Image tool",
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            featureList: [
              "Upload one original image",
              "Choose PNG, JPEG, or WebP output",
              "Preview the selected image",
              "Download the converted file locally",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            ["Image Extension Converter", "/tools/image/image-extension-converter"],
          ]),
        ]}
      />

      <section className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[820px]">
        <Eyebrow>
          <Link className="underline decoration-border underline-offset-[0.35em]" href="/tools">
            Tools
          </Link>{" "}
          / Image
        </Eyebrow>
        <h1 className="display mb-[1.2rem] text-[clamp(2.6rem,6vw,5rem)] leading-[0.94]">
          Image Extension Converter
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          Upload the original, select the target extension, and download a new
          PNG, JPEG, or WebP file. HEIC and HEIF files use the backend; common
          web formats stay in your browser.
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {(tool?.tags ?? ["PNG", "JPEG", "WebP"]).map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <ImageExtensionConverter />

      <section className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[900px]:grid-cols-1">
        {(
          [
            ["One file in", "Choose the original image from your device or drop it directly on the upload surface."],
            ["One target out", "Pick PNG, JPEG, or WebP before converting. JPEG exports transparent areas on white."],
            ["Local by default", "Common web images convert in the browser. HEIC and HEIF are sent to the backend for decoding."],
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
        toolTitle="Image Extension Converter"
        toolSlug="image-extension-converter"
        toolCategory="image"
      />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
