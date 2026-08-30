export const storefronts = [
  {
    slug: "vanta-studio",
    title: "VANTA Studio",
    productType: "Apparel / clothing",
    feel: "Editorial, minimal, sharp, premium",
    description:
      "A fashion storefront concept for structured everyday pieces, built around strong imagery, quick product discovery, and a compact checkout flow.",
    thumbnail:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=82",
  },
] as const;

export type Storefront = (typeof storefronts)[number];

export function getStorefront(slug: string) {
  return storefronts.find((storefront) => storefront.slug === slug);
}
