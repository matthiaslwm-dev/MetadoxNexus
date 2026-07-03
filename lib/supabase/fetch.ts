// Next.js's dev server patches the global fetch for request caching/tracing,
// which conflicts with @supabase/ssr's auth client and can throw
// "Connection closed" mid-request. Supplying an explicit fetch that opts
// out of Next's cache avoids the patched implementation.
export const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });
