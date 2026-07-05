"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateLead, type UpdateLeadState } from "@/app/(app)/leads/actions";
import type { Lead } from "@/lib/supabase/types";
import { inputClass, normalizeUrl } from "@/lib/ui";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Icon } from "@/components/icons";
import { SocialFinder } from "@/components/social-finder";

const STATUSES = [
  "New",
  "Shortlisted",
  "Connected",
  "Contacted",
  "Meeting Booked",
  "Won",
  "Lost",
  "Not Applicable",
];
const PRIORITIES = ["High", "Medium", "Low"];

function Field({
  label,
  children,
  action,
  onClear,
  finder,
}: {
  label: string;
  children: React.ReactNode;
  action?: { href: string; icon: "phone" | "mail" | "externalLink"; label: string };
  onClear?: () => void;
  finder?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          {finder}
          {action && (
            <a
              href={action.href}
              target={action.icon === "externalLink" ? "_blank" : undefined}
              rel={action.icon === "externalLink" ? "noopener noreferrer" : undefined}
              aria-label={action.label}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon name={action.icon} className="h-4 w-4" />
            </a>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <motion.div variants={fadeInUp}>{children}</motion.div>;
}

export function LeadDetailForm({
  lead,
  organisationName,
  agents,
}: {
  lead: Lead;
  organisationName: string;
  agents: { id: string; name: string }[];
}) {
  const updateLeadWithId = updateLead.bind(null, lead.id);
  const [state, formAction, pending] = useActionState<
    UpdateLeadState,
    FormData
  >(updateLeadWithId, undefined);

  const [nextFollowUp, setNextFollowUp] = useState(lead.next_follow_up ?? "");
  const [nameValue, setNameValue] = useState(lead.name);
  const [organisationValue, setOrganisationValue] = useState(organisationName);
  const [linkedinUrl, setLinkedinUrl] = useState(lead.linkedin_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(lead.instagram_url ?? "");

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
          <input
            name="name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
      </Section>

      <Section>
        <Field label="Organisation">
          <input
            name="organisation"
            value={organisationValue}
            onChange={(e) => setOrganisationValue(e.target.value)}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section>
        <Field label="Agent">
          <select
            name="agent_id"
            defaultValue={lead.agent_id ?? ""}
            className={`${inputClass} bg-white`}
          >
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
          <Field
            label="Email"
            action={lead.email ? { href: `mailto:${lead.email}`, icon: "mail", label: "Send email" } : undefined}
          >
            <input
              name="email"
              type="email"
              defaultValue={lead.email ?? ""}
              className={inputClass}
            />
          </Field>
          <Field
            label="Phone"
            action={lead.phone ? { href: `tel:${lead.phone}`, icon: "phone", label: "Call" } : undefined}
          >
            <input
              name="phone"
              defaultValue={lead.phone ?? ""}
              className={inputClass}
            />
          </Field>
          <Field
            label="LinkedIn URL"
            action={
              linkedinUrl
                ? { href: normalizeUrl(linkedinUrl), icon: "externalLink", label: "Open LinkedIn" }
                : undefined
            }
            finder={
              <SocialFinder
                name={nameValue}
                organisationName={organisationValue}
                platform="linkedin"
                onSelect={setLinkedinUrl}
              />
            }
          >
            <input
              name="linkedin_url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Facebook URL"
            action={
              lead.facebook_url
                ? { href: normalizeUrl(lead.facebook_url), icon: "externalLink", label: "Open Facebook" }
                : undefined
            }
          >
            <input
              name="facebook_url"
              defaultValue={lead.facebook_url ?? ""}
              className={inputClass}
            />
          </Field>
          <Field
            label="Instagram URL"
            action={
              instagramUrl
                ? { href: normalizeUrl(instagramUrl), icon: "externalLink", label: "Open Instagram" }
                : undefined
            }
            finder={
              <SocialFinder
                name={nameValue}
                organisationName={organisationValue}
                platform="instagram"
                onSelect={setInstagramUrl}
              />
            }
          >
            <input
              name="instagram_url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Website URL"
            action={
              lead.website_url
                ? { href: normalizeUrl(lead.website_url), icon: "externalLink", label: "Open website" }
                : undefined
            }
          >
            <input
              name="website_url"
              defaultValue={lead.website_url ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Status">
            <select
              name="status"
              defaultValue={lead.status}
              className={`${inputClass} bg-white`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              name="priority"
              defaultValue={lead.priority}
              className={`${inputClass} bg-white`}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Next Follow Up"
            onClear={nextFollowUp ? () => setNextFollowUp("") : undefined}
          >
            <input
              name="next_follow_up"
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section>
        <Field label="Notes">
          <textarea
            name="notes"
            defaultValue={lead.notes ?? ""}
            rows={4}
            className={inputClass}
          />
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

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-gray-200 bg-white/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <motion.button
          type="submit"
          disabled={pending}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-base font-medium text-white shadow-sm transition-opacity disabled:opacity-60 md:w-auto md:px-8"
          style={{ minHeight: 44 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {pending ? (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                />
                Saving...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Save changes
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.form>
  );
}
