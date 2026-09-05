import Link from "next/link";
import { Eyebrow, SubPage } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { AudioClipper } from "./clipper";

const tool = getTool("audio", "audio-clipper")!;
const adjacent = getAdjacentTools("audio", "audio-clipper");
export const metadata = {
  title: "Audio Clipper — Trim Audio Online | Free Tool",
  description: tool.description,
  alternates: { canonical: "/tools/audio/audio-clipper" },
};

export default function AudioClipperPage() {
  return (
    <SubPage>
      <JsonLd data={breadcrumbs([["Home", "/"], ["Tools", "/tools"], ["Audio Clipper", "/tools/audio/audio-clipper"]])} />
      <header className="mb-8">
        <Eyebrow><Link href="/tools" className="underline decoration-border underline-offset-4">Tools</Link> / Audio</Eyebrow>
        <h1 className="display mb-4 text-[clamp(2.6rem,6vw,5rem)] leading-none">Audio Clipper</h1>
        <p className="max-w-[620px] text-muted-foreground">Import a track, find the part you want, and save your clip.</p>
      </header>
      <AudioClipper />
      <ToolFaqs faqs={tool.faqs ?? []} />
      <ToolFeedbackForm toolTitle={tool.title} toolSlug={tool.slug} toolCategory={tool.category} />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </SubPage>
  );
}
