"use client";

import { Accordion } from "radix-ui";

import { Eyebrow } from "../components/editorial";

type ToolFaq = {
  question: string;
  answer: string;
};

type ToolFaqsProps = {
  faqs: readonly ToolFaq[];
  title?: string;
};

export function ToolFaqs({ faqs, title = "Questions before you use it" }: ToolFaqsProps) {
  if (!faqs.length) {
    return null;
  }

  return (
    <section
      className="mt-[clamp(3rem,7vw,5rem)] grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-[clamp(1.5rem,5vw,4rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.5rem)] max-[900px]:grid-cols-1"
      aria-labelledby="tool-faqs"
    >
      <div>
        <Eyebrow>FAQ</Eyebrow>
        <h2
          className="display max-w-[13ch] text-[clamp(1.9rem,3.1vw,3rem)] leading-[1.05] max-[900px]:max-w-none"
          id="tool-faqs"
        >
          {title}
        </h2>
      </div>

      <Accordion.Root className="border-t border-border" type="single" collapsible>
        {faqs.map((faq, index) => (
          <Accordion.Item className="border-b border-border" value={`faq-${index}`} key={faq.question}>
            <Accordion.Header>
              <Accordion.Trigger className="group/faq flex min-h-[64px] w-full items-center justify-between gap-5 py-5 text-left text-[1.05rem] font-semibold text-foreground outline-none transition-colors hover:text-brand focus-visible:text-brand">
                <span>{faq.question}</span>
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-[1.2rem] leading-none text-brand transition-transform group-data-[state=open]/faq:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden">
              <p className="max-w-[68ch] pb-6 text-[0.98rem] leading-[1.65] text-muted-foreground">
                {faq.answer}
              </p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
