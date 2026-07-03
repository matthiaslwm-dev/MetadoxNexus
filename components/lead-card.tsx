"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StatusBadge, PriorityBadge } from "@/components/badges";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export type LeadListItem = {
  id: string;
  name: string;
  status: string;
  priority: string;
  next_follow_up: string | null;
  organisation_name: string | null;
  ranking: number | null;
  measure_value: number | null;
  is_overdue: boolean;
};

export function LeadCardsGrid({
  leads,
  resultsKey,
}: {
  leads: LeadListItem[];
  resultsKey: string;
}) {
  return (
    <motion.div
      key={resultsKey}
      variants={staggerContainer(0.04)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden"
    >
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </motion.div>
  );
}

function LeadCard({ lead }: { lead: LeadListItem }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileTap={{ scale: 0.99 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{lead.name}</p>
          <p className="text-sm text-gray-500">
            {lead.organisation_name ?? "—"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={lead.status} />
          <PriorityBadge priority={lead.priority} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400">Ranking</p>
          <p className="font-medium text-gray-900">{lead.ranking ?? "—"}</p>
        </div>
        <div>
          <p className="text-gray-400">Measure Value</p>
          <p className="font-medium text-gray-900">
            {lead.measure_value ?? "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Next Follow-up</p>
          <p className="flex items-center gap-1.5 font-medium text-gray-900">
            {lead.next_follow_up ?? "—"}
            {lead.is_overdue && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/15">
                Overdue
              </span>
            )}
          </p>
        </div>
      </div>

      <Link
        href={`/leads/${lead.id}`}
        className="mt-4 flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        style={{ minHeight: 44 }}
      >
        View
      </Link>
    </motion.div>
  );
}
