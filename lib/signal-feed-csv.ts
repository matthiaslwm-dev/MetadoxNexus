import Papa from "papaparse";

export const SIGNAL_REQUIRED_COLUMNS = [
  "platform",
  "display_name",
  "username",
  "profile_url",
  "post_url",
  "post_date",
  "post_text",
] as const;

export type SignalCsvRow = {
  platform: string;
  display_name: string;
  username: string;
  profile_url: string;
  post_url: string;
  post_date: string;
  post_text: string;
  location: string;
};

export type SignalParseResult =
  | { ok: true; rows: SignalCsvRow[] }
  | { ok: false; error: string };

export function parseSignalFeedCsv(text: string): SignalParseResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    return { ok: false, error: result.errors[0].message };
  }

  const headers = result.meta.fields ?? [];
  const missing = SIGNAL_REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required column(s): ${missing.join(", ")}`,
    };
  }

  const rows: SignalCsvRow[] = result.data
    .filter((row) => row["display_name"]?.trim() && row["post_text"]?.trim())
    .map((row) => ({
      platform: (row["platform"] ?? "").trim(),
      display_name: row["display_name"].trim(),
      username: (row["username"] ?? "").trim(),
      profile_url: (row["profile_url"] ?? "").trim(),
      post_url: (row["post_url"] ?? "").trim(),
      post_date: (row["post_date"] ?? "").trim(),
      post_text: row["post_text"].trim(),
      location: (row["location"] ?? "").trim(),
    }));

  if (rows.length === 0) {
    return { ok: false, error: "No data rows found in CSV." };
  }

  return { ok: true, rows };
}
