const blogs = [
  {
    title: "Integrating Salesforce CRM Leads with a Next.js Page Router App",
    href: "https://medium.com/@bokzgacilo/integrating-salesforce-crm-leads-with-a-next-js-page-router-app-7b29bac20ea9",
    description: "A technical walkthrough for connecting Salesforce CRM lead capture with a Next.js application.",
    source: "Medium",
  },
];

export default function BlogsPage() {
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <p className="eyebrow">Blogs</p>
        <h1>Notes from real integrations.</h1>
        <p>Technical writing and implementation notes from project work.</p>
      </section>

      <section className="listing-grid single" aria-label="Blogs">
        {blogs.map((blog) => (
          <article className="listing-item" key={blog.href}>
            <span className="kicker">{blog.source}</span>
            <h2>{blog.title}</h2>
            <p>{blog.description}</p>
            <a className="text-link" href={blog.href} target="_blank" rel="noopener noreferrer">
              Read blog
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
