import { CapabilityMap } from "./components/capability-map";
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

const migrationTimeline = [
  {
    phase: "Discovery & Planning",
    range: "Weeks 1-2",
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

function SectionHeader({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="section-header reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>
        {title} <em>{accent}</em>
      </h2>
    </div>
  );
}

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
        <section className="hero" id="hero">
          <div className="hero-media hero-business-panel" aria-label="Business systems preview">
            <img className="hero-proof-main" src="/assets/projects/catalog-bokzgacilo.png" alt="Catalog-as-a-Service product interface" />
            <div className="hero-proof-stack" aria-hidden="true">
              <img src="/assets/projects/nowtpad.png" alt="" />
              <img src="/assets/projects/smmarket-dev.png" alt="" />
            </div>
            <div className="hero-notes">
              {roles.map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">Full-stack development for business operations</p>
            <h1>
              Business web
              <br />
              systems that keep moving.
            </h1>
            <p className="hero-text">
              I build and improve web products, commerce workflows, APIs, automations,
              and reporting tools for teams that need dependable delivery.
            </p>
            <div className="hero-proof-points" aria-label="Portfolio proof points">
              {proofPoints.map(([value, label]) => (
                <span key={label}>
                  <strong>{value}</strong>
                  {label}
                </span>
              ))}
            </div>
            <div className="hero-actions">
              <a className="button primary" href="/contact">
                Discuss a Build
              </a>
              <a className="button secondary" href="#projects">
                Review Work
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="projects">
          <SectionHeader eyebrow="Projects" title="Recent" accent="work" />
          <WorkShowcase variant="carousel" />
          <a className="section-cta" href="/works">
            Browse all works
            <span aria-hidden="true">-&gt;</span>
          </a>
        </section>

        <section className="section" id="services">
          <SectionHeader eyebrow="Services" title="Focused" accent="support" />
          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-item reveal" key={service.title}>
                <img
                  className="service-art"
                  src={service.image}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                />
                <span className="service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <div className="tag-row">
                  {service.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section compact capability-section" id="skills">
          <SectionHeader
            eyebrow="Capability map"
            title="Business"
            accent="support"
          />
          <CapabilityMap />
        </section>

        <section className="section compact timeline-section" id="timeline">
          <SectionHeader
            eyebrow="Sample project plan"
            title="Migration"
            accent="timeline"
          />
          <p className="timeline-note reveal">
            Sample 3-month timeline for migrating a legacy site to Shopify.
          </p>
          <div className="timeline-track">
            {migrationTimeline.map((phase, index) => (
              <article className="timeline-phase reveal" key={phase.phase}>
                <span className="timeline-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="timeline-dot" aria-hidden="true" />
                <h3>{phase.phase}</h3>
                <div className="timeline-arrow">{phase.range}</div>
                <ul>
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="timeline-outcome">
                  <span>Outcome</span>
                  {phase.outcome}
                </p>
              </article>
            ))}
          </div>
          <p className="timeline-footer reveal">
            Timeline may adjust based on scope, integrations, content readiness,
            and approval cycles.
          </p>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy reveal">
            <p className="eyebrow">Contact</p>
            <h2>Let&apos;s talk work.</h2>
            <p>
              Share the business goal, current bottleneck, timeline, and budget.
              I can help scope the right build, improve an existing system, or
              create the workflow your team needs next.
            </p>
          </div>
          <div className="contact-links reveal">
            {contacts.map(([label, value, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                <span>{label}</span>
                {value}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Ariel Jericko Gacilo · {new Date().getFullYear()}</span>
        <a href="mailto:bokzgacilo@gmail.com">bokzgacilo@gmail.com</a>
      </footer>
    </>
  );
}
