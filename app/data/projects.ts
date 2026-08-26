export const projects = [
  {
    slug: "nowtpad",
    title: "nowtpad",
    href: "https://nowtpad.vercel.app/",
    image: "/assets/projects/nowtpad.png",
    kicker: "nowtpad.vercel.app",
    alt: "Screenshot of nowtpad minimalist note-taking web app",
    description:
      "A focused note-taking product that demonstrates clean interaction design, fast deployment, and a low-friction browser workflow.",
    type: "Product build",
    duration: "1 week prototype",
    techStack: ["Next.js", "React", "Vercel", "CSS"],
    tags: ["Notes", "Minimal UI", "Vercel"],
    features: ["Focused writing surface", "Fast Vercel deployment", "Responsive browser workflow", "Minimal interface decisions"],
    gallery: ["/assets/projects/nowtpad.png", "/assets/services/web-apps.png", "/assets/services/websites.png"],
  },
  {
    slug: "catalog-as-a-service",
    title: "Catalog-as-a-Service",
    href: "https://catalog.bokzgacilo.com/",
    image: "/assets/projects/catalog-bokzgacilo.png",
    kicker: "catalog.bokzgacilo.com",
    alt: "Screenshot of catalog.bokzgacilo.com public product catalog API landing page",
    description:
      "A public product catalog API designed to support storefront prototypes, documentation flows, and integration-ready product data.",
    type: "API platform",
    duration: "2 week build",
    techStack: ["Next.js", "API Routes", "Product Data", "Vercel"],
    tags: ["API", "Product Catalog", "Landing Page"],
    features: [
      "Developer-facing API positioning",
      "Documentation-ready page structure",
      "Product data access flow",
      "Integration use-case framing",
    ],
    gallery: ["/assets/projects/catalog-bokzgacilo.png", "/assets/services/integrations.png", "/assets/services/data-work.png"],
  },
  {
    slug: "sm-markets-clone",
    title: "SM Markets Clone",
    href: "https://smmarket-dev.vercel.app/",
    image: "/assets/projects/smmarket-dev.png",
    kicker: "smmarket-dev.vercel.app",
    alt: "Screenshot of smmarket-dev.vercel.app SM Markets cloned grocery storefront",
    description:
      "A retail storefront build that shows category browsing, search, cart entry, campaign merchandising, and customer shopping flow.",
    type: "Commerce flow",
    duration: "2 week storefront sprint",
    techStack: ["React", "Next.js", "E-commerce UI", "Vercel"],
    tags: ["Cloned Site", "E-commerce", "Storefront"],
    features: ["Category browsing", "Search and cart entry", "Campaign merchandising sections", "Responsive storefront layout"],
    gallery: ["/assets/projects/smmarket-dev.png", "/assets/services/ecommerce.png", "/assets/services/websites.png"],
  },
] as const;

export type Project = (typeof projects)[number];

export const projectTypes = ["All", ...Array.from(new Set(projects.map((project) => project.type)))] as const;

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
