import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatGrid } from "@/components/stat-card";
import { IntentBreakdown } from "@/components/intent-breakdown";
import { SignalFeedFilterBar } from "@/components/signal-feed-filter-bar";
import { SignalCardList } from "@/components/signal-card";
import { LeadsPagination } from "@/components/leads-pagination";
import { EmptyState } from "@/components/empty-state";
import { SignalFeedRepository, type SignalFeedListFilters } from "@/lib/signal-feed";

const PAGE_SIZE = 10;

type SearchParams = Promise<{
  q?: string;
  location?: string;
  platform?: string;
  painCategory?: string;
  opportunityType?: string;
  priority?: string;
  minScore?: string;
  maxScore?: string;
  minIntent?: string;
  maxIntent?: string;
  confidence?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: string;
}>;

export default async function SignalFeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    q,
    location,
    platform,
    painCategory,
    opportunityType,
    priority,
    minScore,
    maxScore,
    minIntent,
    maxIntent,
    confidence,
    status,
    dateFrom,
    dateTo,
    sort,
    page: pageParam,
  } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);

  const filters: SignalFeedListFilters = {
    q,
    location,
    platform,
    painCategory,
    opportunityType,
    priority,
    minLeadScore: minScore ? Number(minScore) : undefined,
    maxLeadScore: maxScore ? Number(maxScore) : undefined,
    minIntentScore: minIntent ? Number(minIntent) : undefined,
    maxIntentScore: maxIntent ? Number(maxIntent) : undefined,
    confidence,
    status,
    dateFrom,
    dateTo,
    sort: sort === "newest" || sort === "oldest" ? sort : "score",
    page,
    pageSize: PAGE_SIZE,
  };

  const supabase = await createClient();
  const repo = new SignalFeedRepository(supabase);

  const [{ rows, count }, stats] = await Promise.all([
    repo.list(filters),
    repo.getStats(),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const resultsKey = JSON.stringify(filters);

  return (
    <div>
      <PageHeader
        title="Signal Feed"
        description="AI-powered Opportunity Intelligence — discover people publicly expressing pain points that may become future opportunities."
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatGrid
            stats={[
              { label: "Today's Signals", value: stats.todaysSignals },
              { label: "Hot Opportunities", value: stats.hotOpportunities },
              { label: "Saved Today", value: stats.savedToday },
              { label: "Pending Review", value: stats.pendingReview },
            ]}
          />
        </div>
        <IntentBreakdown
          high={stats.highIntent}
          medium={stats.mediumIntent}
          low={stats.lowIntent}
        />
      </div>

      <div className="mt-6">
        <Suspense>
          <SignalFeedFilterBar />
        </Suspense>

        {rows.length === 0 && (
          <EmptyState
            title="No signals yet"
            description="Add a signal manually or import a CSV to start surfacing opportunities."
          />
        )}

        {rows.length > 0 && (
          <>
            <SignalCardList signals={rows} resultsKey={resultsKey} />
            <Suspense>
              <LeadsPagination page={page} totalPages={totalPages} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
