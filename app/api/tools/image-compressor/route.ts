import { NextResponse } from "next/server";

import {
  ARCHIVE_URL_TTL,
  TOOL_BUCKET,
  createSupabaseServerClient,
} from "@/lib/supabase-server";

/** Hard ceiling on what we will archive, independent of the bucket limit. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

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

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type || "unknown"}.` },
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

  if (!originalName || originalBytes === null || originalBytes <= 0) {
    return NextResponse.json(
      { error: "Missing original file details." },
      { status: 400 }
    );
  }

  /* Date-partitioned so the bucket stays browsable as the archive grows. */
  const now = new Date();
  const storagePath = [
    "image-compressor",
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${crypto.randomUUID()}.${extension}`,
  ].join("/");
  const archiveId = crypto.randomUUID();
  const archivedAt = now.toISOString();

  const upload = await supabase.storage
    .from(TOOL_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

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

  const insert = await supabase
    .from("image_compressions")
    .insert({
      id: archiveId,
      created_at: archivedAt,
      original_name: originalName,
      original_bytes: Math.round(originalBytes),
      compressed_bytes: file.size,
      target_bytes: numberField(form, "targetBytes"),
      output_format: file.type,
      quality: numberField(form, "quality"),
      width: numberField(form, "width"),
      height: numberField(form, "height"),
      duration_ms: numberField(form, "durationMs"),
      storage_path: storagePath,
      file_url: signed.data?.signedUrl ?? null,
    });

  if (insert.error) {
    /* Do not leave an orphan object behind when the row cannot be written. */
    await supabase.storage.from(TOOL_BUCKET).remove([storagePath]);
    return NextResponse.json(
      { error: `Could not record the conversion: ${insert.error.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    id: archiveId,
    archivedAt,
    storagePath,
  });
}
