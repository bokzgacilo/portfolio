-- Archive + tracking for the /tools/image/image-compressor tool.
--
-- Run this once against the project (Supabase SQL editor, or
-- `supabase db push` if you have the CLI linked).

-- ---------------------------------------------------------------------------
-- Storage: private bucket. Compressed files stay retrievable through signed
-- URLs only, so an archived file is never publicly listable or guessable.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tools-upload',
  'tools-upload',
  false,
  52428800,
  array['image/webp', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Tracking table
-- ---------------------------------------------------------------------------
create table if not exists public.image_compressions (
  id uuid primary key default gen_random_uuid(),

  -- "Date of conversion".
  created_at timestamptz not null default now(),

  original_name  text   not null,
  original_bytes bigint not null check (original_bytes >= 0),
  compressed_bytes bigint not null check (compressed_bytes >= 0),
  -- What the visitor asked for, kept alongside what was achieved so a miss
  -- is visible in the data rather than inferred.
  target_bytes bigint,

  -- Stored rather than a view: one select answers "how much did we save".
  saved_bytes bigint generated always as (original_bytes - compressed_bytes) stored,
  reduction_pct numeric(5, 2) generated always as (
    round(
      ((original_bytes - compressed_bytes)::numeric / nullif(original_bytes, 0)) * 100,
      2
    )
  ) stored,

  output_format text not null,
  -- Encoder quality that landed the target (null for format-only passes).
  quality numeric(4, 3),
  width  integer,
  height integer,
  -- Wall-clock milliseconds the browser spent compressing.
  duration_ms integer,

  -- Durable pointer. file_url is a signed URL and will expire; storage_path
  -- is what you re-sign from.
  storage_path text not null unique,
  file_url     text
);

create index if not exists image_compressions_created_at_idx
  on public.image_compressions (created_at desc);

alter table public.image_compressions enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.image_compressions to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Policies
--
-- With SUPABASE_SECRET_KEY set, the API route uses the service role, RLS is
-- bypassed, and nothing below is required -- that is the recommended setup.
--
-- This app currently uses SUPABASE_PUBLISHABLE_KEY from the server route, so
-- these insert-only policies are required. Rows and files can be written but
-- never read, listed, updated, or deleted with that key.
-- ---------------------------------------------------------------------------

drop policy if exists "anon inserts compression records" on public.image_compressions;
create policy "anon inserts compression records"
  on public.image_compressions for insert to anon, authenticated with check (true);

drop policy if exists "anon uploads tool files" on storage.objects;
create policy "anon uploads tool files"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'tools-upload');
