import { Badge } from "@/components/ui/badge";
import { Button, ButtonArrow } from "@/components/ui/button";

import { CapabilityMap } from "./components/capability-map";
import {
  Eyebrow,
  measure,
  Section,
  SectionHeader,
  SiteFooter,
} from "./components/editorial";
import { WorkShowcase } from "./components/work-showcase";

const roles = [
  "Business Systems",
  "Commerce Systems",
  "Internal Tools",
  "API Integrations",
  "Data Workflows",
  "Launch Support",
];

const proofPoints = [
  ["3", "live product builds"],
  ["6", "service lanes"],
  ["12wk", "sample migration plan"],
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

const contacts = [
  ["Email", "bokzgacilo@gmail.com", "mailto:bokzgacilo@gmail.com"],
  ["Phone", "0976 222 0951", "tel:+639762220951"],
  [
    "LinkedIn",
    "ariel-jericko-gacilo",
    "https://www.linkedin.com/in/ariel-jericko-gacilo/",
  ],
  ["Facebook", "borobokbok", "https://web.facebook.com/borobokbok"],
  ["GitHub", "bokzgacilo", "https://github.com/bokzgacilo"],
] as const;

/**
 * Phase colours travel with the data rather than living in nth-child rules, so
 * reordering a phase reorders its colour with it.
 */
const migrationTimeline = [
  {
    phase: "Discovery & Planning",
    range: "Weeks 1-2",
    color: "#f5ead8",
    ink: "#151412",
    items: [
      "Kickoff and access setup",
      "Business goals and requirements",
      "Legacy site audit",
      "Migration scope and roadmap",
    ],
    outcome: "Approved scope",
  },
  {
    phase: "Design & Build",
    range: "Weeks 3-8",
    color: "#d5a66f",
    ink: "#151412",
    items: [
      "Shopify theme setup",
      "Core page templates",
      "Product and collection structure",
      "Apps and integrations",
    ],
    outcome: "Ready-to-migrate storefront",
  },
  {
    phase: "Migration & QA",
    range: "Weeks 9-11",
    color: "#7f8b78",
    ink: "#fffdf8",
    items: [
      "Content and product migration",
      "Checkout-adjacent testing",
      "Mobile QA",
      "Stakeholder review",
    ],
    outcome: "Launch-ready validation",
  },
  {
    phase: "Launch & Transition",
    range: "Week 12",
    color: "#b65f45",
    ink: "#fffdf8",
    items: [
      "Domain and launch setup",
      "Post-launch monitoring",
      "Bug fixes",
      "Handoff documentation",
    ],
    outcome: "Live store and team handoff",
  },
] as const;

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
      "Technical partner for businesses that need web products, commerce workflows, API integrations, automation, data pipelines, and reliable launch support.",
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
      "Portfolio and partnership page for Ariel Jericko Gacilo, a full-stack technical partner for business systems, commerce, automation, and web products.",
    publisher: {
      "@type": "Person",
      "@id": "https://www.bokzgacilo.com/#person",
      name: "Ariel Jericko Gacilo",
    },
  },
];

const panelImage =
  "min-h-0 border border-[rgb(216_209_197/0.72)] bg-card object-cover object-left-top";

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
          className="mx-auto grid min-h-[92svh] w-[min(80%,1180px)] grid-cols-[minmax(280px,0.82fr)_minmax(0,1fr)] items-center gap-[clamp(2rem,5vw,5rem)] pt-[clamp(7rem,12vw,10rem)] pb-[clamp(2rem,6vw,5rem)] max-[900px]:w-[min(88%,760px)] max-[900px]:grid-cols-1 max-[900px]:pt-36 max-[560px]:min-h-0 max-[560px]:w-[calc(100%_-_2.5rem)] max-[560px]:pt-28"
          id="hero"
        >
          <div
            className="relative grid max-h-[620px] min-h-[min(54vh,560px)] grid-rows-[minmax(0,1fr)_minmax(120px,0.46fr)] gap-[0.8rem] overflow-hidden rounded-lg bg-secondary p-[0.8rem] shadow-editorial [animation:fade_0.9s_ease_0.15s_both] max-[900px]:min-h-[420px] max-[900px]:grid-rows-[minmax(260px,1fr)_auto] max-[560px]:min-h-[320px]"
            aria-label="Business systems preview"
          >
            <img
              className={panelImage}
              src="/assets/projects/catalog-bokzgacilo.png"
              alt="Catalog-as-a-Service product interface"
            />
            <div
              className="grid min-h-0 grid-cols-[0.92fr_1.08fr] gap-[0.8rem] max-[900px]:grid-cols-1"
              aria-hidden="true"
            >
              <img className={panelImage} src="/assets/projects/nowtpad.png" alt="" />
              <img className={panelImage} src="/assets/projects/smmarket-dev.png" alt="" />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-[0.45rem] max-[560px]:static max-[560px]:bg-[rgb(255_253_248/0.7)] max-[560px]:p-[0.8rem]">
              {roles.map((role) => (
                <Badge variant="chip" key={role}>
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div className="max-w-[640px] [animation:rise_0.7s_ease_both] max-[900px]:order-first">
            <Eyebrow>Full-stack development for business operations</Eyebrow>
            <h1 className="display mb-6 max-w-[720px] text-[clamp(3.1rem,6.2vw,6.8rem)] leading-[0.94] max-[900px]:text-[2.35rem] max-[900px]:leading-[1.03]">
              Business web
              <br />
              systems that keep moving.
            </h1>
            <p className="max-w-[640px] text-[clamp(1rem,1.35vw,1.2rem)] text-muted-foreground max-[900px]:max-w-[31ch]">
              I build and improve web products, commerce workflows, APIs, automations,
              and reporting tools for teams that need dependable delivery.
            </p>
            <div
              className="mt-[1.8rem] grid grid-cols-3 gap-[0.9rem] border-t border-border pt-[1.1rem] max-[900px]:grid-cols-1"
              aria-label="Portfolio proof points"
            >
              {proofPoints.map(([value, label]) => (
                <span
                  className="grid gap-[0.12rem] text-[0.86rem] leading-[1.25] font-bold text-muted-foreground"
                  key={label}
                >
                  <strong className="display text-[clamp(1.8rem,3vw,2.65rem)] leading-none font-[650] text-foreground">
                    {value}
                  </strong>
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-[0.7rem] max-[560px]:flex-col max-[560px]:items-stretch">
              <Button variant="editorial-primary" size="pill" asChild>
                <a className="max-[560px]:w-full" href="/contact">
                  Discuss a Build
                </a>
              </Button>
              <Button variant="editorial" size="pill" asChild>
                <a className="max-[560px]:w-full" href="#projects">
                  Review Work
                </a>
              </Button>
            </div>
          </div>
        </section>

        <Section width="gallery" id="projects">
          <SectionHeader eyebrow="Projects" title="Recent" accent="work" />
          <WorkShowcase variant="carousel" />
          <Button variant="cta" size="pill-cta" className="mt-6" asChild>
            <a href="/works">
              Browse all works
              <ButtonArrow />
            </a>
          </Button>
        </Section>

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
                <h3 className="mt-4 mb-[0.7rem] text-base font-bold">{service.title}</h3>
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
          <SectionHeader eyebrow="Capability map" title="Business" accent="support" />
          <CapabilityMap />
        </Section>

        <Section compact width="timeline" id="timeline">
          <div className="reveal mb-[clamp(0.6rem,1.8vw,1rem)]">
            <Eyebrow>Sample project plan</Eyebrow>
            <h2 className="display text-[4rem] leading-none whitespace-nowrap max-[900px]:text-[3rem] max-[560px]:max-w-none max-[560px]:text-[1.9rem]">
              Migration <em className="text-brand italic">timeline</em>
            </h2>
          </div>
          <p className="reveal mb-[clamp(1rem,2.5vw,1.65rem)] max-w-[640px] text-[0.98rem] font-bold text-muted-foreground">
            Sample 3-month timeline for migrating a legacy site to Shopify.
          </p>

          <div className="relative grid grid-cols-4 border-t border-l border-border bg-[rgb(255_253_248/0.34)] [--line-y:4.7rem] max-[900px]:grid-cols-1 max-[900px]:[--line-y:auto]">
            {/* The connector the phase dots sit on: horizontal on desktop,
                vertical once the track stacks. */}
            <div
              aria-hidden="true"
              className="absolute top-[var(--line-y)] right-[clamp(1rem,2vw,1.4rem)] left-[clamp(1rem,2vw,1.4rem)] z-0 h-px bg-[rgb(21_20_18/0.25)] max-[900px]:top-[1.4rem] max-[900px]:right-auto max-[900px]:bottom-[1.4rem] max-[900px]:left-[1.25rem] max-[900px]:h-auto max-[900px]:w-px"
            />

            {migrationTimeline.map((phase, index) => (
              <article
                className="reveal relative z-1 flex min-h-[340px] flex-col border-r border-b border-border p-[clamp(1rem,2vw,1.35rem)] max-[900px]:min-h-0 max-[900px]:pl-12"
                key={phase.phase}
                style={
                  {
                    "--phase-color": phase.color,
                    "--phase-ink": phase.ink,
                  } as React.CSSProperties
                }
              >
                <span className="font-mono text-[0.76rem] font-extrabold tracking-[0.04em] text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute top-[calc(var(--line-y)_-_0.39rem)] left-[clamp(1rem,2vw,1.4rem)] z-1 size-[0.78rem] rounded-full border-2 border-paper bg-[var(--phase-color)] shadow-[0_0_0_5px_rgb(21_20_18/0.08)] max-[900px]:top-[1.15rem] max-[900px]:left-[0.86rem]"
                />
                <h3 className="display mt-[4.25rem] mb-[0.95rem] min-h-[2.2em] text-[clamp(1.45rem,2vw,2rem)] leading-[1.05] font-semibold max-[900px]:mt-[1.2rem] max-[900px]:min-h-0">
                  {phase.phase}
                </h3>
                <div className="timeline-arrow relative mb-[1.15rem] w-[calc(100%_-_1rem)] bg-[var(--phase-color)] px-4 py-[0.76rem] font-black uppercase text-[var(--phase-ink)] shadow-[0_10px_18px_rgb(21_20_18/0.08)] max-[900px]:w-fit max-[900px]:min-w-[min(260px,calc(100%_-_2rem))]">
                  {phase.range}
                </div>
                <ul className="grid list-none gap-[0.45rem] font-semibold text-[rgb(21_20_18/0.78)]">
                  {phase.items.map((item) => (
                    <li className="before:content-['-_']" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto border-t border-border pt-[0.85rem] font-extrabold text-foreground">
                  <span className="mono-label mb-1 block text-brand">Outcome</span>
                  {phase.outcome}
                </p>
              </article>
            ))}
          </div>

          <p className="reveal mt-4 max-w-[680px] text-[0.94rem] font-[650] text-muted-foreground">
            Timeline may adjust based on scope, integrations, content readiness,
            and approval cycles.
          </p>
        </Section>

        <section
          className={`${measure.text} grid grid-cols-[minmax(0,0.9fr)_minmax(300px,1.1fr)] items-end gap-[clamp(2rem,6vw,5rem)] border-t border-border py-[clamp(4rem,8vw,7rem)] max-[900px]:grid-cols-1`}
          id="contact"
        >
          <div className="reveal">
            <Eyebrow>Contact</Eyebrow>
            <h2 className="display text-[4rem] leading-none whitespace-nowrap max-[900px]:text-[3rem] max-[560px]:max-w-none max-[560px]:text-[1.9rem]">
              Let&apos;s talk work.
            </h2>
            <p className="mt-5 max-w-[560px] text-[1.05rem] text-muted-foreground">
              Share the business goal, current bottleneck, timeline, and budget.
              I can help scope the right build, improve an existing system, or
              create the workflow your team needs next.
            </p>
          </div>
          <div className="reveal grid grid-cols-2 gap-x-[1.4rem] gap-y-[0.3rem] max-[900px]:grid-cols-1">
            {contacts.map(([label, value, href]) => (
              <a
                className="grid gap-1 border-b border-border py-[0.95rem] font-extrabold no-underline [overflow-wrap:anywhere]"
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
      </main>

      <SiteFooter />
    </>
  );
}
