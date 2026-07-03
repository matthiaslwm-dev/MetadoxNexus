import type { SignalSource } from "@/lib/signal-feed/signal-source";
import type { RawSignalInput } from "@/lib/signal-feed/types";
import { getApifyConfig, runApifyActor } from "@/lib/signal-feed/sources/apify-client";

// Real (Phase 2) implementation of SignalSource, backed by Apify's official
// `apify/instagram-scraper` actor (maintained by Apify itself, not a third
// party - chosen after two third-party LinkedIn actors failed outright).
// NOT configured out of the box - see .env.local.example for the env vars
// needed (APIFY_API_TOKEN, APIFY_INSTAGRAM_ACTOR_ID, optionally
// APIFY_INSTAGRAM_ACTOR_INPUT).
//
// Scraping Instagram violates its Terms of Service. Using this in
// production carries real account-ban and legal risk - this exists because
// the project owner explicitly requested it, not as a general
// recommendation.
//
// Instagram has no free-text post search like LinkedIn - discovery is by
// hashtag. The actor's `search`/`searchType: "hashtag"` mode routes through
// a Google site-search to find hashtag pages first, which gets blocked in
// practice (confirmed by testing) - use `directUrls` pointing straight at
// an Instagram hashtag page instead (e.g.
// "https://www.instagram.com/explore/tags/burnout/"), which hits Instagram
// directly and has been confirmed working. Configure via
// APIFY_INSTAGRAM_ACTOR_INPUT.
//
// Field mapping below matches apify/instagram-scraper's documented output
// shape: { caption, url, timestamp, ownerUsername, ownerFullName }.
function firstDefined(item: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function mapItem(item: Record<string, unknown>): RawSignalInput | null {
  const post_text = firstDefined(item, ["caption", "text"]);
  const username = firstDefined(item, ["ownerUsername", "username"]);

  if (!post_text || !username) return null;

  return {
    platform: "Instagram",
    display_name: firstDefined(item, ["ownerFullName", "authorFullName"]) ?? username,
    username,
    profile_url: `https://www.instagram.com/${username}/`,
    post_url: firstDefined(item, ["url", "postUrl"]),
    post_text,
    post_date: firstDefined(item, ["timestamp", "postedAt", "date"]),
  };
}

export const instagramSource: SignalSource = {
  platform: "Instagram",

  async fetchSignals(params) {
    const config = getApifyConfig("APIFY_INSTAGRAM_ACTOR_ID");
    if (!config) {
      console.warn(
        "[instagramSource] Not configured - set APIFY_API_TOKEN and APIFY_INSTAGRAM_ACTOR_ID to enable."
      );
      return [];
    }

    let actorInput: Record<string, unknown> = { resultsType: "posts" };
    const rawInput = process.env.APIFY_INSTAGRAM_ACTOR_INPUT;
    if (rawInput) {
      try {
        actorInput = { ...actorInput, ...JSON.parse(rawInput) };
      } catch {
        console.warn(
          "[instagramSource] APIFY_INSTAGRAM_ACTOR_INPUT is not valid JSON - ignoring."
        );
      }
    }
    if (params?.limit) {
      // apify/instagram-scraper's own param name for posts per hashtag.
      actorInput = { ...actorInput, resultsLimit: params.limit };
    }

    const items = await runApifyActor<Record<string, unknown>>(config, actorInput);
    return items.map(mapItem).filter((signal): signal is RawSignalInput => signal !== null);
  },
};
