"use client";

import { ArrowLeft, ChevronRight, Menu, X } from "lucide-react";
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

const navLink =
  "mono-label inline-flex min-h-9 items-center rounded-full px-[0.72rem] py-[0.4rem] font-medium text-muted-foreground transition-colors hover:bg-[rgb(255_253_248/0.74)] hover:text-foreground";

/** Links inside the mega panel drop the mono treatment for readable sans. */
const megaLink =
  "font-sans text-[0.98rem] font-[650] leading-[1.35] tracking-normal normal-case text-muted-foreground transition-colors hover:text-foreground focus:text-foreground focus:outline-none";

function NavChevron() {
  return (
    <span
      aria-hidden="true"
      className="ml-2 size-[0.34rem] -translate-y-[2px] rotate-45 border-r border-b border-current"
    />
  );
}

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
    /* Deliberately `static`: the panel spans the viewport by resolving its
       inset against the fixed header, not against this wrapper. */
    <div
      className="group/menu static"
      data-open={isOpen}
      onBlur={handleBlur}
      onMouseLeave={scheduleCloseDropdown}
    >
      <Link
        className={`${navLink} group-data-[open=true]/menu:bg-[rgb(255_253_248/0.74)] group-data-[open=true]/menu:text-foreground`}
        href={href}
        onFocus={openDropdown}
        onMouseEnter={openDropdown}
      >
        {label}
        <NavChevron />
      </Link>

      <div
        className="pointer-events-none absolute inset-x-0 top-full w-screen -translate-y-1.5 border-y border-border bg-[rgb(255_253_248/0.98)] opacity-0 shadow-mega transition-[opacity,transform] duration-[180ms] group-data-[open=true]/menu:pointer-events-auto group-data-[open=true]/menu:translate-y-0 group-data-[open=true]/menu:opacity-100 max-[900px]:max-h-[calc(100vh_-_118px)] max-[900px]:overflow-y-auto"
        aria-label={`${label} menu`}
        onMouseEnter={openDropdown}
        onMouseLeave={scheduleCloseDropdown}
      >
        <button
          className="sticky top-0 z-2 hidden min-h-[52px] w-full items-center justify-between border-b border-border bg-[rgb(255_253_248/0.96)] px-5 py-[0.85rem] text-left font-extrabold text-foreground backdrop-blur-[14px] max-[900px]:flex"
          type="button"
          onClick={closeDropdown}
          aria-label={`Close ${label} menu`}
        >
          Close
          <span
            aria-hidden="true"
            className="mono-label inline-grid size-8 place-items-center rounded-full border border-border text-[0.78rem] text-muted-foreground"
          >
            x
          </span>
        </button>

        <div className="mx-auto grid w-[min(100%,1920px)] grid-cols-[minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(420px,2.2fr)] max-[900px]:grid-cols-1">
          <div className="flex min-h-[300px] flex-col gap-[0.72rem] border-r border-border px-[clamp(1.25rem,4vw,4rem)] py-8 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:py-[1.4rem]">
            <h2 className="mb-1 font-sans text-base font-extrabold tracking-normal">{label}</h2>
            <Link className={`${megaLink} mega-main-link text-foreground`} href={href}>
              View all {label.toLowerCase()}
            </Link>
            {primary.map(([itemLabel, itemHref]) => (
              <a className={megaLink} key={itemHref} href={itemHref} target="_blank" rel="noopener noreferrer">
                {itemLabel}
              </a>
            ))}
          </div>

          <div className="flex min-h-[300px] flex-col gap-[0.72rem] border-r border-border px-[clamp(1.25rem,4vw,4rem)] py-8 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:py-[1.4rem]">
            <h2 className="mb-1 font-sans text-base font-extrabold tracking-normal">{secondaryLabel}</h2>
            {secondaryItems.map((item) => (
              <span className={megaLink} key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-[0.9rem] px-[clamp(1.25rem,4vw,4rem)] py-[1.8rem] max-[900px]:grid-cols-1 max-[900px]:py-[1.2rem]">
            {featured.map((item) => (
              <a
                className="group/feature relative flex min-h-[250px] items-end overflow-hidden bg-secondary max-[900px]:min-h-[220px]"
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="absolute inset-0 size-full object-cover object-left-top transition-transform duration-[350ms] group-hover/feature:scale-[1.035] group-focus/feature:scale-[1.035]"
                  src={item.image}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                />
                <span className="relative z-1 w-full bg-gradient-to-b from-transparent to-[rgb(21_20_18/0.72)] p-4 font-sans text-[0.95rem] font-extrabold text-paper">
                  {item.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({
  isOpen,
  activePanel,
  setActivePanel,
  onClose,
}: {
  isOpen: boolean;
  activePanel: "tools" | "blogs" | null;
  setActivePanel: (panel: "tools" | "blogs" | null) => void;
  onClose: () => void;
}) {
  const panelContent =
    activePanel === "tools"
      ? {
          label: "Tools",
          href: "/tools",
          primary: tools.primary,
          secondaryLabel: "Services",
          secondaryItems: tools.services,
          featured: tools.featured,
        }
      : activePanel === "blogs"
        ? {
            label: "Blogs",
            href: "/blogs",
            primary: blogs.primary,
            secondaryLabel: "Topics",
            secondaryItems: blogs.topics,
            featured: blogs.featured,
          }
        : null;

  return (
    <div
      className={`fixed inset-0 z-50 hidden transition-[visibility] duration-300 max-[900px]:block ${
        isOpen ? "visible" : "invisible"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        className={`absolute inset-0 cursor-default bg-[rgb(21_20_18/0.32)] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside
        className={`absolute top-0 right-0 h-full w-[min(88vw,420px)] overflow-hidden border-l border-border bg-paper shadow-mega transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border px-5">
          <Link
            className="display text-[1.05rem] font-[650] no-underline"
            href="/"
            onClick={onClose}
            aria-label="Ariel Jericko Gacilo portfolio"
          >
            AJG
          </Link>
          <button
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground"
            type="button"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <nav className="grid px-5 py-5" aria-label="Mobile navigation">
          <button
            className="flex min-h-14 items-center justify-between border-b border-border text-left mono-label text-muted-foreground"
            type="button"
            onClick={() => setActivePanel("tools")}
          >
            Tools
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </button>
          <button
            className="flex min-h-14 items-center justify-between border-b border-border text-left mono-label text-muted-foreground"
            type="button"
            onClick={() => setActivePanel("blogs")}
          >
            Blogs
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </button>
          <Link
            className="flex min-h-14 items-center border-b border-border mono-label text-muted-foreground no-underline"
            href="/contact"
            onClick={onClose}
          >
            Contact
          </Link>
        </nav>

        <div
          className={`absolute inset-0 bg-paper transition-transform duration-300 ease-out ${
            panelContent ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!panelContent}
        >
          {panelContent ? (
            <div className="flex h-full flex-col">
              <div className="flex min-h-16 items-center justify-between border-b border-border px-5">
                <button
                  className="inline-flex items-center gap-2 mono-label text-muted-foreground"
                  type="button"
                  onClick={() => setActivePanel(null)}
                >
                  <ArrowLeft className="size-4" strokeWidth={1.8} />
                  Menu
                </button>
                <button
                  className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground"
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>

              <div className="min-h-0 overflow-y-auto px-5 py-5">
                <Link
                  className="display mb-6 block text-[2.25rem] leading-none text-foreground no-underline"
                  href={panelContent.href}
                  onClick={onClose}
                >
                  {panelContent.label}
                </Link>

                <div className="grid gap-8">
                  <div className="grid gap-3">
                    <h2 className="mono-label text-brand">Featured</h2>
                    <Link
                      className={`${megaLink} mega-main-link text-foreground`}
                      href={panelContent.href}
                      onClick={onClose}
                    >
                      View all {panelContent.label.toLowerCase()}
                    </Link>
                    {panelContent.primary.map(([itemLabel, itemHref]) => (
                      <a
                        className={megaLink}
                        key={itemHref}
                        href={itemHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                      >
                        {itemLabel}
                      </a>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <h2 className="mono-label text-brand">{panelContent.secondaryLabel}</h2>
                    {panelContent.secondaryItems.map((item) => (
                      <span className={megaLink} key={item}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <h2 className="mono-label text-brand">Preview</h2>
                    {panelContent.featured.map((item) => (
                      <a
                        className="group/feature relative flex min-h-[190px] items-end overflow-hidden bg-secondary"
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                      >
                        <img
                          className="absolute inset-0 size-full object-cover object-left-top transition-transform duration-[350ms] group-hover/feature:scale-[1.035] group-focus/feature:scale-[1.035]"
                          src={item.image}
                          alt=""
                          loading="lazy"
                          aria-hidden="true"
                        />
                        <span className="relative z-1 w-full bg-gradient-to-b from-transparent to-[rgb(21_20_18/0.72)] p-4 font-sans text-[0.95rem] font-extrabold text-paper">
                          {item.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<"tools" | "blogs" | null>(null);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setActiveMobilePanel(null);
  }

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="print-hidden fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-8 border-b border-[rgb(216_209_197/0.7)] bg-[rgb(247_245_240/0.82)] px-[clamp(1.25rem,4vw,4rem)] py-4 backdrop-blur-[18px] max-[900px]:gap-4 max-[560px]:absolute">
      <Link
        className="display text-[1.05rem] font-[650] whitespace-nowrap no-underline max-[900px]:text-[1.2rem]"
        href="/"
        aria-label="Ariel Jericko Gacilo portfolio"
      >
        <span className="max-[900px]:hidden">Ariel Jericko Gacilo</span>
        <span className="hidden max-[900px]:inline">AJG</span>
      </Link>
      <nav
        className="flex flex-wrap justify-end gap-x-[0.6rem] gap-y-[0.35rem] max-[900px]:hidden"
        aria-label="Primary navigation"
      >
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
        <Link className={navLink} href="/contact">
          Contact
        </Link>
      </nav>
      <button
        className="hidden size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-lift max-[900px]:grid"
        type="button"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={isMobileMenuOpen}
      >
        <Menu className="size-4" strokeWidth={2} />
      </button>
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        activePanel={activeMobilePanel}
        setActivePanel={setActiveMobilePanel}
        onClose={closeMobileMenu}
      />
    </header>
  );
}
