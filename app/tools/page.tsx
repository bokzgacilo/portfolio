import { Badge } from "@/components/ui/badge";

import {
  ListingGrid,
  ListingItem,
  ListingTitle,
  PageHero,
  SubPage,
  TextLink,
} from "../components/editorial";

const tools = [
  {
    title: "nowtpad",
    href: "https://nowtpad.vercel.app/",
    description: "A minimalist note-taking web app with a calm writing surface and browser-ready workflow.",
    tags: ["Notes", "Minimal UI", "Vercel"],
  },
  {
    title: "Catalog-as-a-Service",
    href: "https://catalog.bokzgacilo.com/",
    description: "A public product catalog API landing page for storefronts, prototypes, tutorials, and integrations.",
    tags: ["API", "Product Catalog", "Developers"],
  },
  {
    title: "SM Markets Clone",
    href: "https://smmarket-dev.vercel.app/",
    description: "A grocery and retail storefront implementation with browsing, search, cart entry, and campaign areas.",
    tags: ["E-commerce", "Storefront", "Clone"],
  },
];

export default function ToolsPage() {
  return (
    <SubPage>
      <PageHero eyebrow="Tools" title="Useful builds, shipped cleanly.">
        Selected web tools and product experiments from my portfolio.
      </PageHero>

      <ListingGrid aria-label="Tools">
        {tools.map((tool) => (
          <ListingItem key={tool.href}>
            <ListingTitle>{tool.title}</ListingTitle>
            <p className="text-muted-foreground">{tool.description}</p>
            <div className="mt-4 flex flex-wrap gap-[0.7rem]">
              {tool.tags.map((tag) => (
                <Badge variant="chip" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
            <TextLink href={tool.href} target="_blank" rel="noopener noreferrer">
              Open tool
            </TextLink>
          </ListingItem>
        ))}
      </ListingGrid>
    </SubPage>
  );
}
