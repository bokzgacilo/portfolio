import Link from "next/link";

import { Eyebrow, SubPage } from "../components/editorial";
import { breadcrumbs, JsonLd } from "../components/json-ld";
import { absoluteUrl, site } from "../data/site";

const effectiveDate = "August 27, 2026";

const sections = [
  {
    title: "Acceptance",
    body: [
      "By visiting bokzgacilo.com, using a free tool, submitting a form, or downloading an output, you agree to these Terms and Conditions.",
      "If you do not agree, do not use the site or tools.",
    ],
  },
  {
    title: "Free tools",
    body: [
      "Tools are provided for convenience and may change, pause, fail, or be removed without notice.",
      "Outputs are generated from the files and settings you provide. Review every output before using it in production, publishing it, or relying on it for business work.",
      "Some tools run in your browser. Server-backed tools, such as Background Remover, send the selected file to api.bokzgacilo.com for processing.",
    ],
  },
  {
    title: "Your responsibilities",
    body: [
      "You are responsible for the files, text, and information you submit, and you must have the rights and permission to process them.",
      "Do not upload illegal content, malware, confidential information you are not authorized to share, sensitive personal documents, payment data, medical records, or files that violate someone else's rights.",
      "Do not abuse, scrape, overload, reverse engineer, or attempt to bypass security limits on the site or API.",
    ],
  },
  {
    title: "Downloads and archives",
    body: [
      "When you download an output, the file is saved by your browser to your device according to your browser settings.",
      "Some tools may archive a private copy or metadata after download for retrieval, debugging, operational review, or improvement. Tool pages identify when this happens.",
      "Browser-only tools that say nothing is uploaded are processed locally on your device unless you separately submit feedback or contact information.",
    ],
  },
  {
    title: "No warranties",
    body: [
      "The site and tools are provided as is and as available. No guarantee is made that they will be uninterrupted, error-free, secure, or fit for a particular purpose.",
      "Image, file, or data outputs may contain defects. You use the site and outputs at your own risk.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "To the fullest extent allowed by law, Ariel Jericko Gacilo is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, business, or goodwill arising from use of the site or tools.",
    ],
  },
  {
    title: "Portfolio and services",
    body: [
      "Portfolio content is for general information and does not create a client relationship.",
      "Paid work, if any, is governed by the separate written agreement, proposal, statement of work, invoice, or messages accepted for that project.",
    ],
  },
  {
    title: "Changes",
    body: [
      "These terms may be updated from time to time. The effective date shows when this page was last materially changed.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these Terms and Conditions can be sent to bokzgacilo@gmail.com.",
    ],
  },
] as const;

export const metadata = {
  title: "Terms and Conditions | Ariel Jericko Gacilo",
  description:
    "Terms and Conditions for bokzgacilo.com, including free tools, downloads, uploads, feedback, and portfolio services.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <SubPage>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${absoluteUrl("/terms-and-conditions")}#terms`,
            url: absoluteUrl("/terms-and-conditions"),
            name: "Terms and Conditions",
            dateModified: "2026-08-27",
            publisher: {
              "@id": `${absoluteUrl("/")}#person`,
              "@type": "Person",
              name: site.name,
            },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Terms and Conditions", "/terms-and-conditions"],
          ]),
        ]}
      />

      <section className="mb-[clamp(2.5rem,6vw,4.5rem)] max-w-[880px]">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="display mb-5 text-[clamp(2.8rem,7vw,6rem)] leading-[0.94] text-balance">
          Terms and Conditions
        </h1>
        <p className="max-w-[66ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.7] text-muted-foreground">
          These terms cover use of this portfolio, the free browser and
          server-backed tools, downloads, uploads, feedback forms, and service
          inquiries.
        </p>
        <p className="mono-label mt-5 text-brand">Effective {effectiveDate}</p>
      </section>

      <section className="grid border-t border-l border-border">
        {sections.map((section, index) => (
          <article
            className="grid grid-cols-[minmax(220px,0.42fr)_minmax(0,1fr)] gap-[clamp(1.2rem,4vw,3rem)] border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1.15rem,3vw,1.8rem)] max-[760px]:grid-cols-1"
            key={section.title}
          >
            <div>
              <span className="mono-label text-brand">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="display mt-3 text-[clamp(1.45rem,2.4vw,2.2rem)] leading-[1.05]">
                {section.title}
              </h2>
            </div>
            <div className="grid gap-4 text-[0.98rem] leading-[1.7] text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <p className="mt-8 max-w-[72ch] text-[0.9rem] leading-[1.65] text-muted-foreground">
        These terms are general website terms, not legal advice. For how
        information is handled, read the{" "}
        <Link className="font-bold text-brand-dark underline decoration-border underline-offset-[0.35em]" href="/privacy-policy">
          Privacy Policy
        </Link>
        .
      </p>
    </SubPage>
  );
}
