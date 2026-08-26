"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import type { Project } from "../data/projects";
import { caseStudy, CaseMeta, DrawerSection, Eyebrow, TagRow } from "./editorial";

/**
 * Alternative case-study view that docks the title with an IntersectionObserver
 * instead of the scroll-linked transform in CaseTitle. Currently unreferenced --
 * the /works/[slug] route uses CaseTitle.
 */
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
    <main className={caseStudy.page}>
      <section className={caseStudy.hero}>
        <Eyebrow>{project.type}</Eyebrow>
        <h1 className={caseStudy.title} ref={titleRef}>
          {project.title}
        </h1>
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
          <div className={caseStudy.stickyTitle} aria-hidden={!isDocked}>
            <span className="mono-label text-brand">{project.type}</span>
            <strong className={caseStudy.stickyTarget}>{project.title}</strong>
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
