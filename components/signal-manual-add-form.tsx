"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSignal, type CreateSignalState } from "@/app/(app)/signal-feed/actions";
import { PLATFORMS } from "@/lib/signal-feed/constants";
import { inputClass } from "@/lib/ui";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Icon } from "@/components/icons";

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

export function SignalManualAddForm() {
  const [state, formAction, pending] = useActionState<CreateSignalState, FormData>(
    createSignal,
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Platform">
            <select name="platform" required defaultValue="LinkedIn" className={`${inputClass} bg-white`}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Display Name">
            <input name="display_name" required autoFocus className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Username">
            <input name="username" className={inputClass} />
          </Field>
          <Field label="Post Date">
            <input name="post_date" type="date" className={inputClass} />
          </Field>
          <Field label="Profile URL">
            <input name="profile_url" className={inputClass} />
          </Field>
          <Field label="Post URL">
            <input name="post_url" className={inputClass} />
          </Field>
          <Field label="Location">
            <input name="location" placeholder="e.g. Singapore" className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section>
        <Field label="Post Text">
          <textarea name="post_text" required rows={6} className={inputClass} />
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
        {!pending && <Icon name="sparkles" className="h-4 w-4" />}
        {pending ? "Analyzing..." : "Add Signal"}
      </motion.button>
    </motion.form>
  );
}
