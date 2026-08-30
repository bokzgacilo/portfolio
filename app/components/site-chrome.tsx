"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { SiteFooter } from "./editorial";
import { PageTransition } from "./page-transition";
import { SiteHeader } from "./site-header";

function usesDetachedChrome(pathname: string) {
  return pathname.startsWith("/storefronts/");
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const detached = usesDetachedChrome(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("storefront-detached", detached);
    document.body.classList.toggle("storefront-detached", detached);
    if (detached) {
      window.scrollTo({ left: 0, top: window.scrollY });
    }

    return () => {
      document.documentElement.classList.remove("storefront-detached");
      document.body.classList.remove("storefront-detached");
    };
  }, [detached]);

  return (
    <>
      {detached ? null : <SiteHeader />}
      <PageTransition>{children}</PageTransition>
      {detached ? null : <SiteFooter />}
    </>
  );
}
