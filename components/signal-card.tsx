"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { normalizeUrl, secondaryButtonClass } from "@/lib/ui";
import { Icon } from "@/components/icons";
import {
  ConfidenceBadge,
  OpportunityLevelBadge,
  PlatformBadge,
  SignalPriorityBadge,
  SignalStatusBadge,
} from "@/components/badges";
import { SaveToCrmDialog } from "@/components/save-to-crm-dialog";
import { dismissSignal, markReviewed } from "@/app/(app)/signal-feed/actions";
import type { SignalFeed } from "@/lib/supabase/types";

export function SignalCardList({
  signals,
  resultsKey,
}: {
  signals: SignalFeed[];
  resultsKey: string;
}) {
  return (
    <motion.div
      key={resultsKey}
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      {signals.map((signal) => (
        <motion.div key={signal.id} variants={fadeInUp}>
          <SignalCard signal={signal} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function scoreColor(score: number) {
  if (score >= 91) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-gray-400";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const VISIBLE_PAIN_CATEGORIES = 3;

export function SignalCard({ signal }: { signal: SignalFeed }) {
  const [isPending, startTransition] = useTransition();
  const [saveOpen, setSaveOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  function handleReviewed() {
    startTransition(() => markReviewed(signal.id));
  }

  function handleDismiss() {
    startTransition(() => dismissSignal(signal.id));
  }

  async function handleCopy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1500);
    } catch {
      // clipboard API unavailable - silently ignore, copy is a convenience action
    }
  }

  const initials = signal.display_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hiddenPainCategoryCount = Math.max(
    0,
    signal.pain_categories.length - VISIBLE_PAIN_CATEGORIES
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {signal.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signal.avatar_url}
              alt={signal.display_name}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
              {initials}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{signal.display_name}</p>
            <p className="text-sm text-gray-500">
              {signal.username ? `@${signal.username}` : "—"} · {formatDate(signal.post_date)}
              {signal.location ? ` · ${signal.location}` : ""}
            </p>
          </div>
        </div>
        <PlatformBadge platform={signal.platform} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SignalPriorityBadge priority={signal.priority} />
        <SignalStatusBadge status={signal.status} />
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <span className="text-gray-500">
          Lead score{" "}
          <span className={`font-semibold ${scoreColor(signal.lead_score)}`}>
            {signal.lead_score}
          </span>
        </span>
        <span className="text-gray-500">
          Intent{" "}
          <span className={`font-semibold ${scoreColor(signal.intent_score)}`}>
            {signal.intent_score}
          </span>
        </span>
      </div>

      {signal.pain_categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {signal.pain_categories.slice(0, VISIBLE_PAIN_CATEGORIES).map((category) => (
            <span
              key={category}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
            >
              {category}
            </span>
          ))}
          {hiddenPainCategoryCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">
              +{hiddenPainCategoryCount} more
            </span>
          )}
        </div>
      )}

      {signal.pain_summary && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-700">{signal.pain_summary}</p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        {expanded ? "Hide details" : "View details"}
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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ConfidenceBadge confidence={signal.confidence_level} />
              <OpportunityLevelBadge level={signal.opportunity_level} />
              {signal.opportunity_type && (
                <span className="inline-flex items-center whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/15">
                  {signal.opportunity_type}
                </span>
              )}
            </div>

            <blockquote className="mt-4 border-l-2 border-gray-200 pl-3 text-sm italic text-gray-600">
              &ldquo;{signal.post_text}&rdquo;
            </blockquote>

            {signal.why_this_is_a_signal && (
              <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-700">
                <Icon name="sparkles" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                {signal.why_this_is_a_signal}
              </p>
            )}

            {signal.potential_needs && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium text-gray-900">Potential needs: </span>
                {signal.potential_needs}
              </p>
            )}

            {signal.recommended_action && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium text-gray-900">Recommended action: </span>
                {signal.recommended_action}
              </p>
            )}

            {signal.suggested_openers.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-sm font-medium text-gray-900">Suggested openers</p>
                <ul className="space-y-1.5">
                  {signal.suggested_openers.map((opener, index) => (
                    <li
                      key={index}
                      className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      <span>{opener}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(opener, index)}
                        className="shrink-0 text-gray-400 hover:text-gray-700"
                        aria-label="Copy opener"
                      >
                        {copiedIndex === index ? (
                          <span className="text-xs text-green-600">Copied</span>
                        ) : (
                          <Icon name="copy" className="h-4 w-4" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {signal.profile_url && (
                <a
                  href={normalizeUrl(signal.profile_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButtonClass}
                  style={{ minHeight: 40 }}
                >
                  Open Profile
                </a>
              )}
              {signal.post_url && (
                <a
                  href={normalizeUrl(signal.post_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButtonClass}
                  style={{ minHeight: 40 }}
                >
                  Open Original Post
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
          style={{ minHeight: 40 }}
        >
          Save to CRM
        </button>
        <button
          type="button"
          onClick={handleReviewed}
          disabled={isPending}
          className={secondaryButtonClass}
          style={{ minHeight: 40 }}
        >
          Mark Reviewed
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isPending}
          className={secondaryButtonClass}
          style={{ minHeight: 40 }}
        >
          Dismiss
        </button>
      </div>

      <SaveToCrmDialog
        open={saveOpen}
        signalId={signal.id}
        onClose={() => setSaveOpen(false)}
      />
    </div>
  );
}
