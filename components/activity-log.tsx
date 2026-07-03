"use client";

import { useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormStatus } from "react-dom";
import { addActivity, logFollowUp } from "@/app/(app)/leads/actions";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Icon } from "@/components/icons";
import type { LeadActivity } from "@/lib/supabase/types";

function AddNoteButton() {
  const { pending } = useFormStatus();
  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileTap={{ scale: 0.97 }}
      className={`shrink-0 px-4 py-3 text-sm ${primaryButtonClass}`}
      style={{ minHeight: 44 }}
    >
      {pending ? "Adding..." : "Add note"}
    </motion.button>
  );
}

const ACTIVITY_LABELS: Record<string, string> = {
  follow_up: "Follow-up",
  status_change: "Status",
  priority_change: "Priority",
};

function LogFollowUpButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; nextFollowUp?: string } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await logFollowUp(leadId);
      setResult(res);
      if (res.success) {
        setTimeout(() => setResult(null), 2500);
      }
    });
  }

  return (
    <div className="mb-4">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={pending}
        whileTap={{ scale: 0.98 }}
        className={`w-full ${secondaryButtonClass}`}
        style={{ minHeight: 44 }}
      >
        <Icon name="calendar" className="mr-2 h-4 w-4" />
        {pending ? "Logging..." : "Log follow-up (+3 days)"}
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-2 overflow-hidden rounded-lg px-3 py-2 text-sm ${
              result.error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
            }`}
          >
            {result.error ?? `Next follow-up set for ${result.nextFollowUp}.`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ActivityLog({
  leadId,
  activities,
}: {
  leadId: string;
  activities: LeadActivity[];
}) {
  const addActivityWithId = addActivity.bind(null, leadId);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-4">
      <LogFollowUpButton leadId={leadId} />

      <form
        ref={formRef}
        action={async (formData) => {
          await addActivityWithId(formData);
          formRef.current?.reset();
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          name="content"
          placeholder="Add a note..."
          required
          className={inputClass}
          style={{ minHeight: 44 }}
        />
        <AddNoteButton />
      </form>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet.</p>
      ) : (
        <motion.ul
          variants={staggerContainer(0.04)}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.li
                key={activity.id}
                layout
                variants={fadeInUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm"
              >
                {ACTIVITY_LABELS[activity.activity_type] && (
                  <span className="mb-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {ACTIVITY_LABELS[activity.activity_type]}
                  </span>
                )}
                <p className="text-gray-900">{activity.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
