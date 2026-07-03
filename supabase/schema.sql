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
  l.instagram_url
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
