import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SignalFeed, SignalFeedStatus } from "@/lib/supabase/types";
import { LEAD_SCORE_BANDS } from "@/lib/signal-feed/scoring-config";
import { toDateKey } from "@/lib/calendar";
import type { RawSignalInput, ScoredSignal } from "@/lib/signal-feed/types";

export type SignalFeedListFilters = {
  q?: string;
  location?: string;
  platform?: string;
  painCategory?: string;
  opportunityType?: string;
  priority?: string;
  minLeadScore?: number;
  maxLeadScore?: number;
  minIntentScore?: number;
  maxIntentScore?: number;
  confidence?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "score" | "newest" | "oldest";
  page: number;
  pageSize: number;
};

export type SignalFeedStats = {
  todaysSignals: number;
  highIntent: number;
  mediumIntent: number;
  lowIntent: number;
  hotOpportunities: number;
  savedToday: number;
  pendingReview: number;
};

// Repository layer: the only place that talks to the `signal_feed` table
// directly. Instantiated per-request with a request-scoped Supabase client
// (never a module-level singleton, which would leak across requests).
export class SignalFeedRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters: SignalFeedListFilters) {
    let q = query;
    if (filters.q) {
      q = q.or(
        `display_name.ilike.%${filters.q}%,username.ilike.%${filters.q}%,post_text.ilike.%${filters.q}%`
      );
    }
    if (filters.location) q = q.ilike("location", `%${filters.location}%`);
    if (filters.platform) q = q.eq("platform", filters.platform);
    if (filters.painCategory) q = q.contains("pain_categories", [filters.painCategory]);
    if (filters.opportunityType) q = q.eq("opportunity_type", filters.opportunityType);
    if (filters.priority) q = q.eq("priority", filters.priority);
    if (filters.minLeadScore !== undefined) q = q.gte("lead_score", filters.minLeadScore);
    if (filters.maxLeadScore !== undefined) q = q.lte("lead_score", filters.maxLeadScore);
    if (filters.minIntentScore !== undefined) q = q.gte("intent_score", filters.minIntentScore);
    if (filters.maxIntentScore !== undefined) q = q.lte("intent_score", filters.maxIntentScore);
    if (filters.confidence) q = q.eq("confidence_level", filters.confidence);
    if (filters.status) q = q.eq("status", filters.status);
    if (filters.dateFrom) q = q.gte("created_at", filters.dateFrom);
    if (filters.dateTo) q = q.lte("created_at", filters.dateTo);
    return q;
  }

  async list(filters: SignalFeedListFilters): Promise<{ rows: SignalFeed[]; count: number }> {
    let query = this.supabase.from("signal_feed").select("*", { count: "exact" });
    query = this.applyFilters(query, filters);

    if (filters.sort === "score") {
      query = query.order("lead_score", { ascending: false });
    } else if (filters.sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const from = (filters.page - 1) * filters.pageSize;
    const { data, error, count } = await query.range(from, from + filters.pageSize - 1);

    if (error) throw new Error(error.message);

    return { rows: (data ?? []) as SignalFeed[], count: count ?? 0 };
  }

  async getById(id: string): Promise<SignalFeed | null> {
    const { data, error } = await this.supabase
      .from("signal_feed")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as SignalFeed | null) ?? null;
  }

  async create(input: RawSignalInput & ScoredSignal): Promise<SignalFeed> {
    const { data, error } = await this.supabase
      .from("signal_feed")
      .insert(input)
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create signal.");
    return data as SignalFeed;
  }

  async createMany(inputs: (RawSignalInput & ScoredSignal)[]): Promise<SignalFeed[]> {
    if (inputs.length === 0) return [];
    const { data, error } = await this.supabase
      .from("signal_feed")
      .insert(inputs)
      .select("*");
    if (error) throw new Error(error.message);
    return (data ?? []) as SignalFeed[];
  }

  // Used by the scheduled sync job: inserts rows whose post_url hasn't been
  // seen before and silently skips ones that have (relies on the unique
  // partial index on signal_feed(post_url) - see migration 007). Rows with
  // no post_url are always inserted, since there's nothing to dedupe against.
  async upsertManySkippingDuplicates(
    inputs: (RawSignalInput & ScoredSignal)[]
  ): Promise<SignalFeed[]> {
    if (inputs.length === 0) return [];

    const withUrl = inputs.filter((i) => i.post_url);
    const withoutUrl = inputs.filter((i) => !i.post_url);

    const results: SignalFeed[] = [];

    if (withUrl.length > 0) {
      const { data, error } = await this.supabase
        .from("signal_feed")
        .upsert(withUrl, { onConflict: "post_url", ignoreDuplicates: true })
        .select("*");
      if (error) throw new Error(error.message);
      results.push(...((data ?? []) as SignalFeed[]));
    }

    if (withoutUrl.length > 0) {
      results.push(...(await this.createMany(withoutUrl)));
    }

    return results;
  }

  async updateStatus(id: string, status: SignalFeedStatus): Promise<void> {
    const { error } = await this.supabase
      .from("signal_feed")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async updateSavedLeadId(id: string, leadId: string): Promise<void> {
    const { error } = await this.supabase
      .from("signal_feed")
      .update({ saved_lead_id: leadId })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getStats(): Promise<SignalFeedStats> {
    const todayStart = `${toDateKey(new Date())}T00:00:00.000Z`;

    const [
      todaysSignals,
      highIntent,
      mediumIntent,
      lowIntent,
      hotOpportunities,
      savedToday,
      pendingReview,
    ] = await Promise.all([
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .gte("intent_score", LEAD_SCORE_BANDS.HIGH_MIN),
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .gte("intent_score", LEAD_SCORE_BANDS.MEDIUM_MIN)
        .lt("intent_score", LEAD_SCORE_BANDS.HIGH_MIN),
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .lt("intent_score", LEAD_SCORE_BANDS.MEDIUM_MIN),
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .eq("priority", "Hot"),
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .eq("status", "Saved")
        .gte("updated_at", todayStart),
      this.supabase
        .from("signal_feed")
        .select("id", { count: "exact", head: true })
        .eq("status", "New"),
    ]);

    return {
      todaysSignals: todaysSignals.count ?? 0,
      highIntent: highIntent.count ?? 0,
      mediumIntent: mediumIntent.count ?? 0,
      lowIntent: lowIntent.count ?? 0,
      hotOpportunities: hotOpportunities.count ?? 0,
      savedToday: savedToday.count ?? 0,
      pendingReview: pendingReview.count ?? 0,
    };
  }
}
