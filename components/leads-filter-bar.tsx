"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { inputClass } from "@/lib/ui";
import { Icon } from "@/components/icons";

const STATUSES = [
  "New",
  "Shortlisted",
  "Contacted",
  "Meeting Booked",
  "Won",
  "Lost",
  "Not Applicable",
];
const PRIORITIES = ["High", "Medium", "Low"];
const DEBOUNCE_MS = 400;

export function LeadsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [minValue, setMinValue] = useState(searchParams.get("minValue") ?? "");
  const [maxValue, setMaxValue] = useState(searchParams.get("maxValue") ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleDebounced(key: string, value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ [key]: value });
    }, DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <motion.div
      animate={{ opacity: isPending ? 0.6 : 1 }}
      transition={{ duration: 0.15 }}
      className="mb-4 flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleDebounced("q", e.target.value);
            }}
            placeholder="Search by name or organisation..."
            className={`${inputClass} pl-10`}
            style={{ minHeight: 44 }}
          />
        </div>

        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          className={`${inputClass} w-full sm:w-auto`}
          style={{ minHeight: 44 }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          defaultValue={searchParams.get("priority") ?? ""}
          onChange={(e) => updateParams({ priority: e.target.value })}
          className={`${inputClass} w-full sm:w-auto`}
          style={{ minHeight: 44 }}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 sm:max-w-xs">
          <input
            type="number"
            inputMode="decimal"
            value={minValue}
            onChange={(e) => {
              setMinValue(e.target.value);
              handleDebounced("minValue", e.target.value);
            }}
            placeholder="Min earnings"
            className={inputClass}
            style={{ minHeight: 44 }}
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            type="number"
            inputMode="decimal"
            value={maxValue}
            onChange={(e) => {
              setMaxValue(e.target.value);
              handleDebounced("maxValue", e.target.value);
            }}
            placeholder="Max earnings"
            className={inputClass}
            style={{ minHeight: 44 }}
          />
        </div>

        <button
          type="button"
          onClick={() =>
            updateParams({ overdue: searchParams.get("overdue") ? "" : "1" })
          }
          className={`shrink-0 rounded-lg border px-4 text-sm font-medium transition-colors ${
            searchParams.get("overdue")
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          style={{ minHeight: 44 }}
        >
          Overdue only
        </button>

        <Link
          href="/leads/new"
          className="ml-auto inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
          style={{ minHeight: 44 }}
        >
          <Icon name="plus" className="h-4 w-4" />
          Add Lead
        </Link>
      </div>
    </motion.div>
  );
}
