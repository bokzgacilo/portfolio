import {
  Kicker,
  ListingGrid,
  ListingItem,
  ListingTitle,
  PageHero,
  SubPage,
  TextLink,
} from "../components/editorial";

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
    <SubPage>
      <PageHero eyebrow="Blogs" title="Notes from real integrations.">
        Technical writing and implementation notes from project work.
      </PageHero>

      <ListingGrid single aria-label="Blogs">
        {blogs.map((blog) => (
          <ListingItem key={blog.href}>
            <Kicker>{blog.source}</Kicker>
            <ListingTitle className="mt-2">{blog.title}</ListingTitle>
            <p className="text-muted-foreground">{blog.description}</p>
            <TextLink href={blog.href} target="_blank" rel="noopener noreferrer">
              Read blog
            </TextLink>
          </ListingItem>
        ))}
      </ListingGrid>
    </SubPage>
  );
}
