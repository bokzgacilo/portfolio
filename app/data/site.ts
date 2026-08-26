/**
 * One source of truth for the facts that appear in metadata, structured data,
 * llms.txt, and the pages themselves -- so an agent reading any one of them
 * gets the same answer.
 */
export const site = {
  url: "https://www.bokzgacilo.com",
  name: "Ariel Jericko Gacilo",
  initials: "AJG",
  role: "Full-stack developer and technical partner",
  location: "Manila, Philippines · Remote-friendly",
  availability: "Available for product and ops builds",
  summary:
    "Ariel Jericko Gacilo builds and repairs web apps, games, Android apps, Windows desktop tools, storefronts, API integrations, and automations — then hands them over documented, so they keep running without him.",
  engagement:
    "Work starts with a 1:1 scope review: describe the problem, get a practical next step. No pitch deck, no obligation.",
} as const;

export const contactLinks = [
  ["Email", "bokzgacilo@gmail.com", "mailto:bokzgacilo@gmail.com"],
  ["Phone", "0976 222 0951", "tel:+639762220951"],
  ["LinkedIn", "ariel-jericko-gacilo", "https://www.linkedin.com/in/ariel-jericko-gacilo/"],
  ["GitHub", "bokzgacilo", "https://github.com/bokzgacilo"],
] as const;

export function absoluteUrl(path: string) {
  return `${site.url}${path}`;
}
