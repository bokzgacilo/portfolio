import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";

import CaseTitle from "../../components/case-title";
import {
  caseStudy,
  CaseMeta,
  DrawerSection,
  Eyebrow,
  TagRow,
} from "../../components/editorial";
import { breadcrumbs, JsonLd } from "../../components/json-ld";
import { getProjectBySlug, projects } from "../../data/projects";
import { absoluteUrl } from "../../data/site";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} | Ariel Jericko Gacilo`,
    description: project.description,
    alternates: { canonical: `/works/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} | Ariel Jericko Gacilo`,
      description: project.description,
      url: absoluteUrl(`/works/${project.slug}`),
      images: [{ url: project.image, alt: project.alt }],
    },
  };
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className={caseStudy.page}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": `${absoluteUrl(`/works/${project.slug}`)}#work`,
            name: project.title,
            url: absoluteUrl(`/works/${project.slug}`),
            description: project.description,
            image: absoluteUrl(project.image),
            genre: project.type,
            keywords: [...project.tags].join(", "),
            about: [...project.techStack].join(", "),
            sameAs: project.href,
            creator: { "@id": `${absoluteUrl("/")}#person` },
          },
          breadcrumbs([
            ["Home", "/"],
            ["Works", "/works"],
            [project.title, `/works/${project.slug}`],
          ]),
        ]}
      />

      <section className={caseStudy.hero}>
        <Eyebrow>{project.type}</Eyebrow>
        <CaseTitle title={project.title} />
        <p className={caseStudy.lede}>{project.description}</p>
        <TagRow className="mt-4" tags={project.tags} />
      </section>

      <section className={caseStudy.layout}>
        <div className={caseStudy.gallery}>
          {project.gallery.map((image) => (
            <img className={caseStudy.galleryImage} key={image} src={image} alt={project.alt} />
          ))}
        </div>

        <aside className={caseStudy.details} data-case-details>
          <div className={caseStudy.stickyTitle} aria-hidden="true">
            <span className="case-sticky-label mono-label text-brand transition-opacity duration-[450ms]">
              {project.type}
            </span>
            <div className={caseStudy.stickyTarget} data-case-title-target />
          </div>

          <CaseMeta duration={project.duration} stack={project.techStack.join(", ")} />

          <DrawerSection title="Features" items={project.features} />

          <Button variant="editorial-primary" size="pill" asChild>
            <a href={project.href} target="_blank" rel="noopener noreferrer">
              Open Live Project
            </a>
          </Button>
        </aside>
      </section>
    </main>
  );
}
