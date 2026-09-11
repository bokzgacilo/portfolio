import { Eyebrow, measure } from "../../../components/editorial";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { getAdjacentTools, getTool } from "../../data";
import YoutubeDownloader from "./downloader";

const tool = getTool("video", "youtube-downloader")!;

export const metadata = {
  title: "YouTube Downloader | Free Tool",
  description: tool.description,
};

export default function YoutubeDownloaderPage() {
  const adjacent = getAdjacentTools("video", "youtube-downloader");
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <section className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[820px]">
        <Eyebrow>Tools / Video</Eyebrow>
        <h1 className="display mb-[1.2rem] text-[clamp(2.6rem,6vw,5rem)] leading-[0.94]">YouTube Downloader</h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">{tool.description}</p>
      </section>
      <YoutubeDownloader />
      <ToolFaqs faqs={tool.faqs ?? []} />
      <ToolFeedbackForm toolTitle="YouTube Downloader" toolSlug="youtube-downloader" toolCategory="video" />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
