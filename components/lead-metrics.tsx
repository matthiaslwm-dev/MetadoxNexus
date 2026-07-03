"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { EmptyState } from "@/components/empty-state";
import type { LeadPerformanceMetric } from "@/lib/supabase/types";

export function LeadMetrics({
  metrics,
}: {
  metrics: LeadPerformanceMetric[];
}) {
  if (metrics.length === 0) {
    return <EmptyState title="No performance metrics yet" />;
  }

  return (
    <motion.div
      variants={staggerContainer(0.04)}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {metrics.map((metric) => (
        <motion.div
          key={metric.id}
          variants={fadeInUp}
          className="grid grid-cols-3 gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm"
        >
          <div>
            <p className="text-gray-400">Measure Name</p>
            <p className="font-medium text-gray-900">
              {metric.measure_name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Ranking</p>
            <p className="font-medium text-gray-900">
              {metric.ranking ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Earnings</p>
            <p className="font-medium text-gray-900">
              {metric.measure_value ?? "—"}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
