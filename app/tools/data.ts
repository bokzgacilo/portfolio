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
  { slug: "audio", label: "Audio" },
  { slug: "converter", label: "Converter" },
  { slug: "data", label: "Data" },
  { slug: "text", label: "Text" },
  { slug: "dev", label: "Developer" },
] as const;

export const tools: readonly Tool[] = [
  {
    slug: "audio-clipper",
    category: "audio",
    title: "Audio Clipper",
    description: "Import audio, select a section on the waveform, and save your clip as WAV.",
    tags: ["Audio", "Trim", "WAV"],
    status: "live",
    runs: "browser",
    faqs: [
      { question: "Is my audio uploaded?", answer: "No. Decoding, waveform rendering, playback, and clipping happen on your device. Your original file stays unchanged." },
      { question: "Which audio files can I import?", answer: "Try MP3, WAV, M4A, AAC, OGG, FLAC, or WebM. Support depends on your browser and the codec inside the file. The file limit is 100 MB and decoded audio is limited to 30 minutes." },
      { question: "What gets saved?", answer: "Only the section between the start and end handles is saved, as a 16-bit PCM WAV file. WAV files can be larger than compressed originals. Channel count and the browser's decoded sample rate are preserved." },
      { question: "Can I make more than one clip?", answer: "Yes. Download a selection, then adjust the handles and download again. Reset selection restores the full track." },
    ],
  },
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
    slug: "image-extension-converter",
    category: "image",
    title: "Image Extension Converter",
    description: "Upload one original image, select PNG, JPEG, or WebP, and convert common formats including HEIC.",
    tags: ["HEIC", "PNG", "WebP"],
    status: "live",
    runs: "browser",
    faqs: [
      {
        question: "Does the converter upload my image?",
        answer:
          "JPG, PNG, WebP, and AVIF usually convert in your browser. HEIC and HEIF are uploaded to the backend because browsers cannot reliably decode them.",
      },
      {
        question: "Which target extensions can I choose?",
        answer:
          "You can export PNG, JPEG, or WebP. JPEG does not support transparency, so transparent pixels are flattened onto white.",
      },
      {
        question: "Can it convert iPhone HEIC photos?",
        answer:
          "Yes. HEIC and HEIF files are sent to the backend, decoded with Pillow, and returned as your selected target format.",
      },
      {
        question: "Will the image dimensions change?",
        answer:
          "No. The converter keeps the original pixel width and height while changing the encoded file format.",
      },
    ],
  },
  {
    slug: "pdf-to-image",
    category: "converter",
    title: "PDF to Image",
    description: "Export each page of a PDF as a PNG or JPG, then download all pages in one ZIP.",
    tags: ["PDF", "PNG", "ZIP"],
    status: "live",
    runs: "browser",
    faqs: [
      {
        question: "Does the PDF get uploaded?",
        answer:
          "No. The PDF is read, rendered, and zipped in your browser. The file does not leave your device.",
      },
      {
        question: "How are pages named?",
        answer:
          "Each image uses the original PDF name plus a page number, such as document-page-01.png.",
      },
      {
        question: "Should I choose PNG or JPG?",
        answer:
          "PNG is best for text, forms, and screenshots. JPG is usually smaller for scans or photo-heavy PDFs.",
      },
      {
        question: "What DPI should I use?",
        answer:
          "Use 144 DPI for a good balance. Use 300 DPI when you need sharper images and do not mind a larger ZIP.",
      },
    ],
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
    title: "JSON Formatter & Prettier",
    description: "Format, minify, validate, copy, download, and inspect JSON in a collapsible tree.",
    tags: ["JSON", "Tree", "Pretty"],
    status: "live",
    runs: "browser",
    faqs: [
      {
        question: "Does the JSON get uploaded?",
        answer:
          "No. Parsing, formatting, minifying, tree rendering, copying, and downloading all happen in your browser.",
      },
      {
        question: "Can it show nested JSON?",
        answer:
          "Yes. Objects and arrays render as an expandable tree, and you can collapse or expand the structure while inspecting it.",
      },
      {
        question: "What does format do?",
        answer:
          "Prettify parses the JSON and rewrites it with consistent two-space indentation so it is easier to read.",
      },
      {
        question: "What does minify do?",
        answer:
          "Minify removes whitespace from valid JSON while keeping the data exactly the same.",
      },
    ],
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
