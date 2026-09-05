-- Shared usage counters. Apply in the Supabase SQL editor before deploying.
-- Stores random browser identifiers and action metadata, never file contents,
-- filenames, emails, or IP addresses. Raw events are not publicly readable.
begin;

create table if not exists public.statistic_resources (
  resource_key text primary key,
  kind text not null check (kind in ('tool', 'blog'))
);
create table if not exists public.resource_events (
  event_id uuid primary key,
  resource_key text not null references public.statistic_resources(resource_key),
  visitor_id uuid not null,
  event_type text not null check (event_type in ('visit', 'complete', 'open')),
  created_at timestamptz not null default now()
);
create unique index if not exists resource_unique_visit
  on public.resource_events(resource_key, visitor_id) where event_type = 'visit';
create index if not exists resource_events_resource_idx on public.resource_events(resource_key, visitor_id);
create index if not exists resource_events_rate_idx on public.resource_events(visitor_id, created_at);

alter table public.statistic_resources enable row level security;
alter table public.resource_events enable row level security;
revoke all on public.statistic_resources, public.resource_events from anon, authenticated;

insert into public.statistic_resources(resource_key, kind) values
  ('tool/audio/audio-clipper', 'tool'),
  ('tool/image/background-remover', 'tool'),
  ('tool/image/image-compressor', 'tool'),
  ('tool/image/image-resizer', 'tool'),
  ('tool/image/image-extension-converter', 'tool'),
  ('tool/converter/pdf-to-image', 'tool'),
  ('tool/data/json-formatter', 'tool'),
  ('blog/integrating-salesforce-crm-leads-with-a-next-js-page-router-app-7b29bac20ea9', 'blog')
on conflict (resource_key) do nothing;

create or replace function public.record_resource_event(
  p_resource text, p_visitor uuid, p_event_id uuid, p_event text
) returns void language plpgsql security definer set search_path = '' as $$
declare resource_kind text;
begin
  select kind into resource_kind from public.statistic_resources where resource_key = p_resource;
  if resource_kind is null or p_visitor is null or p_event_id is null or p_event is null
    or (resource_kind = 'tool' and p_event not in ('visit', 'complete'))
    or (resource_kind = 'blog' and p_event <> 'open') then
    raise exception 'Invalid event';
  end if;
  -- Serialize requests from one visitor so retries and simultaneous tabs cannot
  -- race the daily cap. This is basic abuse resistance, not verified analytics.
  perform pg_advisory_xact_lock(hashtextextended(p_visitor::text, 0));
  if exists(select 1 from public.resource_events where event_id = p_event_id) then return; end if;
  if p_event = 'visit' and exists (
    select 1 from public.resource_events where resource_key = p_resource and visitor_id = p_visitor and event_type = 'visit'
  ) then return; end if;
  if (select count(*) from public.resource_events where visitor_id = p_visitor and created_at >= now() - interval '1 day') >= 1000 then
    raise exception 'Event limit reached';
  end if;
  insert into public.resource_events(event_id, resource_key, visitor_id, event_type)
    values(p_event_id, p_resource, p_visitor, p_event) on conflict do nothing;
end;
$$;

create or replace function public.read_resource_statistics()
returns table(resource_key text, visitors bigint, completed bigint, opens bigint)
language sql stable security definer set search_path = '' as $$
  select r.resource_key, count(distinct e.visitor_id),
    count(*) filter(where e.event_type = 'complete'),
    count(*) filter(where e.event_type = 'open')
  from public.statistic_resources r
  left join public.resource_events e on e.resource_key = r.resource_key
  group by r.resource_key;
$$;

revoke all on function public.record_resource_event(text, uuid, uuid, text) from public;
revoke all on function public.read_resource_statistics() from public;
-- Compatible with the existing server-side publishable key. These narrowly
-- scoped functions are the only public surface; table access remains denied.
grant execute on function public.record_resource_event(text, uuid, uuid, text) to anon, authenticated, service_role;
grant execute on function public.read_resource_statistics() to anon, authenticated, service_role;
commit;
