import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/stat-card";
import { LeadsFilterBar } from "@/components/leads-filter-bar";
import { LeadsTable } from "@/components/leads-table";
import { LeadCardsGrid } from "@/components/lead-card";
import { LeadsPagination } from "@/components/leads-pagination";
import { EmptyState } from "@/components/empty-state";
import { SuccessToast } from "@/components/success-toast";
import { parseSort } from "@/lib/leads-sort";
import { toDateKey } from "@/lib/calendar";
import type { LeadListItem } from "@/components/lead-card";
import type { LeadPriority, LeadStatus } from "@/lib/supabase/types";

const PAGE_SIZE = 10;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  priority?: string;
  agent?: string;
  minValue?: string;
  maxValue?: string;
  overdue?: string;
  page?: string;
  sort?: string;
  dir?: string;
}>;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    q,
    status,
    priority,
    agent,
    minValue,
    maxValue,
    overdue,
    page: pageParam,
    sort,
    dir,
  } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const activeSort = parseSort(sort, dir);
  const today = toDateKey(new Date());
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name")
    .eq("active", true)
    .order("name");

  let query = supabase
    .from("leads_with_latest_metric")
    .select("*", { count: "exact" });

  if (activeSort) {
    query = query.order(activeSort.column, {
      ascending: activeSort.direction === "asc",
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,organisation_name.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq("status", status as LeadStatus);
  }
  if (priority) {
    query = query.eq("priority", priority as LeadPriority);
  }
  if (agent) {
    query = query.eq("agent_id", agent);
  }
  if (minValue) {
    query = query.gte("measure_value", Number(minValue));
  }
  if (maxValue) {
    query = query.lte("measure_value", Number(maxValue));
  }
  if (overdue) {
    query = query.lt("next_follow_up", today).not("status", "in", "(Won,Lost,Not Applicable)");
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) {
    throw new Error(error.message);
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const resultsKey = `${q ?? ""}|${status ?? ""}|${priority ?? ""}|${agent ?? ""}|${minValue ?? ""}|${maxValue ?? ""}|${overdue ?? ""}|${page}|${sort ?? ""}|${dir ?? ""}`;

  const leads: LeadListItem[] = (data ?? []).map((lead) => ({
    id: lead.id,
    name: lead.name,
    status: lead.status,
    priority: lead.priority,
    next_follow_up: lead.next_follow_up,
    organisation_name: lead.organisation_name,
    agent_name: lead.agent_name,
    instagram_url: lead.instagram_url,
    linkedin_url: lead.linkedin_url,
    ranking: lead.ranking,
    measure_value: lead.measure_value,
    is_overdue:
      lead.next_follow_up !== null &&
      lead.next_follow_up < today &&
      lead.status !== "Won" &&
      lead.status !== "Lost" &&
      lead.status !== "Not Applicable",
  }));

  return (
    <div>
      <Suspense>
        <SuccessToast />
      </Suspense>

      <PageHeader title="Leads" description="Manage and prioritise your leads" />

      <Suspense>
        <LeadsFilterBar agents={agents ?? []} />
      </Suspense>

      {leads.length === 0 && (
        <EmptyState
          title="No leads found"
          description="Try adjusting your search or filters, or import a CSV to get started."
        />
      )}

      {leads.length > 0 && (
        <>
          <Suspense>
            <LeadsTable leads={leads} resultsKey={resultsKey} activeSort={activeSort} />
          </Suspense>
          <LeadCardsGrid leads={leads} resultsKey={resultsKey} />
          <Suspense>
            <LeadsPagination page={page} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  );
}
