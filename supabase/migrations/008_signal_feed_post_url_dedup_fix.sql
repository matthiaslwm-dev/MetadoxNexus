-- Migration 007 created a *partial* unique index (WHERE post_url IS NOT
-- NULL). Postgres requires an ON CONFLICT clause to repeat a partial
-- index's predicate exactly to match against it, but Supabase's .upsert()
-- doesn't do that, so it failed with "no unique or exclusion constraint
-- matching the ON CONFLICT specification".
--
-- A plain (non-partial) unique index doesn't need this: Postgres already
-- treats multiple NULL values as distinct under a unique index/constraint,
-- so rows with no post_url were never going to conflict with each other
-- anyway. Replace the partial index with a plain one.
drop index if exists signal_feed_post_url_unique_idx;

create unique index if not exists signal_feed_post_url_unique_idx
  on signal_feed(post_url);
