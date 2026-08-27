import { NextResponse } from "next/server";

import {
  ARCHIVE_URL_TTL,
  TOOL_BUCKET,
  createSupabaseServerClient,
} from "@/lib/supabase-server";

/** Hard ceiling on what we will archive, independent of the bucket limit. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** The cutout is always a transparent PNG -- nothing else belongs here. */
const OUTPUT_TYPE = "image/png";

/** What the FastAPI service accepts, echoed back to us as source_format. */
const SOURCE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/** Reads a form field as a finite number, or null when absent/unparseable. */
function numberField(form: FormData, name: string) {
  const raw = form.get(name);
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Archive storage is not configured on this deployment." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  if (file.type !== OUTPUT_TYPE) {
    return NextResponse.json(
      { error: `Cutouts are archived as PNG; got ${file.type || "unknown"}.` },
      { status: 415 }
    );
  }

  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File is empty or larger than the 25 MB archive limit." },
      { status: 413 }
    );
  }

  const originalName = (form.get("originalName") ?? "").toString().slice(0, 200);
  const originalBytes = numberField(form, "originalBytes");
  const sourceFormat = (form.get("sourceFormat") ?? "").toString();

  if (!originalName || originalBytes === null || originalBytes <= 0) {
    return NextResponse.json(
      { error: "Missing original file details." },
      { status: 400 }
    );
  }

  if (!SOURCE_TYPES.has(sourceFormat)) {
    return NextResponse.json(
      { error: `Unsupported source format: ${sourceFormat || "unknown"}.` },
      { status: 400 }
    );
  }

  /* Date-partitioned, and under its own prefix so the bucket stays browsable
     as both image tools write into it. */
  const now = new Date();
  const storagePath = [
    "background-remover",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${crypto.randomUUID()}.png`,
  ].join("/");
  const archiveId = crypto.randomUUID();
  const archivedAt = now.toISOString();

  const upload = await supabase.storage
    .from(TOOL_BUCKET)
    .upload(storagePath, file, { contentType: OUTPUT_TYPE, upsert: false });

  if (upload.error) {
    return NextResponse.json(
      { error: `Upload failed: ${upload.error.message}` },
      { status: 502 }
    );
  }

  /* Signed rather than public: the bucket is private, so this is the only way
     to hand back a working link. It expires -- storage_path is the durable
     pointer to re-sign from. */
  const signed = await supabase.storage
    .from(TOOL_BUCKET)
    .createSignedUrl(storagePath, ARCHIVE_URL_TTL);

  const insert = await supabase.from("background_removals").insert({
    id: archiveId,
    created_at: archivedAt,
    original_name: originalName,
    original_bytes: Math.round(originalBytes),
    cutout_bytes: file.size,
    source_format: sourceFormat,
    model: (form.get("model") ?? "").toString() || null,
    processing_ms: numberField(form, "processingMs"),
    original_width: numberField(form, "originalWidth"),
    original_height: numberField(form, "originalHeight"),
    width: numberField(form, "width"),
    height: numberField(form, "height"),
    downscaled: form.get("downscaled") === "1",
    storage_path: storagePath,
    file_url: signed.data?.signedUrl ?? null,
  });

  if (insert.error) {
    /* Do not leave an orphan object behind when the row cannot be written. */
    await supabase.storage.from(TOOL_BUCKET).remove([storagePath]);
    return NextResponse.json(
      { error: `Could not record the cutout: ${insert.error.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    id: archiveId,
    archivedAt,
    storagePath,
  });
}
