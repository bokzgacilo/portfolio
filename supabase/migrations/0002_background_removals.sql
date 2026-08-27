-- Archive + tracking for the /tools/image/background-remover tool.
--
-- Run this once against the project (Supabase SQL editor, or
-- `supabase db push` if you have the CLI linked).
--
-- Depends on 0001_image_compressions.sql, which creates the private
-- 'tools-upload' bucket and the anon insert policy on storage.objects that this
-- tool reuses. PNG is already in that bucket's allowed_mime_types, so nothing
-- about the bucket needs to change here.

-- ---------------------------------------------------------------------------
-- Tracking table
--
-- One row per downloaded cutout. The masking itself happens on the FastAPI
-- service, which keeps nothing -- a row here exists only because the visitor
-- pressed Download.
-- ---------------------------------------------------------------------------
create table if not exists public.background_removals (
  id uuid primary key default gen_random_uuid(),

  -- "Date of conversion".
  created_at timestamptz not null default now(),

  original_name  text   not null,
  original_bytes bigint not null check (original_bytes >= 0),
  cutout_bytes   bigint not null check (cutout_bytes >= 0),
  -- What was uploaded (image/jpeg, image/png, image/webp). The output is
  -- always PNG, so there is no column for it.
  source_format  text   not null,

  -- Which segmentation model produced the mask, so a change in model quality
  -- is attributable after the fact.
  model text,
  -- Server-side inference milliseconds, as reported by the API.
  processing_ms integer,

  -- Dimensions as uploaded and as returned. They differ when the API scaled
  -- the input down to its working ceiling.
  original_width  integer,
  original_height integer,
  width           integer,
  height          integer,
  downscaled      boolean not null default false,

  -- A transparent PNG is routinely larger than the JPG it came from, so this
  -- is signed on purpose: negative means the cutout grew.
  size_delta_bytes bigint generated always as (original_bytes - cutout_bytes) stored,

  -- Durable pointer. file_url is a signed URL and will expire; storage_path
  -- is what you re-sign from.
  storage_path text not null unique,
  file_url     text
);

create index if not exists background_removals_created_at_idx
  on public.background_removals (created_at desc);

alter table public.background_removals enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.background_removals to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Policies
--
-- With SUPABASE_SECRET_KEY set, the API route uses the service role, RLS is
-- bypassed, and nothing below is required -- that is the recommended setup.
--
-- This app currently uses SUPABASE_PUBLISHABLE_KEY from the server route, so
-- this insert-only policy is required. Rows can be written but never read,
-- updated, or deleted with that key.
--
-- Consequence worth knowing: when the row insert fails, the API route tries to
-- delete the object it just uploaded, and that delete is refused under this key
-- -- so a failed archive can leave an orphan file in the bucket. Setting
-- SUPABASE_SECRET_KEY makes the cleanup work. Granting anon a delete policy
-- would too, but it would also let anyone holding the publishable key delete
-- archived files, so that is deliberately not done here.
-- ---------------------------------------------------------------------------
drop policy if exists "anon inserts background removal records" on public.background_removals;
create policy "anon inserts background removal records"
  on public.background_removals for insert to anon, authenticated with check (true);
