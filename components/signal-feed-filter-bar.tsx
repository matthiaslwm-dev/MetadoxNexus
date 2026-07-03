"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { inputClass } from "@/lib/ui";
import { Icon } from "@/components/icons";
import {
  OPPORTUNITY_TYPES,
  PAIN_CATEGORY_GROUPS,
  PLATFORMS,
  SIGNAL_STATUSES,
} from "@/lib/signal-feed/constants";

const PRIORITIES = ["Hot", "Warm", "Cold"];
const CONFIDENCE_LEVELS = ["High", "Medium", "Low"];
const SORT_OPTIONS = [
  { value: "score", label: "Highest Score" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];
const DEBOUNCE_MS = 400;

// Filters beyond search + sort that count toward the "Filters (n)" badge and
// live in the collapsible panel.
const ADVANCED_FILTER_KEYS = [
  "platform",
  "painCategory",
  "opportunityType",
  "priority",
  "confidence",
  "status",
  "minScore",
  "maxScore",
  "minIntent",
  "maxIntent",
  "dateFrom",
  "dateTo",
];

export function SignalFeedFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [minScore, setMinScore] = useState(searchParams.get("minScore") ?? "");
  const [maxScore, setMaxScore] = useState(searchParams.get("maxScore") ?? "");
  const [minIntent, setMinIntent] = useState(searchParams.get("minIntent") ?? "");
  const [maxIntent, setMaxIntent] = useState(searchParams.get("maxIntent") ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFilterCount = ADVANCED_FILTER_KEYS.filter((key) => searchParams.get(key)).length;
  const [expanded, setExpanded] = useState(activeFilterCount > 0);

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

  function clearAdvancedFilters() {
    const params = new URLSearchParams(searchParams.toString());
    ADVANCED_FILTER_KEYS.forEach((key) => params.delete(key));
    params.delete("page");
    setMinScore("");
    setMaxScore("");
    setMinIntent("");
    setMaxIntent("");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="mb-4">
      <motion.div
        animate={{ opacity: isPending ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center"
      >
        <div className="relative w-full sm:max-w-xs">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleDebounced("q", e.target.value);
            }}
            placeholder="Search by name, username, or post..."
            className={`${inputClass} pl-10`}
            style={{ minHeight: 44 }}
          />
        </div>

        <select
          defaultValue={searchParams.get("sort") ?? "score"}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className={`${inputClass} w-full sm:w-auto`}
          style={{ minHeight: 44 }}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors ${
            activeFilterCount > 0
              ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          style={{ minHeight: 44 }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </button>

        <div className="flex gap-2 sm:ml-auto">
          <Link
            href="/signal-feed/import"
            className="inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:flex-none"
            style={{ minHeight: 44 }}
          >
            <Icon name="upload" className="h-4 w-4" />
            Import CSV
          </Link>

          <Link
            href="/signal-feed/new"
            className="inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 sm:flex-none"
            style={{ minHeight: 44 }}
          >
            <Icon name="plus" className="h-4 w-4" />
            Add Signal
          </Link>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <select
                  defaultValue={searchParams.get("platform") ?? ""}
                  onChange={(e) => updateParams({ platform: e.target.value })}
                  className={`${inputClass} w-full sm:w-auto`}
                  style={{ minHeight: 44 }}
                >
                  <option value="">All platforms</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue={searchParams.get("painCategory") ?? ""}
                  onChange={(e) => updateParams({ painCategory: e.target.value })}
                  className={`${inputClass} w-full sm:w-auto`}
                  style={{ minHeight: 44 }}
                >
                  <option value="">All pain categories</option>
                  {Object.entries(PAIN_CATEGORY_GROUPS).map(([group, categories]) => (
                    <optgroup key={group} label={group}>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <select
                  defaultValue={searchParams.get("opportunityType") ?? ""}
                  onChange={(e) => updateParams({ opportunityType: e.target.value })}
                  className={`${inputClass} w-full sm:w-auto`}
                  style={{ minHeight: 44 }}
                >
                  <option value="">All opportunity types</option>
                  {OPPORTUNITY_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
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

                <select
                  defaultValue={searchParams.get("confidence") ?? ""}
                  onChange={(e) => updateParams({ confidence: e.target.value })}
                  className={`${inputClass} w-full sm:w-auto`}
                  style={{ minHeight: 44 }}
                >
                  <option value="">All confidence levels</option>
                  {CONFIDENCE_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue={searchParams.get("status") ?? ""}
                  onChange={(e) => updateParams({ status: e.target.value })}
                  className={`${inputClass} w-full sm:w-auto`}
                  style={{ minHeight: 44 }}
                >
                  <option value="">All statuses</option>
                  {SIGNAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={minScore}
                    onChange={(e) => {
                      setMinScore(e.target.value);
                      handleDebounced("minScore", e.target.value);
                    }}
                    placeholder="Min lead score"
                    className={`${inputClass} w-36`}
                    style={{ minHeight: 44 }}
                  />
                  <span className="text-sm text-gray-400">to</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={maxScore}
                    onChange={(e) => {
                      setMaxScore(e.target.value);
                      handleDebounced("maxScore", e.target.value);
                    }}
                    placeholder="Max lead score"
                    className={`${inputClass} w-36`}
                    style={{ minHeight: 44 }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={minIntent}
                    onChange={(e) => {
                      setMinIntent(e.target.value);
                      handleDebounced("minIntent", e.target.value);
                    }}
                    placeholder="Min intent"
                    className={`${inputClass} w-32`}
                    style={{ minHeight: 44 }}
                  />
                  <span className="text-sm text-gray-400">to</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={maxIntent}
                    onChange={(e) => {
                      setMaxIntent(e.target.value);
                      handleDebounced("maxIntent", e.target.value);
                    }}
                    placeholder="Max intent"
                    className={`${inputClass} w-32`}
                    style={{ minHeight: 44 }}
                  />
                </div>

                <input
                  type="date"
                  defaultValue={searchParams.get("dateFrom") ?? ""}
                  onChange={(e) => updateParams({ dateFrom: e.target.value })}
                  className={`${inputClass} w-auto`}
                  style={{ minHeight: 44 }}
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="date"
                  defaultValue={searchParams.get("dateTo") ?? ""}
                  onChange={(e) => updateParams({ dateTo: e.target.value })}
                  className={`${inputClass} w-auto`}
                  style={{ minHeight: 44 }}
                />

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAdvancedFilters}
                    className="ml-auto shrink-0 text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
