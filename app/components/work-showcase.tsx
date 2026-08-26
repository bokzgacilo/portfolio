"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { projects, projectTypes } from "../data/projects";

export function WorkShowcase({ variant = "catalog" }: { variant?: "carousel" | "catalog" }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<(typeof projectTypes)[number]>("All");

  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesType = activeType === "All" || project.type === activeType;
      const matchesSearch =
        !search ||
        [project.title, project.kicker, project.description, project.type, ...project.tags, ...project.techStack]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesType && matchesSearch;
    });
  }, [activeType, query]);

  return (
    <div className={variant === "carousel" ? "work-carousel" : "work-catalog"}>
      {variant === "catalog" ? (
        <aside className="work-filters reveal" aria-label="Recent work filters">
          <label className="work-search">
            <span>Search</span>
            <input
              type="search"
              placeholder="Search projects"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search projects"
            />
          </label>
          <div className="filter-group">
            <h3>Type</h3>
            {projectTypes.map((item) => (
              <button
                className={activeType === item ? "active" : ""}
                type="button"
                key={item}
                onClick={() => setActiveType(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <h3>Tags</h3>
            <div className="tag-row">
              {Array.from(new Set(projects.flatMap((project) => project.tags))).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      ) : null}

      <div className="work-list">
        {filteredProjects.map((project, index) => (
          <motion.article
            className="work-item reveal"
            key={project.title}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link className="work-card-link" href={`/works/${project.slug}`} aria-label={`View ${project.title} case study`}>
              <span className="work-thumb">
                <img src={project.image} alt={project.alt} loading={index === 0 ? "eager" : "lazy"} />
              </span>
              <span className="work-copy">
                <span className="work-copy-main">
                  <span className="kicker">{project.kicker}</span>
                  <span className="work-title">{project.title}</span>
                  <span className="work-description">{project.description}</span>
                </span>
                <span className="work-copy-bottom">
                  <span className="tag-row">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                  <span className="work-open">
                    View Case Study
                    <span aria-hidden="true">-&gt;</span>
                  </span>
                </span>
              </span>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
