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
    <main className="subpage">
      <section className="subpage-hero">
        <p className="eyebrow">Tools</p>
        <h1>Useful builds, shipped cleanly.</h1>
        <p>Selected web tools and product experiments from my portfolio.</p>
      </section>

      <section className="listing-grid" aria-label="Tools">
        {tools.map((tool) => (
          <article className="listing-item" key={tool.href}>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <div className="tag-row">
              {tool.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a className="text-link" href={tool.href} target="_blank" rel="noopener noreferrer">
              Open tool
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
