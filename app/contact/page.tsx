import { Eyebrow, measure } from "../components/editorial";
import { breadcrumbs, JsonLd } from "../components/json-ld";
import { absoluteUrl, contactLinks, site } from "../data/site";
import { ContactForm } from "./contact-form";


export const metadata = {
  title: "Contact | Ariel Jericko Gacilo",
  description: "Start a conversation with Ariel Jericko Gacilo about web products, Shopify, integrations, automation, and launch support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main
      className={`${measure.wide} pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,7rem)] max-[560px]:w-[calc(100%_-_2.5rem)]`}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": `${absoluteUrl("/contact")}#contact`,
            url: absoluteUrl("/contact"),
            name: "Contact Ariel Jericko Gacilo",
            description: site.engagement,
            mainEntity: {
              "@id": `${absoluteUrl("/")}#person`,
              "@type": "Person",
              name: site.name,
              email: "mailto:bokzgacilo@gmail.com",
              telephone: "+639762220951",
              areaServed: "Worldwide",
              availableLanguage: ["English", "Filipino"],
            },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Contact", "/contact"],
          ]),
        ]}
      />

      <section className="grid grid-cols-2 items-start gap-[clamp(2.5rem,5vw,4.5rem)] max-[900px]:grid-cols-1">
        <div className="reveal sticky top-24 max-[900px]:static">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="display mb-5 text-[clamp(2.6rem,4.6vw,4.75rem)] leading-none text-balance max-[900px]:text-[clamp(2.5rem,7vw,4.5rem)]">
            Let&apos;s start a conversation.
          </h1>
          <p className="max-w-[46ch] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.65] text-muted-foreground">
            Tell me what you&apos;re working on, what needs to improve, and what
            timeline you have in mind. I&apos;ll reply with a practical next step.
          </p>
          <div
            className="relative mt-[clamp(2rem,5vw,3.5rem)] max-w-[390px] overflow-hidden rounded-lg bg-secondary shadow-editorial"
            aria-label="Ariel Jericko Gacilo portrait"
          >
            <img
              className="block aspect-[4/5] w-full object-cover object-top [filter:saturate(0.92)_contrast(1.02)]"
              src="/assets/headshot.jpeg"
              alt="Headshot of Ariel Jericko Gacilo"
            />
            <span className="mono-label absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[rgb(21_20_18/0.72)] p-4 font-extrabold text-paper">
              Manila · Remote-friendly
            </span>
          </div>
        </div>

        <ContactForm />
      </section>

      <section
        className="reveal mt-[clamp(4rem,9vw,8rem)] grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(2rem,5vw,4.5rem)] border-t border-border pt-[clamp(1.5rem,4vw,2.6rem)] max-[900px]:grid-cols-1"
        aria-label="Direct contact details"
      >
        <div>
          <Eyebrow>Get in touch</Eyebrow>
          <h2 className="display max-w-[18ch] text-[clamp(1.9rem,3vw,3rem)] leading-[1.05] max-[560px]:max-w-none max-[560px]:text-[1.9rem]">
            Prefer direct contact?
          </h2>
        </div>
        <div className="grid content-start gap-x-8 gap-y-[1.35rem] grid-cols-2 max-[560px]:grid-cols-1">
          {contactLinks.map(([label, value, href]) => (
            <a
              className="grid gap-[0.4rem] border-b border-border pb-[0.8rem] text-base leading-[1.4] font-medium text-foreground no-underline transition-colors [overflow-wrap:anywhere] hover:border-foreground hover:text-brand"
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              <span className="mono-label text-muted-foreground">{label}</span>
              {value}
            </a>
          ))}
        </div>
      </section>

      <section className="reveal mt-[clamp(3.5rem,7vw,6rem)] flex items-end justify-between gap-8 border-t border-border pt-[clamp(1.5rem,4vw,2.4rem)] max-[560px]:flex-col max-[560px]:items-start">
        <p className="display max-w-[40ch] text-[clamp(1.5rem,2.5vw,2.5rem)] leading-[1.2] text-balance max-[560px]:max-w-none max-[560px]:text-[clamp(1.4rem,6vw,1.9rem)]">
          Web products, commerce systems, and operational workflows move better
          with a steady technical partner.
        </p>
        <span className="mono-label flex-none pb-[0.35rem] text-muted-foreground">
          Available for product and ops builds
        </span>
      </section>
    </main>
  );
}
