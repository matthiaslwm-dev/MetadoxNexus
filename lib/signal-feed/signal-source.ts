import type { RawSignalInput } from "@/lib/signal-feed/types";

/**
 * Extensibility seam for future real data ingestion (LinkedIn/Facebook/
 * Instagram scraping, Apify actors, Reddit/X APIs, RSS, job boards, etc).
 * Phase 1 ships no implementations - only this interface - so the
 * repository/service layer above has a stable contract to program against
 * later.
 *
 * Future implementations (not built in Phase 1):
 *   - LinkedInSource   implements SignalSource
 *   - FacebookSource   implements SignalSource
 *   - InstagramSource  implements SignalSource
 *   - ApifySource      implements SignalSource (generic actor-based wrapper)
 */
export type SignalSource = {
  platform: string;
  fetchSignals(params?: { since?: string; limit?: number }): Promise<RawSignalInput[]>;
};
