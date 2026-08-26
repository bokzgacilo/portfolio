import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access. Neither key is NEXT_PUBLIC_, so the browser
 * never receives one -- every write goes through an API route that can
 * validate the payload first.
 *
 * The secret (service-role) key is preferred because it bypasses RLS, which
 * means the archive table needs no anon-writable policy. Without it we fall
 * back to the publishable key and the policies in
 * supabase/migrations/0001_image_compressions.sql have to be applied.
 */
const url = process.env.SUPABASE_PROJECT_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

/** Private bucket. Objects are reachable only through signed URLs. */
export const TOOL_BUCKET = "tools-upload";

/** Signed-URL lifetime for archived files: one year, in seconds. */
export const ARCHIVE_URL_TTL = 60 * 60 * 24 * 365;

/** Null when the env is not configured, so routes can 503 instead of throwing. */
export function createSupabaseServerClient() {
  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
