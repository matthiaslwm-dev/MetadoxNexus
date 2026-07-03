"use client";

import { useState, useTransition } from "react";
import {
  findSocialCandidates,
  type SocialCandidate,
} from "@/app/(app)/leads/actions";
import { Icon } from "@/components/icons";

export function SocialFinder({
  name,
  organisationName,
  platform,
  onSelect,
}: {
  name: string;
  organisationName: string;
  platform: "linkedin" | "instagram";
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [candidates, setCandidates] = useState<SocialCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSearch() {
    setOpen(true);
    setError(null);
    startTransition(async () => {
      const result = await findSocialCandidates(name, organisationName, platform);
      if (result.error) {
        setError(result.error);
        setCandidates(null);
      } else {
        setCandidates(result.candidates ?? []);
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSearch}
        aria-label={`Search Google for ${platform === "linkedin" ? "LinkedIn" : "Instagram"} profile`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Icon name="search" className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-80 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-gray-500">Google results</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          {pending && <div className="px-2 py-3 text-sm text-gray-400">Searching…</div>}

          {!pending && error && (
            <div className="px-2 py-3 text-sm text-red-600">{error}</div>
          )}

          {!pending && !error && candidates && candidates.length === 0 && (
            <div className="px-2 py-3 text-sm text-gray-400">No results found.</div>
          )}

          {!pending &&
            !error &&
            candidates?.map((c) => (
              <button
                key={c.link}
                type="button"
                onClick={() => {
                  onSelect(c.link);
                  setOpen(false);
                }}
                className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-gray-50"
              >
                <div className="truncate font-medium text-gray-900">{c.title}</div>
                <div className="truncate text-xs text-gray-400">{c.link}</div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
