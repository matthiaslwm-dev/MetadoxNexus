"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { AnimatedNumber } from "@/components/animated-number";

// Intent (High/Medium/Low) reads better as one proportional bar than as
// three same-size stat cards competing for attention in a flat grid - it's
// a breakdown of a single total, not three independent headline metrics.
export function IntentBreakdown({
  high,
  medium,
  low,
}: {
  high: number;
  medium: number;
  low: number;
}) {
  const total = high + medium + low;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <p className="text-sm font-medium text-gray-500">Intent Breakdown</p>

      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {total > 0 && (
          <>
            <div className="h-full bg-green-500" style={{ width: `${pct(high)}%` }} />
            <div className="h-full bg-amber-400" style={{ width: `${pct(medium)}%` }} />
            <div className="h-full bg-gray-300" style={{ width: `${pct(low)}%` }} />
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-semibold text-green-600">
            <AnimatedNumber value={high} />
          </p>
          <p className="text-xs text-gray-500">High</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-amber-600">
            <AnimatedNumber value={medium} />
          </p>
          <p className="text-xs text-gray-500">Medium</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-500">
            <AnimatedNumber value={low} />
          </p>
          <p className="text-xs text-gray-500">Low</p>
        </div>
      </div>
    </motion.div>
  );
}
