import Link from "next/link";

import { Eyebrow, SubPage } from "../../../components/editorial";
import { breadcrumbs, JsonLd } from "../../../components/json-ld";
import { getAdjacentTools, getTool } from "../../data";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { AudioConverter } from "./converter";

const tool = getTool("audio", "audio-converter")!;
const adjacent = getAdjacentTools("audio", "audio-converter");

export const metadata = {
  title: "Audio Converter - Convert MP3, WAV, OGG, FLAC, AAC | Free Tool",
  description: tool.description,
  alternates: { canonical: "/tools/audio/audio-converter" },
};

export default function AudioConverterPage() {
  return (
    <SubPage className="w-[calc(100vw_-_2.5rem)] max-w-[1120px] overflow-x-hidden">
      <JsonLd
        data={breadcrumbs([
          ["Home", "/"],
          ["Tools", "/tools"],
          ["Audio Converter", "/tools/audio/audio-converter"],
        ])}
      />
      <header className="mb-8">
        <Eyebrow>
          <Link
            href="/tools"
            className="underline decoration-border underline-offset-4"
          >
            Tools
          </Link>{" "}
          / Audio
        </Eyebrow>
        <h1 className="display mb-4 text-[clamp(2.6rem,6vw,5rem)] leading-none">
          Audio Converter
        </h1>
        <p className="max-w-full text-muted-foreground sm:max-w-[620px]">
          Upload one audio file, pick a target format, and download the converted copy.
        </p>
      </header>
      <AudioConverter />
      <ToolFaqs faqs={tool.faqs ?? []} />
      <ToolFeedbackForm
        toolTitle={tool.title}
        toolSlug={tool.slug}
        toolCategory={tool.category}
      />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </SubPage>
  );
}
