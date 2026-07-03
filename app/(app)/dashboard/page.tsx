import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatGrid } from "@/components/stat-card";
import { toDateKey } from "@/lib/calendar";
import type { LeadStatus } from "@/lib/supabase/types";

const STATUSES: { label: string; status: LeadStatus }[] = [
  { label: "New Leads", status: "New" },
  { label: "Contacted", status: "Contacted" },
  { label: "Meeting Booked", status: "Meeting Booked" },
  { label: "Won", status: "Won" },
  { label: "Lost", status: "Lost" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  // Exact counts via head:true requests (no row data returned), so these
  // aren't subject to PostgREST's default 1000-row cap on regular selects.
  const [total, ...rest] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    ...STATUSES.map(({ status }) =>
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", status)
    ),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("priority", "High"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .lt("next_follow_up", toDateKey(new Date()))
      .not("status", "in", "(Won,Lost)"),
  ]);

  const statusCounts = rest.slice(0, STATUSES.length);
  const highPriority = rest[STATUSES.length];
  const overdue = rest[STATUSES.length + 1];

  for (const result of [total, ...statusCounts, highPriority, overdue]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const stats = [
    { label: "Total Leads", value: total.count ?? 0 },
    ...STATUSES.map(({ label }, i) => ({
      label,
      value: statusCounts[i].count ?? 0,
    })),
    { label: "High Priority Leads", value: highPriority.count ?? 0 },
    { label: "Overdue Follow-ups", value: overdue.count ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your lead pipeline"
      />
      <StatGrid stats={stats} />
    </div>
  );
}
