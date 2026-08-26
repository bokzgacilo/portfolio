import { absoluteUrl } from "../data/site";

type Schema = Record<string, unknown>;

/** Renders one or more schema.org graphs. Server-only, so no hydration cost. */
export function JsonLd({ data }: { data: Schema | Schema[] }) {
  const graphs = Array.isArray(data) ? data : [data];

  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={(graph["@id"] as string) ?? index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}

/** Breadcrumbs give an agent the shape of the site from any single page. */
export function breadcrumbs(trail: readonly (readonly [string, string])[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(trail[trail.length - 1][1])}#breadcrumb`,
    itemListElement: trail.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

export function itemList(id: string, items: readonly (readonly [string, string])[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": id,
    numberOfItems: items.length,
    itemListElement: items.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: absoluteUrl(path),
    })),
  };
}
