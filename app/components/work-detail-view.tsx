"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "../data/projects";

export function WorkDetailView({ project }: { project: Project }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const title = titleRef.current;

    if (!title) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsDocked(!entry.isIntersecting);
      },
      {
        rootMargin: "-88px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(title);

    return () => observer.disconnect();
  }, []);

  return (
    <main className={`case-study${isDocked ? " is-title-docked" : ""}`}>
      <section className="case-hero">
        <p className="eyebrow">{project.type}</p>
        <h1 ref={titleRef}>{project.title}</h1>
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
          <div className="case-sticky-title" aria-hidden={!isDocked}>
            <span>{project.type}</span>
            <strong>{project.title}</strong>
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
