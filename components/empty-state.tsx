"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </motion.div>
  );
}
