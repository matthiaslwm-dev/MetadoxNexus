"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrganisation } from "@/lib/organisations";
import {
  SignalFeedRepository,
  signalAnalysisService,
  type SignalFeedListFilters,
} from "@/lib/signal-feed";
import type { RawSignalInput } from "@/lib/signal-feed/types";
import type { SignalCsvRow } from "@/lib/signal-feed-csv";
import type { SignalFeed, SignalFeedStatus } from "@/lib/supabase/types";

const CSV_CHUNK_SIZE = 200;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export type CreateSignalState = { error?: string } | undefined;

export async function createSignal(
  _prevState: CreateSignalState,
  formData: FormData
): Promise<CreateSignalState> {
  const platform = String(formData.get("platform") ?? "").trim();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const post_text = String(formData.get("post_text") ?? "").trim();

  if (!platform || !display_name || !post_text) {
    return { error: "Platform, display name, and post text are required." };
  }

  const input: RawSignalInput = {
    platform,
    display_name,
    username: String(formData.get("username") ?? "").trim() || null,
    profile_url: String(formData.get("profile_url") ?? "").trim() || null,
    post_url: String(formData.get("post_url") ?? "").trim() || null,
    post_text,
    post_date: String(formData.get("post_date") ?? "").trim() || null,
  };

  const analysis = signalAnalysisService.analyze(input);
  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);

  await repo.create({ ...input, ...analysis });

  revalidatePath("/signal-feed");
  redirect("/signal-feed");
}

export async function markReviewed(id: string) {
  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);
  await repo.updateStatus(id, "Reviewed");
  revalidatePath("/signal-feed");
}

export async function dismissSignal(id: string) {
  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);
  await repo.updateStatus(id, "Dismissed" as SignalFeedStatus);
  revalidatePath("/signal-feed");
}

export async function markNotApplicable(id: string) {
  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);
  await repo.updateStatus(id, "Not Applicable");
  revalidatePath("/signal-feed");
}

const PRIORITY_TO_LEAD_PRIORITY = { Hot: "High", Warm: "Medium", Cold: "Low" } as const;

export type SaveToCrmState = { error?: string; leadId?: string } | undefined;

export async function saveToCrm(
  signalId: string,
  _prevState: SaveToCrmState,
  formData: FormData
): Promise<SaveToCrmState> {
  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);

  const signal = await repo.getById(signalId);
  if (!signal) {
    return { error: "Signal not found." };
  }

  const organisationName = String(formData.get("organisation") ?? "").trim();
  let organisationId: string | null = null;
  if (organisationName) {
    organisationId = await getOrCreateOrganisation(supabase, organisationName);
  }

  const excerpt =
    signal.post_text.length > 200 ? `${signal.post_text.slice(0, 200)}...` : signal.post_text;
  const notes = [
    `Discovered via Signal Feed (${signal.platform}).`,
    signal.pain_summary ? `Pain summary: ${signal.pain_summary}` : null,
    `Original post: "${excerpt}"`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const linkedin_url =
    signal.platform.toLowerCase() === "linkedin" ? signal.profile_url : null;
  const instagram_url =
    signal.platform.toLowerCase() === "instagram" ? signal.profile_url : null;

  const { data: created, error } = await supabase
    .from("leads")
    .insert({
      name: signal.display_name,
      organisation_id: organisationId,
      linkedin_url,
      instagram_url,
      status: "New",
      priority: PRIORITY_TO_LEAD_PRIORITY[signal.priority],
      notes,
      signal_feed_id: signal.id,
      source_platform: signal.platform,
      source_url: signal.post_url,
      discovery_date: signal.post_date,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: error?.message ?? "Failed to create lead." };
  }

  await repo.updateSavedLeadId(signalId, created.id);
  await repo.updateStatus(signalId, "Saved");

  revalidatePath("/signal-feed");
  revalidatePath("/leads");
  revalidatePath("/dashboard");

  return { leadId: created.id };
}

export type ImportSignalsResult = { imported: number; errors: string[] };

export async function importSignals(rows: SignalCsvRow[]): Promise<ImportSignalsResult> {
  const result: ImportSignalsResult = { imported: 0, errors: [] };
  if (rows.length === 0) return result;

  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);

  const analyzed = rows.map((row) => {
    const input: RawSignalInput = {
      platform: row.platform,
      display_name: row.display_name,
      username: row.username || null,
      profile_url: row.profile_url || null,
      post_url: row.post_url || null,
      post_text: row.post_text,
      post_date: row.post_date || null,
    };
    return { ...input, ...signalAnalysisService.analyze(input) };
  });

  for (const [index, batch] of chunk(analyzed, CSV_CHUNK_SIZE).entries()) {
    try {
      const inserted = await repo.createMany(batch);
      result.imported += inserted.length;
    } catch (err) {
      result.errors.push(
        `Failed to import batch ${index + 1}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  revalidatePath("/signal-feed");
  return result;
}

export type FetchMoreState = { rows: SignalFeed[]; nextPage: number | null };

export async function fetchMoreSignals(
  filters: SignalFeedListFilters
): Promise<FetchMoreState> {
  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);
  const { rows, count } = await repo.list(filters);

  const totalPages = Math.max(1, Math.ceil(count / filters.pageSize));
  const nextPage = filters.page < totalPages ? filters.page + 1 : null;

  return { rows, nextPage };
}
