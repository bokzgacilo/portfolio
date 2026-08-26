import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { getTool } from "../../data";
import { ImageCompressor } from "./compressor";

/* This static route shadows /tools/[category]/[slug] for this one tool, so the
   copy still comes from the shared registry and cannot drift from the hub. */
const tool = getTool("image", "image-compressor");

export const metadata = {
  title: "Image Compressor — Compress to a Target File Size | Free Tool",
  description:
    "Compress JPG, PNG, WebP, and AVIF images down to an exact target file size. Runs in your browser, no signup.",
  alternates: { canonical: "/tools/image/image-compressor" },
  openGraph: {
    type: "website",
    title: "Image Compressor — Compress to a Target File Size | Free Tool",
    description:
      "Compress JPG, PNG, WebP, and AVIF images down to an exact target file size. Runs in your browser, no signup.",
    url: "https://www.bokzgacilo.com/tools/image/image-compressor",
  },
};

export default function ImageCompressorPage() {
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl("/tools/image/image-compressor")}#tool`,
            name: "Image Compressor",
            url: absoluteUrl("/tools/image/image-compressor"),
            description:
              "Compress JPG, PNG, WebP, and AVIF images down to an exact target file size. Compression runs in the browser; nothing is uploaded unless you download the result.",
            applicationCategory: "Image tool",
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            featureList: [
              "Target an exact output file size",
              "JPG, PNG, WebP, and AVIF input up to 40 MB",
              "Client-side compression",
              "Download with a size and savings receipt",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            ["Image Compressor", "/tools/image/image-compressor"],
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
          Image Compressor
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          Name a file size and this hunts for the highest quality that fits
          under it. Compression happens in your browser — the image is only
          uploaded if you choose to download it.
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {(tool?.tags ?? ["Optimize", "JPG", "WebP"]).map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <ImageCompressor />

      <section className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[900px]:grid-cols-1">
        {(
          [
            [
              "How it lands the target",
              "It binary-searches encoder quality for the best-looking file that still fits your target. If quality alone cannot get there, it steps the resolution down and searches again.",
            ],
            [
              "What leaves your device",
              "Nothing, until you press Download. Choosing a file, changing settings, and compressing all happen locally in your browser.",
            ],
            [
              "What Download does",
              "It saves the compressed file to your device and archives a copy to private storage, then clears it from this page.",
            ],
          ] as const
        ).map(([heading, body]) => (
          <div key={heading}>
            <h2 className="mono-label mb-[0.7rem] text-brand">{heading}</h2>
            <p className="text-[0.95rem] leading-[1.6] text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
