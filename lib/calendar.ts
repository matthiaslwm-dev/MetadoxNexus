export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseMonthParam(month: string | undefined): {
  year: number;
  monthIndex: number;
} {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    if (m >= 1 && m <= 12) {
      return { year: y, monthIndex: m - 1 };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

export function monthParam(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Returns a flat array of 6*7 = 42 dates covering the full weeks that
// contain the 1st and last day of the given month (Sunday-start weeks).
export function getMonthGrid(year: number, monthIndex: number): Date[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, monthIndex, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

export function isSameMonth(date: Date, year: number, monthIndex: number) {
  return date.getFullYear() === year && date.getMonth() === monthIndex;
}

export function isToday(date: Date) {
  const today = new Date();
  return toDateKey(date) === toDateKey(today);
}
