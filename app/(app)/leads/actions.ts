"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrganisation } from "@/lib/organisations";
import { toDateKey } from "@/lib/calendar";
import type { LeadPriority, LeadStatus } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const FOLLOW_UP_INTERVAL_DAYS = 3;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function logFieldChanges(
  supabase: SupabaseClient<Database>,
  leadId: string,
  before: { status: string; priority: string },
  after: { status: string; priority: string }
) {
  const activities: { lead_id: string; activity_type: string; content: string }[] = [];

  if (before.status !== after.status) {
    activities.push({
      lead_id: leadId,
      activity_type: "status_change",
      content: `Status changed from "${before.status}" to "${after.status}"`,
    });
  }
  if (before.priority !== after.priority) {
    activities.push({
      lead_id: leadId,
      activity_type: "priority_change",
      content: `Priority changed from "${before.priority}" to "${after.priority}"`,
    });
  }

  if (activities.length > 0) {
    await supabase.from("lead_activities").insert(activities);
  }
}

export type UpdateLeadState = { error?: string; success?: boolean } | undefined;

export async function updateLead(
  leadId: string,
  _prevState: UpdateLeadState,
  formData: FormData
): Promise<UpdateLeadState> {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const organisationName = String(formData.get("organisation") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  let organisationId: string | null = null;
  if (organisationName) {
    organisationId = await getOrCreateOrganisation(supabase, organisationName);
  }

  const nextFollowUp = String(formData.get("next_follow_up") ?? "").trim();
  const status = String(formData.get("status") ?? "New") as LeadStatus;
  const priority = String(formData.get("priority") ?? "Medium") as LeadPriority;
  const agentId = String(formData.get("agent_id") ?? "").trim() || null;

  const { data: before } = await supabase
    .from("leads")
    .select("status, priority")
    .eq("id", leadId)
    .single();

  const { error } = await supabase
    .from("leads")
    .update({
      name,
      organisation_id: organisationId,
      agent_id: agentId,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
      facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
      instagram_url:
        String(formData.get("instagram_url") ?? "").trim() || null,
      website_url: String(formData.get("website_url") ?? "").trim() || null,
      status,
      priority,
      notes: String(formData.get("notes") ?? "").trim() || null,
      next_follow_up: nextFollowUp || null,
    })
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  if (before) {
    await logFieldChanges(supabase, leadId, before, { status, priority });
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");

  return { success: true };
}

export type CreateLeadState = { error?: string } | undefined;

export async function createLead(
  _prevState: CreateLeadState,
  formData: FormData
): Promise<CreateLeadState> {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const organisationName = String(formData.get("organisation") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  let organisationId: string | null = null;
  if (organisationName) {
    organisationId = await getOrCreateOrganisation(supabase, organisationName);
  }

  const status = String(formData.get("status") ?? "New") as LeadStatus;
  const priority = String(formData.get("priority") ?? "Medium") as LeadPriority;
  const agentId = String(formData.get("agent_id") ?? "").trim() || null;

  const { data: created, error } = await supabase
    .from("leads")
    .insert({
      name,
      organisation_id: organisationId,
      agent_id: agentId,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
      facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
      instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
      website_url: String(formData.get("website_url") ?? "").trim() || null,
      status,
      priority,
      notes: String(formData.get("notes") ?? "").trim() || null,
      next_follow_up: String(formData.get("next_follow_up") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: error?.message ?? "Failed to create lead." };
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");

  redirect(`/leads/${created.id}`);
}

export async function deleteLead(leadId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");

  return { success: true };
}

export type SocialCandidate = { title: string; link: string; snippet: string };
export type FindSocialCandidatesState = {
  candidates?: SocialCandidate[];
  error?: string;
};

// Uses Google's Programmable Search API (not LinkedIn/Instagram scraping) to
// surface likely profile URLs so the user can confirm a match by hand
// instead of searching Google manually for every lead.
export async function findSocialCandidates(
  name: string,
  organisationName: string,
  platform: "linkedin" | "instagram"
): Promise<FindSocialCandidatesState> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return {
      error:
        "Google search is not configured. Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID.",
    };
  }
  if (!name.trim()) {
    return { error: "Lead name is required to search." };
  }

  const site = platform === "linkedin" ? "site:linkedin.com/in" : "site:instagram.com";
  const query = organisationName.trim()
    ? `${site} "${name}" "${organisationName}"`
    : `${site} "${name}"`;

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cseId);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      return { error: `Google search failed (${res.status}): ${body.slice(0, 200)}` };
    }
    const data = await res.json();
    const candidates: SocialCandidate[] = (data.items ?? []).map(
      (item: { title: string; link: string; snippet: string }) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      })
    );
    return { candidates };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Search failed." };
  }
}

export async function addActivity(leadId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const supabase = await createClient();

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "note",
    content,
  });

  revalidatePath(`/leads/${leadId}`);
}

// Logs a follow-up touch, advances the next follow-up date by
// FOLLOW_UP_INTERVAL_DAYS, and moves a "New" lead to "Contacted" on first
// contact. Keeps the schedule/overdue views populated without the user
// having to manually manage dates after every outreach.
export async function logFollowUp(leadId: string) {
  const supabase = await createClient();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("status, priority")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) {
    return { error: fetchError?.message ?? "Lead not found." };
  }

  const nextFollowUp = toDateKey(addDays(new Date(), FOLLOW_UP_INTERVAL_DAYS));
  const newStatus: LeadStatus = lead.status === "New" ? "Contacted" : (lead.status as LeadStatus);

  const { error } = await supabase
    .from("leads")
    .update({ next_follow_up: nextFollowUp, status: newStatus })
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  await logFieldChanges(
    supabase,
    leadId,
    { status: lead.status, priority: lead.priority },
    { status: newStatus, priority: lead.priority }
  );

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "follow_up",
    content: `Followed up. Next follow-up set for ${nextFollowUp}.`,
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");

  return { success: true, nextFollowUp };
}
