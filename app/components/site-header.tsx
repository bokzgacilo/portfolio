"use client";

import Link from "next/link";
import { type FocusEvent, useEffect, useRef, useState } from "react";

const tools = {
  primary: [
    ["nowtpad", "https://nowtpad.vercel.app/"],
    ["Catalog-as-a-Service", "https://catalog.bokzgacilo.com/"],
    ["SM Markets Clone", "https://smmarket-dev.vercel.app/"],
  ],
  services: ["Web apps", "Shopify stores", "Thesis systems", "API integrations", "Excel / ETL", "Web scraping"],
  featured: [
    {
      title: "nowtpad",
      href: "https://nowtpad.vercel.app/",
      image: "/assets/projects/nowtpad.png",
    },
    {
      title: "Catalog API",
      href: "https://catalog.bokzgacilo.com/",
      image: "/assets/projects/catalog-bokzgacilo.png",
    },
    {
      title: "SM Markets",
      href: "https://smmarket-dev.vercel.app/",
      image: "/assets/projects/smmarket-dev.png",
    },
  ],
} as const;

const blogs = {
  primary: [
    [
      "Salesforce CRM + Next.js leads",
      "https://medium.com/@bokzgacilo/integrating-salesforce-crm-leads-with-a-next-js-page-router-app-7b29bac20ea9",
    ],
  ],
  topics: ["Next.js", "Salesforce CRM", "Lead capture", "API routes", "Form handling", "Deployment notes"],
  featured: [
    {
      title: "Salesforce CRM Leads",
      href: "https://medium.com/@bokzgacilo/integrating-salesforce-crm-leads-with-a-next-js-page-router-app-7b29bac20ea9",
      image: "/assets/services/integrations.png",
    },
  ],
} as const;

function NavDropdown({
  label,
  href,
  primary,
  secondaryLabel,
  secondaryItems,
  featured,
}: {
  label: string;
  href: string;
  primary: readonly (readonly [string, string])[];
  secondaryLabel: string;
  secondaryItems: readonly string[];
  featured: readonly { title: string; href: string; image: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openDropdown() {
    clearCloseTimer();
    setIsOpen(true);
  }

  function scheduleCloseDropdown() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setIsOpen(false);
      closeTimer.current = null;
    }, 160);
  }

  function hideDropdown() {
    clearCloseTimer();
    setIsOpen(false);
  }

  function closeDropdown() {
    hideDropdown();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      hideDropdown();
    }
  }

  useEffect(() => clearCloseTimer, []);

  return (
    <div className={`nav-menu${isOpen ? " is-open" : ""}`} onBlur={handleBlur} onMouseLeave={scheduleCloseDropdown}>
      <Link className="nav-link" href={href} onFocus={openDropdown} onMouseEnter={openDropdown}>
        {label}
      </Link>
      <div className="nav-dropdown" aria-label={`${label} menu`} onMouseEnter={openDropdown} onMouseLeave={scheduleCloseDropdown}>
        <button className="mega-close" type="button" onClick={closeDropdown} aria-label={`Close ${label} menu`}>
          Close
          <span aria-hidden="true">x</span>
        </button>
        <div className="mega-inner">
          <div className="mega-column">
            <h2>{label}</h2>
            <Link className="mega-main-link" href={href}>
              View all {label.toLowerCase()}
            </Link>
            {primary.map(([itemLabel, itemHref]) => (
              <a key={itemHref} href={itemHref} target="_blank" rel="noopener noreferrer">
                {itemLabel}
              </a>
            ))}
          </div>
          <div className="mega-column">
            <h2>{secondaryLabel}</h2>
            {secondaryItems.map((item) => (
              <span className="mega-text-item" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="mega-feature-grid">
            {featured.map((item) => (
              <a className="mega-feature" key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                <img src={item.image} alt="" loading="lazy" aria-hidden="true" />
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Ariel Jericko Gacilo portfolio">
        Ariel Jericko Gacilo
      </Link>
      <nav aria-label="Primary navigation">
        <NavDropdown
          label="Tools"
          href="/tools"
          primary={tools.primary}
          secondaryLabel="Services"
          secondaryItems={tools.services}
          featured={tools.featured}
        />
        <NavDropdown
          label="Blogs"
          href="/blogs"
          primary={blogs.primary}
          secondaryLabel="Topics"
          secondaryItems={blogs.topics}
          featured={blogs.featured}
        />
        <Link className="nav-link nav-link-plain" href="/contact">
          Contact
        </Link>
      </nav>
    </header>
  );
}
