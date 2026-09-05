"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLink =
  "mono-label inline-flex min-h-9 items-center rounded-full px-[0.72rem] py-[0.4rem] font-medium text-muted-foreground transition-colors hover:bg-[rgb(255_253_248/0.74)] hover:text-foreground";

function MobileDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 hidden h-[100dvh] transition-[visibility] duration-300 max-[900px]:block ${
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
        className={`absolute inset-y-0 right-0 flex w-[95%] flex-col overflow-hidden border-l border-border bg-paper shadow-mega transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-border px-5">
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

        <nav className="grid min-h-0 flex-1 content-start overflow-y-auto px-5 py-5" aria-label="Mobile navigation">
          <Link
            className="flex min-h-14 items-center border-b border-border mono-label text-muted-foreground no-underline"
            href="/tools"
            onClick={onClose}
          >
            Tools
          </Link>
          <Link
            className="flex min-h-14 items-center border-b border-border mono-label text-muted-foreground no-underline"
            href="/blogs"
            onClick={onClose}
          >
            Blogs
          </Link>
          <Link
            className="flex min-h-14 items-center border-b border-border mono-label text-muted-foreground no-underline"
            href="/storefronts"
            onClick={onClose}
          >
            Storefronts
          </Link>
          <Link
            className="flex min-h-14 items-center border-b border-border mono-label text-muted-foreground no-underline"
            href="/contact"
            onClick={onClose}
          >
            Contact
          </Link>
        </nav>

      </aside>
    </div>
  );
}

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
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
    <>
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
          <Link className={navLink} href="/tools">
            Tools
          </Link>
          <Link className={navLink} href="/blogs">
            Blogs
          </Link>
          <Link className={navLink} href="/storefronts">
            Storefronts
          </Link>
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
      </header>

      {/* Sibling of <header> on purpose: the header's backdrop-blur creates a
          containing block, so a fixed overlay nested inside it gets clipped. */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </>
  );
}
