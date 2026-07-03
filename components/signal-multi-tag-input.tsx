"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { inputClass } from "@/lib/ui";

// Generic tag/chip input for array fields (e.g. pain_categories,
// suggested_openers). Not wired into the Phase 1 create form - those fields
// are always AI-derived - but available for a future edit-signal flow.
export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence initial={false}>
          {value.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-400 hover:text-gray-700"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <input
        list="tag-suggestions"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(draft);
          }
        }}
        onBlur={() => draft && addTag(draft)}
        placeholder={placeholder ?? "Type and press Enter"}
        className={inputClass}
      />
      {suggestions.length > 0 && (
        <datalist id="tag-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
