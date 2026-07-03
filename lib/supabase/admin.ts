import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { env } from "@/lib/env";

// Service-role client that bypasses RLS - only for trusted, unattended
// server-side jobs (like the Signal Feed sync route) that have no logged-in
// user session to authenticate as. Never import this from a client
// component or expose SUPABASE_SERVICE_ROLE_KEY to the browser bundle.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for server-only jobs that run without a user session (e.g. the Signal Feed sync route)."
    );
  }
  return createSupabaseClient<Database>(env.supabaseUrl, serviceRoleKey);
}
