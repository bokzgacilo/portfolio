import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Eyebrow, measure } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { absoluteUrl } from "../../../data/site";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { BackgroundRemover } from "./remover";

/* This static route shadows /tools/[category]/[slug] for this one tool, so the
   copy still comes from the shared registry and cannot drift from the hub. */
const tool = getTool("image", "background-remover");
const adjacent = getAdjacentTools("image", "background-remover");

const TITLE = "Background Remover — Transparent PNG Cutouts | Free Tool";
const DESCRIPTION =
  "Remove the background from a photo and download a transparent PNG. No signup, no watermark, nothing stored.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools/image/background-remover" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/tools/image/background-remover"),
  },
};

export default function BackgroundRemoverPage() {
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${absoluteUrl("/tools/image/background-remover")}#tool`,
            name: "Background Remover",
            url: absoluteUrl("/tools/image/background-remover"),
            description:
              "Remove the background from a JPG, PNG, or WebP photo and download a transparent PNG cutout. Masking runs on a FastAPI service that holds the upload in memory only; downloading archives the cutout to private storage.",
            applicationCategory: "Image tool",
            browserRequirements: "Requires a modern web browser. No signup.",
            operatingSystem: "Any",
            featureList: [
              "Transparent PNG output",
              "JPG, PNG, and WebP input up to 10 MB",
              "Preview the cutout on checker, light, or dark",
              "Download with a size and timing receipt",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
            author: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Tools", "/tools"],
            ["Background Remover", "/tools/image/background-remover"],
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
          Background Remover
        </h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">
          Drop in a photo and get the subject back on transparency. The cutout
          is produced by a segmentation model on my own API, which holds your
          upload in memory and never writes it to disk.
        </p>
        <div className="mt-5 flex flex-wrap gap-[0.7rem]">
          {(tool?.tags ?? ["PNG", "Cutout", "AI"]).map((tag) => (
            <Badge variant="chip" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <BackgroundRemover />

      <section className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[900px]:grid-cols-1">
        {(
          [
            [
              "How the cutout is made",
              "A U^2-Net segmentation model predicts a per-pixel mask of the subject, and that mask becomes the alpha channel of a PNG. It is strongest on a clear single subject and weakest on fine hair, glass, and motion blur.",
            ],
            [
              "Where your file goes",
              "The photo goes to the API once — this is the one tool here that cannot run in your browser. It is held in memory for the length of the request and no copy of your original is kept. Download then saves the PNG to your device, archives that cutout to private storage, and clears it from this page.",
            ],
            [
              "Why the first try can be slow",
              "The API runs on a free instance that sleeps when idle. The page pings it as soon as it loads, so the wake-up usually finishes while you are still choosing a file; if it does not, the first request can take up to a minute.",
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
        toolTitle="Background Remover"
        toolSlug="background-remover"
        toolCategory="image"
      />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
