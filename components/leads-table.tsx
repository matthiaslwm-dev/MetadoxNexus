"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { deleteLead } from "@/app/(app)/leads/actions";
import { Icon } from "@/components/icons";
import { normalizeUrl } from "@/lib/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { SortColumn, SortDirection } from "@/lib/leads-sort";
import type { LeadListItem } from "@/components/lead-card";

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3 w-3 transition-transform ${
        direction === "desc" ? "rotate-180" : ""
      } ${direction ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function SortableHeader({
  column,
  label,
  activeSort,
}: {
  column: SortColumn;
  label: string;
  activeSort: { column: SortColumn; direction: SortDirection } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = activeSort?.column === column;
  const nextDirection: SortDirection =
    isActive && activeSort.direction === "asc" ? "desc" : "asc";

  function handleSort() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", column);
    params.set("dir", nextDirection);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={handleSort}
        className="group flex items-center gap-1 uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-900"
      >
        {label}
        <SortIcon direction={isActive ? activeSort.direction : null} />
      </button>
    </th>
  );
}

function DeleteLeadButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteLead(leadId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
        className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
      >
        <Icon name="trash" className="h-3.5 w-3.5" />
        Delete
      </button>

      <ConfirmDialog
        open={open}
        title="Delete this lead?"
        description={`This will permanently delete "${leadName}" along with its activity log and performance metrics. This action cannot be undone.`}
        confirmLabel="Delete"
        pending={isPending}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export function LeadsTable({
  leads,
  resultsKey,
  activeSort,
}: {
  leads: LeadListItem[];
  resultsKey: string;
  activeSort: { column: SortColumn; direction: SortDirection } | null;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs">
          <tr>
            <SortableHeader column="name" label="Name" activeSort={activeSort} />
            <SortableHeader column="organisation_name" label="Organisation" activeSort={activeSort} />
            <SortableHeader column="ranking" label="Ranking" activeSort={activeSort} />
            <SortableHeader column="measure_value" label="Earnings" activeSort={activeSort} />
            <SortableHeader column="status" label="Status" activeSort={activeSort} />
            <SortableHeader column="priority" label="Priority" activeSort={activeSort} />
            <SortableHeader column="next_follow_up" label="Next Follow Up" activeSort={activeSort} />
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <motion.tbody
          key={resultsKey}
          variants={staggerContainer(0.025)}
          initial="hidden"
          animate="show"
          className="divide-y divide-gray-100"
        >
          {leads.map((lead) => (
            <motion.tr
              key={lead.id}
              variants={fadeInUp}
              className="transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {lead.name}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {lead.organisation_name ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {lead.ranking ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {lead.measure_value ?? "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={lead.priority} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-1.5">
                  {lead.next_follow_up ?? "—"}
                  {lead.is_overdue && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/15">
                      Overdue
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                {lead.instagram_url && (
                  <a
                    href={normalizeUrl(lead.instagram_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Instagram"
                    className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Icon name="instagram" className="h-3.5 w-3.5" />
                  </a>
                )}
                {lead.linkedin_url && (
                  <a
                    href={normalizeUrl(lead.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open LinkedIn"
                    className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Icon name="linkedin" className="h-3.5 w-3.5" />
                  </a>
                )}
                <Link
                  href={`/leads/${lead.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Icon name="eye" className="h-3.5 w-3.5" />
                  View
                </Link>
                <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
