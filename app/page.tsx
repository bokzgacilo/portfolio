import { Badge } from "@/components/ui/badge";
import { Button, ButtonArrow } from "@/components/ui/button";

import { CapabilityMap } from "./components/capability-map";
import { HeroCarousel } from "./components/hero-carousel";
import {
  Eyebrow,
  measure,
  Section,
  SectionHeader,
  SiteFooter,
} from "./components/editorial";

/**
 * Each highlight doubles as a jump link, so the row is three more ways into
 * the page rather than three dead numbers.
 */
const proofPoints = [
  { value: "3", label: "case studies to read", href: "/works" },
  { value: "6", label: "ways I can help", href: "#services" },
  { value: "1:1", label: "scope review", href: "#contact" },
] as const;

const services = [
  {
    title: "Web Apps & Custom Systems",
    body: "Internal tools and customer-facing systems shaped around real workflows.",
    image: "/assets/services/web-apps.png",
    tags: ["React", "Next.js", "Node.js"],
  },
  {
    title: "Websites & Landing Pages",
    body: "Conversion-focused pages with clear positioning and deployment-ready foundations.",
    image: "/assets/services/websites.png",
    tags: ["HTML/CSS", "UI/UX", "Deploy"],
  },
  {
    title: "Shopify & E-commerce",
    body: "Storefront improvements, custom sections, product flows, and commerce support.",
    image: "/assets/services/ecommerce.png",
    tags: ["Shopify", "Liquid", "E-commerce"],
  },
  {
    title: "Thesis & Capstone Systems",
    body: "Structured prototypes and research systems with practical delivery support.",
    image: "/assets/services/thesis.png",
    tags: ["Systems", "Database", "Reports"],
  },
  {
    title: "Fixes, APIs & Integrations",
    body: "Stabilize existing systems and connect the services your business relies on.",
    image: "/assets/services/integrations.png",
    tags: ["APIs", "Debugging", "Maintenance"],
  },
  {
    title: "Excel, ETL & Web Scraping",
    body: "Turn manual data work into repeatable reporting and automation workflows.",
    image: "/assets/services/data-work.png",
    tags: ["Excel", "ETL", "Scraping"],
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.bokzgacilo.com/#person",
    name: "Ariel Jericko Gacilo",
    url: "https://www.bokzgacilo.com/",
    image: "https://www.bokzgacilo.com/assets/headshot.jpeg",
    jobTitle: "Full-Stack Developer",
    description:
      "Technical partner for teams that need apps, games, desktop tools, commerce workflows, API integrations, automation, data pipelines, and reliable launch support.",
    email: "mailto:bokzgacilo@gmail.com",
    telephone: "+639762220951",
    nationality: { "@type": "Country", name: "Philippines" },
    sameAs: [
      "https://web.facebook.com/borobokbok",
      "https://www.linkedin.com/in/ariel-jericko-gacilo/",
      "https://github.com/bokzgacilo",
    ],
    knowsAbout: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "NestJS",
      "Shopify",
      "Salesforce",
      "SQLite",
      "Supabase",
      "API development",
      "ETL",
      "Excel automation",
      "Web scraping",
      "VPS deployment",
      "Domain configuration",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.bokzgacilo.com/#website",
    name: "Ariel Jericko Gacilo Portfolio",
    url: "https://www.bokzgacilo.com/",
    description:
      "Portfolio and partnership page for Ariel Jericko Gacilo, a full-stack technical partner for apps, games, desktop tools, commerce, automation, and business systems.",
    publisher: {
      "@type": "Person",
      "@id": "https://www.bokzgacilo.com/#person",
      name: "Ariel Jericko Gacilo",
    },
  },
];

export default function Home() {
  return (
    <>
      {structuredData.map((data) => (
        <script
          key={data["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <main>
        <section
          className="mx-auto grid min-h-[92svh] w-[min(92%,1500px)] grid-cols-[minmax(420px,1.22fr)_minmax(0,0.78fr)] items-center gap-[clamp(1.4rem,3.5vw,3.5rem)] pt-[clamp(7rem,12vw,10rem)] pb-[clamp(2rem,6vw,5rem)] max-[900px]:w-[min(88%,760px)] max-[900px]:grid-cols-1 max-[900px]:pt-36 max-[560px]:min-h-0 max-[560px]:w-[calc(100%_-_2.5rem)] max-[560px]:pt-28"
          id="hero"
        >
          <HeroCarousel />

          <div className="max-w-[640px] [animation:rise_0.7s_ease_both] max-[900px]:order-first">
            {/* Availability leads: it is the part of the header that invites a
                reply, so it outranks the discipline label beside it. */}

            {/* max-w in ch so the three-line break holds at every step of the
                clamp instead of only at the desktop size. */}
            <h1 className="display mb-[1.25rem] max-w-[17ch] text-[clamp(2.7rem,4.05vw,4.5rem)] leading-[1] max-[900px]:text-[2.35rem] max-[900px]:leading-[1.03]">
              Digital products that keep your ideas{" "}
              <em className="text-brand italic">moving</em>.
            </h1>
            <p className="max-w-[52ch] text-[clamp(1rem,1.35vw,1.2rem)] leading-[1.6] text-muted-foreground max-[900px]:max-w-[48ch] max-[560px]:max-w-[34ch]">
              I build and repair web apps, games, Android apps, Windows desktop
              tools, storefronts, integrations, and automations — then hand them
              over documented, so they keep running without me.
            </p>
            <nav
              className="mt-[1.7rem] grid grid-cols-3 gap-[0.9rem] border-t border-border pt-[1.15rem] max-[560px]:gap-[0.6rem]"
              aria-label="Portfolio highlights"
            >
              {proofPoints.map(({ value, label, href }) => (
                <a
                  className="group/proof grid gap-[0.2rem] no-underline"
                  key={label}
                  href={href}
                >
                  <strong className="display text-[clamp(1.8rem,3vw,2.65rem)] leading-none font-[650] text-foreground transition-colors group-hover/proof:text-brand">
                    {value}
                  </strong>
                  <span className="text-[0.88rem] leading-[1.3] font-semibold text-muted-foreground transition-colors group-hover/proof:text-foreground max-[560px]:text-[0.78rem]">
                    {label}
                  </span>
                </a>
              ))}
            </nav>
            <div className="mt-[1.85rem] flex flex-wrap items-center gap-[0.7rem] max-[560px]:flex-col max-[560px]:items-stretch">
              <Button variant="cta-filled" size="pill-cta" asChild>
                <a className="max-[560px]:w-full" href="/contact">
                  Start a conversation
                  <ButtonArrow />
                </a>
              </Button>
              <Button variant="editorial" size="pill" asChild>
                <a className="max-[560px]:w-full" href="/works">
                  Browse all works
                </a>
              </Button>
            </div>
            <p className="mt-[1.15rem] max-w-[46ch] text-[0.92rem] leading-[1.5] text-muted-foreground">
              Tell me what&apos;s slowing you down and I&apos;ll reply with a
              practical next step — no pitch deck, no obligation.
            </p>
          </div>
        </section>

        <Section id="services">
          <SectionHeader eyebrow="Services" title="Focused" accent="support" />
          <div className="grid grid-cols-3 border-t border-l border-border max-[900px]:grid-cols-1">
            {services.map((service, index) => (
              <article
                className="reveal min-h-[430px] border-r border-b border-border bg-[rgb(255_253_248/0.34)] p-[clamp(1rem,3vw,1.6rem)] transition-colors hover:bg-[rgb(255_253_248/0.72)]"
                key={service.title}
              >
                <img
                  className="mx-auto mb-[1.45rem] block aspect-square w-[min(100%,260px)] object-contain drop-shadow-[0_18px_28px_rgb(21_20_18/0.08)]"
                  src={service.image}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                />
                <span className="mono-label text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 mb-[0.7rem] text-base font-bold">
                  {service.title}
                </h3>
                <p className="mb-4 text-muted-foreground">{service.body}</p>
                <div className="flex flex-wrap gap-[0.7rem]">
                  {service.tags.map((tag) => (
                    <Badge variant="chip" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section compact width="map" id="skills">
          <SectionHeader
            eyebrow="Capabilities"
            title="Business"
            accent="support"
          />
          <CapabilityMap />
        </Section>

        <section
          className={`${measure.text} border-t border-border py-[clamp(4rem,8vw,7rem)]`}
          id="contact"
        >
          <div className="reveal mx-auto flex max-w-[900px] flex-col items-center text-center">
            <div className="flex flex-col items-center">
              <Eyebrow className="mb-5">Ready to scope the work?</Eyebrow>
              <h2 className="display max-w-[14ch] text-[clamp(2.55rem,5.4vw,5.4rem)] leading-[0.95]">
                Build the next system with a steady technical partner.
              </h2>
              <p className="mt-6 max-w-[660px] text-[clamp(1rem,1.4vw,1.16rem)] text-muted-foreground">
                Send the goal, bottleneck, timeline, and budget range. I&apos;ll
                help turn it into a practical next step.
              </p>
            </div>

            <Button
              className="mt-9"
              variant="cta-filled"
              size="pill-cta"
              asChild
            >
              <a href="/contact">
                Start a conversation
                <ButtonArrow />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
