-- Adds a lightweight "agents" lookup table so leads can be tagged to an
-- agent for filtering/grouping. Agents are managed directly in Supabase
-- (no in-app UI) — see AGENTS.md discussion.

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table agents enable row level security;

drop policy if exists "authenticated full access" on agents;
create policy "authenticated full access" on agents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table leads add column if not exists agent_id uuid references agents(id) on delete set null;

create index if not exists leads_agent_id_idx on leads(agent_id);

-- create-or-replace can't insert columns in the middle of an existing view's
-- column list (only append at the end), so drop and recreate instead.
drop view if exists leads_with_latest_metric;

create view leads_with_latest_metric
with (security_invoker = true) as
select
  l.id,
  l.name,
  l.organisation_id,
  o.name as organisation_name,
  l.agent_id,
  a.name as agent_name,
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
left join agents a on a.id = l.agent_id
left join lateral (
  select measure_name, ranking, measure_value
  from lead_performance_metrics
  where lead_id = l.id
  order by imported_at desc
  limit 1
) m on true;

grant select on leads_with_latest_metric to authenticated;
