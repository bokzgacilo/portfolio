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
  faqs?: readonly {
    question: string;
    answer: string;
  }[];
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
    status: "live",
    runs: "server",
    faqs: [
      {
        question: "Are uploaded images stored?",
        answer:
          "No. The API reads the upload into memory, creates the PNG cutout, returns it, and does not write the original or output to disk.",
      },
      {
        question: "Why can the first request take longer?",
        answer:
          "The backend can sleep when it has been idle. The page pings the health endpoint when it loads, but the first real cutout may still wait while the service wakes.",
      },
      {
        question: "What image types work best?",
        answer:
          "JPG, PNG, and WebP files up to 10 MB are accepted. Clear subjects against a distinct background usually produce the cleanest edges.",
      },
      {
        question: "Can it handle hair, glass, or motion blur?",
        answer:
          "It can try, but those are the hardest cases for the segmentation model. High-contrast, well-lit images give the model much better edge information.",
      },
    ],
  },
  {
    slug: "image-compressor",
    category: "image",
    title: "Image Compressor",
    description: "Shrink JPG, PNG, and WebP files down to an exact target file size.",
    tags: ["Optimize", "JPG", "WebP"],
    status: "live",
    runs: "browser",
    faqs: [
      {
        question: "Does compression upload my image?",
        answer:
          "No. Choosing a file, testing output sizes, and generating the compressed image all happen in your browser.",
      },
      {
        question: "Why does the tool sometimes resize the image?",
        answer:
          "If encoder quality alone cannot hit the target size, the tool steps the resolution down and searches again for the best result under your limit.",
      },
      {
        question: "Which formats can I compress?",
        answer:
          "You can start from JPG, PNG, WebP, or AVIF and export to common web image formats supported by your browser.",
      },
      {
        question: "What target size should I use?",
        answer:
          "Use the smallest size that still looks good for where the image will appear. Thumbnails can be tiny; full-width portfolio images usually need more room.",
      },
    ],
  },
  {
    slug: "image-resizer",
    category: "image",
    title: "Image Resizer",
    description: "Set a white canvas size, then drag and zoom the image layer into place.",
    tags: ["Resize", "Crop", "Batch"],
    status: "live",
    runs: "browser",
    faqs: [
      {
        question: "Does resizing upload my image?",
        answer:
          "No. The image is loaded into your browser, positioned on the canvas locally, and exported from your device.",
      },
      {
        question: "What does the white canvas mean?",
        answer:
          "The output file is the exact width and height you choose. Any area not covered by the image layer exports as clean white space.",
      },
      {
        question: "Can I crop without changing the output size?",
        answer:
          "Yes. Set the canvas dimensions first, then drag or zoom the image layer until the visible crop is right.",
      },
      {
        question: "What is the maximum size?",
        answer:
          "The tool supports output dimensions up to 8000 pixels on either side, which keeps browser memory use reasonable.",
      },
    ],
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

export function getAdjacentTools(category: string, slug: string) {
  const index = tools.findIndex((tool) => tool.category === category && tool.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: tools[index - 1] ?? null,
    next: tools[index + 1] ?? null,
  };
}

export function categoryLabel(slug: string) {
  return categories.find((category) => category.slug === slug)?.label ?? slug;
}
