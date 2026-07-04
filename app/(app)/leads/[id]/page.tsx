import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/stat-card";
import { LeadDetailForm } from "@/components/lead-detail-form";
import { LeadMetrics } from "@/components/lead-metrics";
import { ActivityLog } from "@/components/activity-log";
import { BackToLeadsLink } from "@/components/back-to-leads-link";

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
    { data: agents },
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
    supabase.from("agents").select("id, name").eq("active", true).order("name"),
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
      <BackToLeadsLink />

      <PageHeader
        title={lead.name}
        description={lead.organisations?.name ?? "No organisation"}
      />

      <div className="grid grid-cols-1 gap-8 pb-36 md:pb-0 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadDetailForm
            lead={lead}
            organisationName={lead.organisations?.name ?? ""}
            agents={agents ?? []}
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
