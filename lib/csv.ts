import Papa from "papaparse";

export const REQUIRED_COLUMNS = [
  "Agent Name",
  "Organisation",
  "Measure Names",
  "Ranking",
  "Measure Values",
] as const;

export type CsvRow = {
  agentName: string;
  organisation: string;
  measureName: string;
  ranking: number | null;
  measureValue: number | null;
};

export type ParseResult =
  | { ok: true; rows: CsvRow[] }
  | { ok: false; error: string };

export function parseLeadsCsv(text: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    return { ok: false, error: result.errors[0].message };
  }

  const headers = result.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required column(s): ${missing.join(", ")}`,
    };
  }

  const rows: CsvRow[] = result.data
    .filter((row) => row["Agent Name"]?.trim())
    .map((row) => {
      const ranking = Number(row["Ranking"]);
      const measureValue = Number(row["Measure Values"]);
      return {
        agentName: row["Agent Name"].trim(),
        organisation: (row["Organisation"] ?? "").trim(),
        measureName: (row["Measure Names"] ?? "").trim(),
        ranking: Number.isFinite(ranking) ? ranking : null,
        measureValue: Number.isFinite(measureValue) ? measureValue : null,
      };
    });

  if (rows.length === 0) {
    return { ok: false, error: "No data rows found in CSV." };
  }

  return { ok: true, rows };
}
