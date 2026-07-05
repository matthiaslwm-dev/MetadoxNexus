import type {
  LeadPriority,
  LeadStatus,
  SignalConfidence,
  SignalFeedStatus,
  SignalOpportunityLevel,
  SignalPriority,
} from "@/lib/supabase/types";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/15",
  Shortlisted: "bg-cyan-50 text-cyan-700 ring-cyan-600/15",
  Connected: "bg-teal-50 text-teal-700 ring-teal-600/15",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-600/15",
  "Meeting Booked": "bg-purple-50 text-purple-700 ring-purple-600/15",
  Won: "bg-green-50 text-green-700 ring-green-600/15",
  Lost: "bg-gray-100 text-gray-500 ring-gray-500/10",
  "Not Applicable": "bg-gray-100 text-gray-400 ring-gray-500/10",
};

const statusDot: Record<LeadStatus, string> = {
  New: "bg-blue-500",
  Shortlisted: "bg-cyan-500",
  Connected: "bg-teal-500",
  Contacted: "bg-amber-500",
  "Meeting Booked": "bg-purple-500",
  Won: "bg-green-500",
  Lost: "bg-gray-400",
  "Not Applicable": "bg-gray-300",
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

const platformStyles: Record<string, string> = {
  LinkedIn: "bg-[#0A66C2]/10 text-[#0A66C2] ring-[#0A66C2]/20",
  Facebook: "bg-[#1877F2]/10 text-[#1877F2] ring-[#1877F2]/20",
  Instagram: "bg-purple-50 text-purple-700 ring-purple-600/15",
};

export function PlatformBadge({ platform }: { platform: string }) {
  const style = platformStyles[platform] ?? "bg-gray-100 text-gray-600 ring-gray-500/10";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {platform}
    </span>
  );
}

const confidenceStyles: Record<SignalConfidence, string> = {
  High: "bg-green-50 text-green-700 ring-green-600/15",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  Low: "bg-gray-100 text-gray-500 ring-gray-500/10",
};

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  const style =
    confidenceStyles[confidence as SignalConfidence] ?? "bg-gray-100 text-gray-600 ring-gray-500/10";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {confidence} confidence
    </span>
  );
}

const opportunityLevelStyles: Record<SignalOpportunityLevel, string> = {
  High: "bg-green-50 text-green-700 ring-green-600/15",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  Low: "bg-gray-100 text-gray-500 ring-gray-500/10",
};

export function OpportunityLevelBadge({ level }: { level: string }) {
  const style =
    opportunityLevelStyles[level as SignalOpportunityLevel] ??
    "bg-gray-100 text-gray-600 ring-gray-500/10";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {level} opportunity
    </span>
  );
}

const signalPriorityStyles: Record<SignalPriority, string> = {
  Hot: "bg-red-50 text-red-700 ring-red-600/15",
  Warm: "bg-amber-50 text-amber-700 ring-amber-600/15",
  Cold: "bg-gray-100 text-gray-500 ring-gray-500/10",
};

const signalPriorityIcon: Record<SignalPriority, string> = {
  Hot: "\u{1F525}",
  Warm: "\u{1F7E1}",
  Cold: "⚪",
};

export function SignalPriorityBadge({ priority }: { priority: string }) {
  const style =
    signalPriorityStyles[priority as SignalPriority] ?? "bg-gray-100 text-gray-600 ring-gray-500/10";
  const icon = signalPriorityIcon[priority as SignalPriority] ?? "";
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <span>{icon}</span>
      {priority}
    </span>
  );
}

const signalStatusStyles: Record<SignalFeedStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/15",
  Reviewed: "bg-cyan-50 text-cyan-700 ring-cyan-600/15",
  Saved: "bg-green-50 text-green-700 ring-green-600/15",
  Dismissed: "bg-gray-100 text-gray-500 ring-gray-500/10",
  "Not Applicable": "bg-gray-100 text-gray-400 ring-gray-500/10",
};

export function SignalStatusBadge({ status }: { status: string }) {
  const style =
    signalStatusStyles[status as SignalFeedStatus] ?? "bg-gray-100 text-gray-600 ring-gray-500/10";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
