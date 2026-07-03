import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/stat-card";
import { LeadDetailForm } from "@/components/lead-detail-form";
import { LeadMetrics } from "@/components/lead-metrics";
import { ActivityLog } from "@/components/activity-log";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: lead, error: leadError },
    { data: metrics, error: metricsError },
    { data: activities, error: activitiesError },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*, organisations(name)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lead_performance_metrics")
      .select("*")
      .eq("lead_id", id)
      .order("imported_at", { ascending: false }),
    supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (leadError || metricsError || activitiesError) {
    throw new Error(
      leadError?.message ??
        metricsError?.message ??
        activitiesError?.message ??
        "Failed to load lead."
    );
  }

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to leads
      </Link>

      <PageHeader
        title={lead.name}
        description={lead.organisations?.name ?? "No organisation"}
      />

      <div className="grid grid-cols-1 gap-8 pb-36 md:pb-0 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadDetailForm
            lead={lead}
            organisationName={lead.organisations?.name ?? ""}
          />
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Performance Metrics
            </h2>
            <LeadMetrics metrics={metrics ?? []} />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Activity Log
            </h2>
            <ActivityLog leadId={id} activities={activities ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
