-- Adds a location column to signal_feed so signals can be targeted/filtered
-- by geography (e.g. Singapore workforce campaigns).

alter table signal_feed add column if not exists location text;

create index if not exists signal_feed_location_idx on signal_feed(location);
