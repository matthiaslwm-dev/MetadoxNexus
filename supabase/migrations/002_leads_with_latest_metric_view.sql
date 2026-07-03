-- Run this in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Flattens each lead's organisation name and most recent performance metric
-- (ranking / measure value) into one row, so the leads list can filter and
-- sort on them directly instead of computing "latest metric" in JS, and so
-- filtering by measure value is possible.

create or replace view leads_with_latest_metric
with (security_invoker = true) as
select
  l.id,
  l.agent_name,
  l.organisation_id,
  o.name as organisation_name,
  l.status,
  l.priority,
  l.next_follow_up,
  l.created_at,
  m.measure_name,
  m.ranking,
  m.measure_value
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
