import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getStorefront, storefronts } from "../data";
import { StorefrontShowcase } from "../storefront-showcase";

type StorefrontPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storefronts.map((storefront) => ({ slug: storefront.slug }));
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { slug } = await params;
  const storefront = getStorefront(slug);

  if (!storefront) return {};

  return {
    title: `${storefront.title} Storefront Concept | Ariel Jericko Gacilo`,
    description: storefront.description,
    alternates: { canonical: `/storefronts/${storefront.slug}` },
    openGraph: {
      type: "website",
      title: `${storefront.title} Storefront Concept | Ariel Jericko Gacilo`,
      description: storefront.description,
      url: `https://www.bokzgacilo.com/storefronts/${storefront.slug}`,
      images: [{ url: storefront.thumbnail, alt: `${storefront.title} storefront concept` }],
    },
  };
}

export default async function StorefrontPdpPage({ params }: StorefrontPageProps) {
  const { slug } = await params;
  const storefront = getStorefront(slug);

  if (!storefront) {
    notFound();
  }

  return (
    <main className="fixed inset-0 z-[60] w-screen max-w-[100vw] overflow-x-hidden overflow-y-auto bg-[#050505] text-[#141414]">
      <StorefrontShowcase storefront={storefront} />
    </main>
  );
}
