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
import { getProjectBySlug, projects } from "../../data/projects";

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
