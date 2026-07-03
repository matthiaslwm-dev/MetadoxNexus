import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { noStoreFetch } from "@/lib/supabase/fetch";
import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      global: { fetch: noStoreFetch },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component; ignore if you have
            // middleware/proxy refreshing sessions.
          }
        },
      },
    }
  );
}
