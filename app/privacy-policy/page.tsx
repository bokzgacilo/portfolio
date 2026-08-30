import Link from "next/link";

import { Eyebrow, SubPage } from "../components/editorial";
import { breadcrumbs, JsonLd } from "../components/json-ld";
import { absoluteUrl, site } from "../data/site";

const effectiveDate = "August 27, 2026";

const sections = [
  {
    title: "Information this site collects",
    body: [
      "Contact and feedback forms may collect your name, email address, company or project details, website, message, feedback type, and the tool page you submitted from.",
      "Free tools may process files you choose to upload or load into the browser. Some tools run entirely on your device; the Background Remover sends the selected image to the API at api.bokzgacilo.com for processing.",
      "Basic technical data may be collected through hosting, security, analytics, and server logs, including browser type, approximate location, referring page, timestamps, IP address, and pages visited.",
    ],
  },
  {
    title: "How information is used",
    body: [
      "Messages are used to reply to inquiries, understand tool feedback, and decide what to improve or build next.",
      "Tool files are used only to produce the requested output, such as a compressed image, resized image, or transparent PNG cutout.",
      "Analytics and logs are used to understand site performance, diagnose errors, protect the service, and improve the site experience.",
    ],
  },
  {
    title: "Tool files and storage",
    body: [
      "Browser-only tools process files locally unless the interface clearly says a download will archive a copy. Background removal is server-backed because the segmentation model runs on the API.",
      "For tools that archive output after download, the archive is stored privately for retrieval and operational review. Files are not made public.",
      "Do not upload sensitive personal documents, confidential business files, government IDs, payment data, medical records, or anything you are not authorized to process.",
    ],
  },
  {
    title: "Services involved",
    body: [
      "The frontend is hosted on Vercel and may use Vercel Analytics.",
      "The Background Remover API is hosted on Render at api.bokzgacilo.com.",
      "Form submissions may be sent through Resend. Tool archive metadata or files may be stored in Supabase.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "Personal information is not sold. Information is shared only with service providers needed to run the site, respond to messages, process tools, store private archives, or comply with legal obligations.",
    ],
  },
  {
    title: "Retention and choices",
    body: [
      "Messages and operational records are kept for as long as needed to reply, maintain the site, improve tools, and keep reasonable business records.",
      "You can request deletion or correction of information you submitted by emailing bokzgacilo@gmail.com. Some records may be retained when required for security, legal, or operational reasons.",
    ],
  },
  {
    title: "Security",
    body: [
      "Reasonable technical and organizational measures are used to protect submitted information and private tool archives. No internet service can be guaranteed completely secure.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about this Privacy Policy can be sent to bokzgacilo@gmail.com.",
    ],
  },
] as const;

export const metadata = {
  title: "Privacy Policy | Ariel Jericko Gacilo",
  description:
    "Privacy Policy for bokzgacilo.com, including contact forms, free tools, uploads, analytics, and backend processing.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <SubPage>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "PrivacyPolicy",
            "@id": `${absoluteUrl("/privacy-policy")}#privacy-policy`,
            url: absoluteUrl("/privacy-policy"),
            name: "Privacy Policy",
            dateModified: "2026-08-27",
            publisher: {
              "@id": `${absoluteUrl("/")}#person`,
              "@type": "Person",
              name: site.name,
            },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Privacy Policy", "/privacy-policy"],
          ]),
        ]}
      />

      <section className="mb-[clamp(2.5rem,6vw,4.5rem)] max-w-[860px]">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="display mb-5 text-[clamp(2.8rem,7vw,6rem)] leading-[0.94] text-balance">
          Privacy Policy
        </h1>
        <p className="max-w-[66ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.7] text-muted-foreground">
          This policy explains what information is collected on bokzgacilo.com,
          how the free tools handle files, and how to contact me about your
          data.
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
        This page is general information for this website and its tools. It is
        not legal advice. For the rules that apply when using the site, read the{" "}
        <Link className="font-bold text-brand-dark underline decoration-border underline-offset-[0.35em]" href="/terms-and-conditions">
          Terms and Conditions
        </Link>
        .
      </p>
    </SubPage>
  );
}
