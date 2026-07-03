import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { SignalFeedRepository, signalAnalysisService } from "@/lib/signal-feed";
import { linkedInSource } from "@/lib/signal-feed/sources/linkedin-source";
import { instagramSource } from "@/lib/signal-feed/sources/instagram-source";
import type { SignalSource } from "@/lib/signal-feed/signal-source";

// Scheduled entry point that pulls fresh posts from every configured
// SignalSource, runs them through the mock AI analysis, and upserts new
// signals (skipping ones already seen by post_url). Trigger this on a
// schedule with an external cron (Vercel Cron via vercel.json, GitHub
// Actions, cron-job.org, etc.) hitting this URL with:
//   Authorization: Bearer <CRON_SECRET>
// (Vercel Cron sends this header automatically once CRON_SECRET is set as
// an env var on the project - no extra config needed there.)
//
// Each source no-ops (returns []) until its own env vars are configured, so
// it's safe to leave any of these listed even if unconfigured. Add future
// sources (FacebookSource, ...) to this array - nothing else about the sync
// flow needs to change.
const SOURCES: SignalSource[] = [linkedInSource, instagramSource];

const FETCH_LIMIT_PER_SOURCE = 25;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const repo = new SignalFeedRepository(supabase);

  const summary: Record<string, { fetched: number; imported: number; error?: string }> = {};

  for (const source of SOURCES) {
    try {
      const rawSignals = await source.fetchSignals({ limit: FETCH_LIMIT_PER_SOURCE });
      const analyzed = rawSignals.map((input) => ({
        ...input,
        ...signalAnalysisService.analyze(input),
      }));
      const inserted = await repo.upsertManySkippingDuplicates(analyzed);
      summary[source.platform] = { fetched: rawSignals.length, imported: inserted.length };
    } catch (err) {
      summary[source.platform] = {
        fetched: 0,
        imported: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  revalidatePath("/signal-feed");

  return NextResponse.json({ ok: true, summary });
}
