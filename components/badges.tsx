import type { LeadPriority, LeadStatus } from "@/lib/supabase/types";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/15",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-600/15",
  "Meeting Booked": "bg-purple-50 text-purple-700 ring-purple-600/15",
  Won: "bg-green-50 text-green-700 ring-green-600/15",
  Lost: "bg-gray-100 text-gray-500 ring-gray-500/10",
};

const statusDot: Record<LeadStatus, string> = {
  New: "bg-blue-500",
  Contacted: "bg-amber-500",
  "Meeting Booked": "bg-purple-500",
  Won: "bg-green-500",
  Lost: "bg-gray-400",
};

const priorityStyles: Record<LeadPriority, string> = {
  High: "bg-red-50 text-red-700 ring-red-600/15",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  Low: "bg-gray-100 text-gray-500 ring-gray-500/10",
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    statusStyles[status as LeadStatus] ?? "bg-gray-100 text-gray-600 ring-gray-500/10";
  const dot = statusDot[status as LeadStatus] ?? "bg-gray-400";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const style =
    priorityStyles[priority as LeadPriority] ?? "bg-gray-100 text-gray-600 ring-gray-500/10";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {priority}
    </span>
  );
}
