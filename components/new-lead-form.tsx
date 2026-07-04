"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createLead, type CreateLeadState } from "@/app/(app)/leads/actions";
import { inputClass } from "@/lib/ui";
import { fadeInUp, staggerContainer } from "@/lib/motion";
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <motion.div variants={fadeInUp}>{children}</motion.div>;
}

export function NewLeadForm({
  agents,
}: {
  agents: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<CreateLeadState, FormData>(
    createLead,
    undefined
  );

  return (
    <motion.form
      action={formAction}
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <Section>
        <Field label="Name">
          <input name="name" required autoFocus className={inputClass} />
        </Field>
      </Section>

      <Section>
        <Field label="Organisation">
          <input name="organisation" className={inputClass} />
        </Field>
      </Section>

      <Section>
        <Field label="Agent">
          <select name="agent_id" defaultValue="" className={`${inputClass} bg-white`}>
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Email">
            <input name="email" type="email" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" className={inputClass} />
          </Field>
          <Field label="LinkedIn URL">
            <input name="linkedin_url" className={inputClass} />
          </Field>
          <Field label="Facebook URL">
            <input name="facebook_url" className={inputClass} />
          </Field>
          <Field label="Instagram URL">
            <input name="instagram_url" className={inputClass} />
          </Field>
          <Field label="Website URL">
            <input name="website_url" className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Status">
            <select name="status" defaultValue="New" className={`${inputClass} bg-white`}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select name="priority" defaultValue="Medium" className={`${inputClass} bg-white`}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Next Follow Up">
            <input name="next_follow_up" type="date" className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section>
        <Field label="Notes">
          <textarea name="notes" rows={4} className={inputClass} />
        </Field>
      </Section>

      <AnimatePresence>
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={pending}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60 md:w-auto md:px-8"
        style={{ minHeight: 44 }}
      >
        {!pending && <Icon name="plus" className="h-4 w-4" />}
        {pending ? "Creating..." : "Create lead"}
      </motion.button>
    </motion.form>
  );
}
