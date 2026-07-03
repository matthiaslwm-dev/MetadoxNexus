export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = Date.now() - date.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}
