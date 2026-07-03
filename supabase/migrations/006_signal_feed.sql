-- Signal Feed module: AI-powered opportunity intelligence.
-- Adds the signal_feed table plus minimal provenance columns on leads so a
-- signal can be linked back to the CRM lead it was saved into.

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

-- Provenance columns on leads, populated when a signal is saved to CRM.
alter table leads add column if not exists signal_feed_id uuid references signal_feed(id) on delete set null;
alter table leads add column if not exists source_platform text;
alter table leads add column if not exists source_url text;
alter table leads add column if not exists discovery_date timestamptz;

create index if not exists leads_signal_feed_id_idx on leads(signal_feed_id);
