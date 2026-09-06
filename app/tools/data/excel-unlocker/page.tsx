import { Eyebrow, measure } from "../../../components/editorial";
import { ToolFaqs } from "../../tool-faqs";
import { ToolFeedbackForm } from "../../tool-feedback-form";
import { ToolPagination } from "../../tool-pagination";
import { getAdjacentTools, getTool } from "../../data";
import ExcelUnlocker from "./unlocker";

const tool = getTool("data", "excel-unlocker")!;

export const metadata = {
  title: "Excel Unlocker | Free Tool",
  description: tool.description,
};

export default function ExcelUnlockerPage() {
  const adjacent = getAdjacentTools("data", "excel-unlocker");
  return (
    <main className={`${measure.text} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)]`}>
      <section className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[820px]">
        <Eyebrow>Tools / Data</Eyebrow>
        <h1 className="display mb-[1.2rem] text-[clamp(2.6rem,6vw,5rem)] leading-[0.94]">Excel Unlocker</h1>
        <p className="max-w-[620px] text-[clamp(1rem,1.25vw,1.16rem)] text-muted-foreground">{tool.description}</p>
      </section>
      <ExcelUnlocker />
      <ToolFaqs faqs={tool.faqs ?? []} />
      <ToolFeedbackForm toolTitle="Excel Unlocker" toolSlug="excel-unlocker" toolCategory="data" />
      <ToolPagination previous={adjacent.previous} next={adjacent.next} />
    </main>
  );
}
