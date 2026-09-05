import { blogs } from "@/app/data/blogs";
import { tools } from "@/app/tools/data";

export function blogKey(href: string) {
  return `blog/${new URL(href).pathname.split("/").filter(Boolean).pop()}`;
}
export const statisticResources = [
  ...tools.filter(tool => tool.status === "live").map(tool => ({ key: `tool/${tool.category}/${tool.slug}`, kind: "tool" as const })),
  ...blogs.map(blog => ({ key: blogKey(blog.href), kind: "blog" as const })),
];
export type ResourceStats = { resource_key: string; visitors: number; completed: number; opens: number };
