import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function getOrCreateOrganisation(
  supabase: SupabaseClient<Database>,
  name: string
): Promise<string> {
  const trimmed = name.trim();

  const { data: existing } = await supabase
    .from("organisations")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("organisations")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (error || !created) {
    // Handle race where another request created it concurrently
    const { data: retry } = await supabase
      .from("organisations")
      .select("id")
      .eq("name", trimmed)
      .single();
    if (retry) return retry.id;
    throw error ?? new Error(`Failed to create organisation "${trimmed}"`);
  }

  return created.id;
}

export function priorityFromRanking(ranking: number): "High" | "Medium" | "Low" {
  if (ranking <= 50) return "High";
  if (ranking <= 200) return "Medium";
  return "Low";
}

// Upserts every distinct organisation name in one round trip and returns a
// name -> id map. Relies on the unique constraint on organisations.name.
export async function getOrCreateOrganisationsBulk(
  supabase: SupabaseClient<Database>,
  names: string[]
): Promise<Map<string, string>> {
  const uniqueNames = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (uniqueNames.length === 0) return new Map();

  const { data, error } = await supabase
    .from("organisations")
    .upsert(
      uniqueNames.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: false }
    )
    .select("id, name");

  if (error || !data) {
    throw error ?? new Error("Failed to upsert organisations");
  }

  return new Map(data.map((org) => [org.name, org.id]));
}
