import type { Metadata } from "next";
import Link from "next/link";

import { storefronts } from "./data";

export const metadata: Metadata = {
  title: "Storefront Ideas | Ariel Jericko Gacilo",
  description:
    "A showcase of storefront concepts with homepage, product listing, product detail, cart, checkout, and account flows.",
  alternates: { canonical: "/storefronts" },
  openGraph: {
    type: "website",
    title: "Storefront Ideas | Ariel Jericko Gacilo",
    description:
      "A showcase of storefront concepts with homepage, product listing, product detail, cart, checkout, and account flows.",
    url: "https://www.bokzgacilo.com/storefronts",
  },
};

export default function StorefrontsPage() {
  return (
    <main className="min-h-svh bg-[#f7f3ea] pt-[clamp(2rem,6vw,5rem)] text-[#141414]">
      <section className="mx-auto grid w-[min(92%,1500px)] gap-[clamp(2rem,5vw,4rem)] pb-[clamp(3rem,7vw,5.5rem)]">
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] gap-[clamp(1.5rem,5vw,5rem)] max-[900px]:grid-cols-1">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#6dff4f]">
              Storefront Lab
            </p>
            <h1 className="mt-4 max-w-[11ch] font-sans text-[clamp(3rem,8.4vw,8.5rem)] font-black uppercase leading-[0.86] tracking-normal">
              Commerce ideas with working flows.
            </h1>
          </div>
          <div className="self-end border-l border-[#141414]/20 pl-6 max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pt-5 max-[900px]:pl-0">
            <p className="max-w-[44ch] text-[clamp(1rem,1.45vw,1.2rem)] leading-[1.65] text-[#4e4a42]">
              A product-listing page for storefront concepts. Open a storefront
              idea to view its full homepage, PLP, PDP, cart, checkout, and
              account flow.
            </p>
          </div>
        </div>

        <section aria-labelledby="storefront-list-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#141414] pt-5">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#6dff4f]">
                Ideas
              </p>
              <h2 id="storefront-list-title" className="mt-2 text-[1.2rem] font-black uppercase tracking-normal">
                Current storefront concepts
              </h2>
            </div>
            <span className="rounded-full bg-[#141414] px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[#f7f3ea]">
              {storefronts.length} idea
            </span>
          </div>

          <div className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
            {storefronts.map((storefront) => (
              <Link
                className="group/store block border border-[#141414] bg-[#fffaf0] p-3 no-underline shadow-[8px_8px_0_#141414] transition-transform hover:-translate-y-1"
                href={`/storefronts/${storefront.slug}`}
                key={storefront.slug}
              >
                <div className="overflow-hidden bg-[#ded6c7]">
                  <img
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover/store:scale-[1.04]"
                    src={storefront.thumbnail}
                    alt={`${storefront.title} storefront thumbnail`}
                  />
                </div>
                <div className="grid gap-3 pt-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#69645b]">
                    {storefront.productType}
                  </p>
                  <h3 className="text-[clamp(1.6rem,3vw,2.6rem)] font-black uppercase leading-[0.9]">
                    {storefront.title}
                  </h3>
                  <p className="text-[#4e4a42]">{storefront.description}</p>
                  <div>
                    <p className="mb-1 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#69645b]">
                      Feel
                    </p>
                    <p className="font-bold uppercase leading-tight">{storefront.feel}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
