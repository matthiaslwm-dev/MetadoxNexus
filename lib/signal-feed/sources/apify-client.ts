// Minimal wrapper around Apify's REST API (no @apify/client dependency
// needed - this is the only call we need: run an actor synchronously and
// get its dataset items back in one request).
// https://docs.apify.com/api/v2#/reference/actors/run-actor-synchronously-and-get-dataset-items

export type ApifyConfig = {
  apiToken: string;
  actorId: string;
};

export function getApifyConfig(actorIdEnvVar: string): ApifyConfig | null {
  const apiToken = process.env.APIFY_API_TOKEN;
  const actorId = process.env[actorIdEnvVar];
  if (!apiToken || !actorId) return null;
  return { apiToken, actorId };
}

export async function runApifyActor<T = Record<string, unknown>>(
  config: ApifyConfig,
  input: Record<string, unknown>
): Promise<T[]> {
  // Apify accepts actor IDs as "username/actor-name" in the console, but the
  // REST path segment uses "~" in place of "/".
  const actorPath = config.actorId.replace("/", "~");
  const url = `https://api.apify.com/v2/acts/${actorPath}/run-sync-get-dataset-items?token=${config.apiToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Apify actor run failed (${res.status}): ${body.slice(0, 300)}`);
  }

  return res.json();
}
