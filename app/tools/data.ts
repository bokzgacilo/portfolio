/**
 * Placeholder tool registry for the /tools hub. Nothing is built yet, so every
 * entry is status "soon" -- flip one to "live" as its route lands and the hub
 * picks it up with no other change.
 */
export type ToolStatus = "live" | "soon";

export type Tool = {
  slug: string;
  category: (typeof categories)[number]["slug"];
  title: string;
  description: string;
  tags: readonly string[];
  status: ToolStatus;
  /** Where the work happens. Shown on the hub so intent is obvious up front. */
  runs: "browser" | "server";
};

export const categories = [
  { slug: "image", label: "Image" },
  { slug: "converter", label: "Converter" },
  { slug: "data", label: "Data" },
  { slug: "text", label: "Text" },
  { slug: "dev", label: "Developer" },
] as const;

export const tools: readonly Tool[] = [
  {
    slug: "background-remover",
    category: "image",
    title: "Background Remover",
    description: "Strip the background from a photo and download a transparent PNG.",
    tags: ["PNG", "Cutout", "AI"],
    status: "soon",
    runs: "server",
  },
  {
    slug: "image-compressor",
    category: "image",
    title: "Image Compressor",
    description: "Shrink JPG, PNG, and WebP files down to an exact target file size.",
    tags: ["Optimize", "JPG", "WebP"],
    status: "live",
    runs: "browser",
  },
  {
    slug: "image-resizer",
    category: "image",
    title: "Image Resizer",
    description: "Resize or crop to exact pixel dimensions and common aspect ratios.",
    tags: ["Resize", "Crop", "Batch"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "jpg-to-png",
    category: "converter",
    title: "JPG to PNG",
    description: "Convert JPG photos to lossless PNG right in your browser.",
    tags: ["JPG", "PNG", "Lossless"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "png-to-webp",
    category: "converter",
    title: "PNG to WebP",
    description: "Trade PNG for WebP and cut image weight on the pages you ship.",
    tags: ["PNG", "WebP", "Web"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "heic-to-jpg",
    category: "converter",
    title: "HEIC to JPG",
    description: "Turn iPhone HEIC photos into JPGs anything can open.",
    tags: ["HEIC", "JPG", "iPhone"],
    status: "soon",
    runs: "server",
  },
  {
    slug: "pdf-to-image",
    category: "converter",
    title: "PDF to Image",
    description: "Export each page of a PDF as a PNG or JPG at your chosen DPI.",
    tags: ["PDF", "PNG", "Pages"],
    status: "soon",
    runs: "server",
  },
  {
    slug: "csv-to-json",
    category: "data",
    title: "CSV to JSON",
    description: "Paste or upload a CSV and get clean, typed JSON back.",
    tags: ["CSV", "JSON", "ETL"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "excel-to-csv",
    category: "data",
    title: "Excel to CSV",
    description: "Pull any sheet out of an XLSX workbook as plain CSV.",
    tags: ["Excel", "XLSX", "CSV"],
    status: "soon",
    runs: "server",
  },
  {
    slug: "json-formatter",
    category: "data",
    title: "JSON Formatter",
    description: "Format, minify, and validate JSON with readable error positions.",
    tags: ["JSON", "Validate", "Pretty"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "case-converter",
    category: "text",
    title: "Case Converter",
    description: "Switch text between camel, snake, kebab, title, and sentence case.",
    tags: ["Case", "Naming", "Text"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "word-counter",
    category: "text",
    title: "Word Counter",
    description: "Count words, characters, sentences, and reading time as you type.",
    tags: ["Count", "Reading", "SEO"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "slug-generator",
    category: "text",
    title: "Slug Generator",
    description: "Turn any headline into a clean, URL-safe slug.",
    tags: ["Slug", "URL", "SEO"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "qr-generator",
    category: "dev",
    title: "QR Code Generator",
    description: "Generate a QR code for a link, then download it as SVG or PNG.",
    tags: ["QR", "SVG", "PNG"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "uuid-generator",
    category: "dev",
    title: "UUID Generator",
    description: "Generate v4 and v7 UUIDs in bulk, ready to copy.",
    tags: ["UUID", "v4", "v7"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "base64-encoder",
    category: "dev",
    title: "Base64 Encoder",
    description: "Encode and decode text or files to and from Base64.",
    tags: ["Base64", "Encode", "Files"],
    status: "soon",
    runs: "browser",
  },
  {
    slug: "hash-generator",
    category: "dev",
    title: "Hash Generator",
    description: "Produce MD5, SHA-1, SHA-256, and SHA-512 digests from text or a file.",
    tags: ["Hash", "SHA-256", "MD5"],
    status: "soon",
    runs: "browser",
  },
];

export function toolHref(tool: Tool) {
  return `/tools/${tool.category}/${tool.slug}`;
}

export function getTool(category: string, slug: string) {
  return tools.find((tool) => tool.category === category && tool.slug === slug);
}

export function categoryLabel(slug: string) {
  return categories.find((category) => category.slug === slug)?.label ?? slug;
}
