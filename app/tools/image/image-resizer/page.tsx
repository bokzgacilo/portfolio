import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { ImageResizer } from "./resizer";

const tool = getTool("image", "image-resizer");
const adjacent = getAdjacentTools("image", "image-resizer");

export const metadata = {
  title: "Image Resizer — Resize and Crop Images Online | Free Tool",
  description:
    "Resize JPG, PNG, WebP, and AVIF images on a white canvas. Set exact dimensions, zoom and position the image, then download locally.",
  alternates: { canonical: "/tools/image/image-resizer" },
  openGraph: {
    type: "website",
    title: "Image Resizer — Resize and Crop Images Online | Free Tool",
    description:
      "Resize JPG, PNG, WebP, and AVIF images on a white canvas. Set exact dimensions, zoom and position the image, then download locally.",
    url: "https://www.bokzgacilo.com/tools/image/image-resizer",
  },
};

export default function ImageResizerPage() {
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl("/tools/image/image-resizer")}#tool`,
            name: "Image Resizer",
            url: absoluteUrl("/tools/image/image-resizer"),
            description:
              "Resize JPG, PNG, WebP, and AVIF images on a white canvas. The resize runs locally in the browser; nothing is uploaded.",
            applicationCategory: "Image tool",
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            featureList: [
              "Resize to exact width and height",
              "Common aspect-ratio templates",
              "Drag and zoom the image layer inside the canvas",
              "Common social, avatar, and HD presets",
              "PNG, JPEG, and WebP output",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            ["Image Resizer", "/tools/image/image-resizer"],
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
          Image Resizer
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          Set the exact white canvas you need, then drag and zoom the image
          layer inside it. Empty canvas space stays white in the downloaded
          file.
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {(tool?.tags ?? ["Resize", "Crop", "Batch"]).map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <ImageResizer />

      <section className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[900px]:grid-cols-1">
        {(
          [
            [
              "Canvas first",
              "Templates and custom width and height change the output canvas, while the image remains a movable layer inside it.",
            ],
            [
              "Exact dimensions",
              "The downloaded file is encoded at the width and height you set, up to 8000 pixels on either side.",
            ],
            [
              "White background",
              "When the image does not cover the whole frame, the exposed canvas exports as clean white space.",
            ],
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
        toolTitle="Image Resizer"
        toolSlug="image-resizer"
        toolCategory="image"
      />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
