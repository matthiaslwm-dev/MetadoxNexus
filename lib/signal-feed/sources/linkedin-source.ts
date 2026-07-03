import type { SignalSource } from "@/lib/signal-feed/signal-source";
import type { RawSignalInput } from "@/lib/signal-feed/types";
import { getApifyConfig, runApifyActor } from "@/lib/signal-feed/sources/apify-client";

// Real (Phase 2) implementation of SignalSource, backed by an Apify actor
// that scrapes public LinkedIn posts. NOT configured out of the box - see
// .env.local.example for the env vars needed (APIFY_API_TOKEN,
// APIFY_LINKEDIN_ACTOR_ID, optionally APIFY_LINKEDIN_ACTOR_INPUT).
//
// Scraping LinkedIn violates its Terms of Service. Using this in production
// carries real account-ban and legal risk - this exists because the project
// owner explicitly requested it, not as a general recommendation.
//
// Field mapping below matches benjarapi/linkedin-post-search's documented
// output shape (nested `author` and `posted_at` objects), e.g.:
//   { text, url, posted_at: { date }, author: { first_name, last_name,
//     username, profile_url, profile_picture } }
// If you switch actors and the shape differs, adjust this function only -
// nothing else in the app needs to change (this is the whole point of the
// SignalSource seam). `firstDefined` also checks a handful of common flat
// alternative key names so minor schema variants still work.
function firstDefined(item: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mapItem(item: Record<string, unknown>): RawSignalInput | null {
  const author = asRecord(item.author);
  const postedAt = asRecord(item.posted_at);

  const post_text = firstDefined(item, ["text", "postText", "content", "commentary"]);

  const firstName = firstDefined(author, ["first_name"]);
  const lastName = firstDefined(author, ["last_name"]);
  const display_name =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstDefined(item, ["authorName", "actorName", "name", "authorFullName"]);

  if (!post_text || !display_name) return null;

  return {
    platform: "LinkedIn",
    display_name,
    username:
      firstDefined(author, ["username"]) ??
      firstDefined(item, ["authorUsername", "username", "actorUsername"]),
    avatar_url: firstDefined(author, ["profile_picture"]) ?? firstDefined(item, ["avatarUrl"]),
    profile_url:
      firstDefined(author, ["profile_url"]) ??
      firstDefined(item, ["authorProfileUrl", "profileUrl", "actorProfileUrl"]),
    post_url: firstDefined(item, ["url", "postUrl", "linkedinUrl"]),
    post_text,
    post_date:
      firstDefined(postedAt, ["date"]) ??
      firstDefined(item, ["postedAt", "publishedAt", "date", "postDate"]),
  };
}

export const linkedInSource: SignalSource = {
  platform: "LinkedIn",

  async fetchSignals(params) {
    const config = getApifyConfig("APIFY_LINKEDIN_ACTOR_ID");
    if (!config) {
      console.warn(
        "[linkedInSource] Not configured - set APIFY_API_TOKEN and APIFY_LINKEDIN_ACTOR_ID to enable."
      );
      return [];
    }

    let actorInput: Record<string, unknown> = {};
    const rawInput = process.env.APIFY_LINKEDIN_ACTOR_INPUT;
    if (rawInput) {
      try {
        actorInput = JSON.parse(rawInput);
      } catch {
        console.warn("[linkedInSource] APIFY_LINKEDIN_ACTOR_INPUT is not valid JSON - ignoring.");
      }
    }
    if (params?.limit) {
      // benjarapi/linkedin-post-search's own param name for result count.
      // Adjust this key if you switch to a different actor.
      actorInput = { ...actorInput, maxPosts: params.limit };
    }

    const items = await runApifyActor<Record<string, unknown>>(config, actorInput);
    return items.map(mapItem).filter((signal): signal is RawSignalInput => signal !== null);
  },
};
