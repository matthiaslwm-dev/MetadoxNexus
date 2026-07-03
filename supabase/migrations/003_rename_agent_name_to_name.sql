-- Run this in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Renames leads.agent_name to leads.name. Renaming the underlying table
-- column does NOT rename the leads_with_latest_metric view's exposed
-- column (Postgres views keep their own column names), so that has to be
-- renamed separately.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'leads' and column_name = 'agent_name'
  ) then
    alter table leads rename column agent_name to name;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'leads_with_latest_metric' and column_name = 'agent_name'
  ) then
    alter view leads_with_latest_metric rename column agent_name to name;
  end if;
end $$;
