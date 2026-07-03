-- Lets the scheduled Signal Feed sync job upsert-and-skip already-seen posts
-- (same post_url) instead of creating duplicate rows on every run.
create unique index if not exists signal_feed_post_url_unique_idx
  on signal_feed(post_url)
  where post_url is not null;
