import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/stat-card";
import { ScheduleCalendar, type ScheduleItem } from "@/components/schedule-calendar";
import { getMonthGrid, parseMonthParam, toDateKey } from "@/lib/calendar";

type SearchParams = Promise<{ month?: string }>;

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { month } = await searchParams;
  const { year, monthIndex } = parseMonthParam(month);
  const grid = getMonthGrid(year, monthIndex);
  const rangeStart = toDateKey(grid[0]);
  const rangeEnd = toDateKey(grid[grid.length - 1]);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, status, next_follow_up, organisations(name)")
    .not("next_follow_up", "is", null)
    .gte("next_follow_up", rangeStart)
    .lte("next_follow_up", rangeEnd);

  if (error) {
    throw new Error(error.message);
  }

  const items: ScheduleItem[] = (data ?? []).map((lead) => ({
    id: lead.id,
    name: lead.name,
    status: lead.status,
    next_follow_up: lead.next_follow_up as string,
    organisations: lead.organisations,
  }));

  return (
    <div>
      <PageHeader
        title="Schedule"
        description="Follow-ups and booked meetings by day"
      />
      <ScheduleCalendar year={year} monthIndex={monthIndex} items={items} />
    </div>
  );
}
