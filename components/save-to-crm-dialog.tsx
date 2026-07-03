"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { saveToCrm, type SaveToCrmState } from "@/app/(app)/signal-feed/actions";
import { inputClass, primaryButtonClass } from "@/lib/ui";

export function SaveToCrmDialog({
  open,
  signalId,
  onClose,
}: {
  open: boolean;
  signalId: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<SaveToCrmState, FormData>(
    saveToCrm.bind(null, signalId),
    undefined
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg"
          >
            <h2 className="text-base font-semibold text-gray-900">Save to CRM</h2>
            <p className="mt-2 text-sm text-gray-500">
              This will create a new lead from this signal, preserving the original post,
              pain summary, and source link.
            </p>

            {state?.leadId ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  Lead created successfully.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <Link
                    href={`/leads/${state.leadId}`}
                    className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    View Lead
                  </Link>
                </div>
              </div>
            ) : (
              <form action={formAction} className="mt-4 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    Organisation (optional)
                  </span>
                  <input name="organisation" className={inputClass} />
                </label>

                {state?.error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {state.error}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={pending}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className={`${primaryButtonClass} px-4 py-2 text-sm`}
                  >
                    {pending ? "Saving..." : "Save to CRM"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
