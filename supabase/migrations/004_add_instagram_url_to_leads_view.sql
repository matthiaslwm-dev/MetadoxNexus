-- Run this in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Exposes leads.instagram_url through leads_with_latest_metric so the
-- leads list can render an "Open Instagram" button without a per-row fetch.
--
-- Postgres only allows CREATE OR REPLACE VIEW to append columns, not
-- insert them in the middle of the existing column list, so instagram_url
-- is added at the end here (column order doesn't matter to the app, which
-- selects by name).

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
