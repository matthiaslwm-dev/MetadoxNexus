// Next.js only inlines NEXT_PUBLIC_ vars for the browser bundle when they're
// accessed as static `process.env.NEXT_PUBLIC_X` expressions, so these must
// stay literal (no dynamic key lookup) for the client bundle to work.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.local.example to .env.local and fill in your Supabase project's URL and anon key.`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
};
