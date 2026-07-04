export type SortColumn =
  | "name"
  | "organisation_name"
  | "agent_name"
  | "status"
  | "priority"
  | "next_follow_up"
  | "ranking"
  | "measure_value";

export const SORTABLE_COLUMNS: readonly SortColumn[] = [
  "name",
  "organisation_name",
  "agent_name",
  "status",
  "priority",
  "next_follow_up",
  "ranking",
  "measure_value",
];

export type SortDirection = "asc" | "desc";

export function parseSort(
  sort: string | undefined,
  dir: string | undefined
): { column: SortColumn; direction: SortDirection } | null {
  if (!sort || !SORTABLE_COLUMNS.includes(sort as SortColumn)) return null;
  return {
    column: sort as SortColumn,
    direction: dir === "desc" ? "desc" : "asc",
  };
}
