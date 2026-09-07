import Link from "next/link";
import {
  Kicker,
  ListingGrid,
  ListingItem,
  ListingTitle,
  PageHero,
  SubPage,
  TextLink,
} from "../components/editorial";
import { breadcrumbs, JsonLd } from "../components/json-ld";
import { blogs } from "../data/blogs";
import { absoluteUrl } from "../data/site";

export const metadata = {
  title: "Blogs | Ariel Jericko Gacilo",
  description:
    "Technical writing and implementation notes from real project work — Salesforce CRM lead capture, Next.js integrations, and deployment.",
  alternates: { canonical: "/blogs" },
};



export default function BlogsPage() {
  return (
    <SubPage>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": `${absoluteUrl("/blogs")}#blog`,
            url: absoluteUrl("/blogs"),
            name: "Notes from real integrations",
            author: { "@id": `${absoluteUrl("/")}#person` },
            blogPost: blogs.map((blog) => ({
              "@type": "BlogPosting",
              headline: blog.title,
              url: blog.href,
              description: blog.description,
              author: { "@id": `${absoluteUrl("/")}#person` },
            })),
          },
          breadcrumbs([
            ["Home", "/"],
            ["Blogs", "/blogs"],
          ]),
        ]}
      />

      <PageHero eyebrow="Blogs" title="Notes from real integrations.">
        Technical writing and implementation notes from project work.
      </PageHero>

      <ListingGrid single aria-label="Blogs">
        {blogs.map((blog) => (
          <ListingItem key={blog.href}>
            <Kicker>{blog.source}</Kicker>
            <ListingTitle className="mt-2">{blog.title}</ListingTitle>
            <p className="text-muted-foreground">{blog.description}</p>
            {blog.external ? (
              <TextLink href={blog.href} target="_blank" rel="noopener noreferrer">
                Read blog
              </TextLink>
            ) : (
              <Link
                className="mt-[1.35rem] inline-flex w-fit font-extrabold text-brand-dark underline decoration-border underline-offset-[0.35em]"
                href={blog.href}
              >
                Read blog
              </Link>
            )}
          </ListingItem>
        ))}
      </ListingGrid>
    </SubPage>
  );
}
