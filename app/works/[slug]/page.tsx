import { notFound } from "next/navigation";
import CaseTitle from "../../components/case-title";
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
    <main className="case-study">
      <section className="case-hero">
        <p className="eyebrow">{project.type}</p>
        <CaseTitle title={project.title} />
        <p>{project.description}</p>
        <div className="tag-row">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section className="case-layout">
        <div className="case-gallery">
          {project.gallery.map((image) => (
            <img key={image} src={image} alt={project.alt} />
          ))}
        </div>

        <aside className="case-details">
          <div className="case-sticky-title" aria-hidden="true">
            <span>{project.type}</span>
            <div className="case-title-target" data-case-title-target />
          </div>

          <dl className="project-meta">
            <div>
              <dt>Duration</dt>
              <dd>{project.duration}</dd>
            </div>
            <div>
              <dt>Tech stack</dt>
              <dd>{project.techStack.join(", ")}</dd>
            </div>
          </dl>

          <div className="drawer-section">
            <h2>Features</h2>
            <ul>
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>

          <a className="button primary" href={project.href} target="_blank" rel="noopener noreferrer">
            Open Live Project
          </a>
        </aside>
      </section>
    </main>
  );
}
