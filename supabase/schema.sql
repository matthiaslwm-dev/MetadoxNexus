-- Metadox Nexus schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organisation_id uuid references organisations(id),
  email text,
  phone text,
  linkedin_url text,
  facebook_url text,
  instagram_url text,
  website_url text,
  status text default 'New',
  priority text default 'Medium',
  notes text,
  next_follow_up date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lead_performance_metrics (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  measure_name text,
  ranking integer,
  measure_value numeric,
  imported_at timestamptz default now()
);

create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  activity_type text not null,
  content text,
  created_at timestamptz default now()
);

create index if not exists leads_organisation_id_idx on leads(organisation_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_priority_idx on leads(priority);
create index if not exists lead_performance_metrics_lead_id_idx on lead_performance_metrics(lead_id);
create index if not exists lead_activities_lead_id_idx on lead_activities(lead_id);

-- Keep leads.updated_at current on every update
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row
  execute function set_updated_at();

-- Row Level Security: any authenticated user can read/write (single-tenant MVP)
alter table organisations enable row level security;
alter table leads enable row level security;
alter table lead_performance_metrics enable row level security;
alter table lead_activities enable row level security;

drop policy if exists "authenticated full access" on organisations;
create policy "authenticated full access" on organisations
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on leads;
create policy "authenticated full access" on leads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on lead_performance_metrics;
create policy "authenticated full access" on lead_performance_metrics
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on lead_activities;
create policy "authenticated full access" on lead_activities
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Flattens each lead's organisation name and most recent performance metric
-- (ranking / measure value) into one row, so the leads list can filter and
-- sort on them directly instead of computing "latest metric" in JS.
create or replace view leads_with_latest_metric
with (security_invoker = true) as
select
  l.id,
  l.name,
  l.organisation_id,
  o.name as organisation_name,
  l.status,
  l.priority,
  l.next_follow_up,
  l.created_at,
  m.measure_name,
  m.ranking,
  m.measure_value,
  l.instagram_url,
  l.linkedin_url
from leads l
left join organisations o on o.id = l.organisation_id
left join lateral (
  select measure_name, ranking, measure_value
  from lead_performance_metrics
  where lead_id = l.id
  order by imported_at desc
  limit 1
) m on true;

grant select on leads_with_latest_metric to authenticated;

-- Signal Feed module: AI-powered opportunity intelligence (see
-- supabase/migrations/006_signal_feed.sql).
create table if not exists signal_feed (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  display_name text not null,
  username text,
  avatar_url text,
  profile_url text,
  post_url text,
  post_text text not null,
  post_date timestamptz,
  pain_summary text,
  pain_categories text[] not null default '{}',
  lead_score integer not null default 0 check (lead_score between 0 and 100),
  intent_score integer not null default 0 check (intent_score between 0 and 100),
  confidence_level text not null default 'Low',
  opportunity_level text not null default 'Low',
  priority text not null default 'Cold',
  opportunity_type text,
  why_this_is_a_signal text,
  potential_needs text,
  ai_reasoning text,
  suggested_openers text[] not null default '{}',
  recommended_action text,
  status text not null default 'New',
  saved_lead_id uuid references leads(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists signal_feed_platform_idx on signal_feed(platform);
create index if not exists signal_feed_status_idx on signal_feed(status);
create index if not exists signal_feed_priority_idx on signal_feed(priority);
create index if not exists signal_feed_lead_score_idx on signal_feed(lead_score);
create index if not exists signal_feed_created_at_idx on signal_feed(created_at);

drop trigger if exists signal_feed_set_updated_at on signal_feed;
create trigger signal_feed_set_updated_at
  before update on signal_feed
  for each row
  execute function set_updated_at();

alter table signal_feed enable row level security;

drop policy if exists "authenticated full access" on signal_feed;
create policy "authenticated full access" on signal_feed
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table leads add column if not exists signal_feed_id uuid references signal_feed(id) on delete set null;
alter table leads add column if not exists source_platform text;
alter table leads add column if not exists source_url text;
alter table leads add column if not exists discovery_date timestamptz;

create index if not exists leads_signal_feed_id_idx on leads(signal_feed_id);

-- Lets the scheduled Signal Feed sync job upsert-and-skip already-seen posts
-- (see supabase/migrations/007_signal_feed_post_url_dedup.sql and 008's
-- fix - must be a plain, non-partial unique index for Supabase's .upsert()
-- ON CONFLICT resolution to find it; Postgres already treats multiple NULLs
-- as non-conflicting under a plain unique index).
create unique index if not exists signal_feed_post_url_unique_idx
  on signal_feed(post_url);
