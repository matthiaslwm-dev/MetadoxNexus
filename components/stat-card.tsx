"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { AnimatedNumber } from "@/components/animated-number";

export function StatGrid({
  stats,
}: {
  stats: { label: string; value: number }[];
}) {
  return (
    <motion.div
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
        <AnimatedNumber value={value} />
      </p>
    </motion.div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
