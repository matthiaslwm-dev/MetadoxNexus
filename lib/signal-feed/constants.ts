import type { SignalFeedStatus, SignalOpportunityType } from "@/lib/supabase/types";

// Extensible list of known platforms for the UI dropdown only - the
// database column is free text, so adding a new platform here never
// requires a migration.
export const PLATFORMS = ["LinkedIn", "Facebook", "Instagram"] as const;

export const PAIN_CATEGORY_GROUPS: Record<string, string[]> = {
  Career: [
    "Burnout",
    "Career Change",
    "Promotion Frustration",
    "Job Security",
    "AI Job Fear",
  ],
  Financial: [
    "Income Pain",
    "Debt",
    "Financial Stress",
    "Higher Income",
    "Side Income",
  ],
  Sales: [
    "Sales Pipeline",
    "No Leads",
    "Prospecting Problems",
    "Poor Conversion",
    "Commission Drop",
  ],
  Business: ["Wants Business", "Scaling", "Marketing", "Cash Flow"],
  Lifestyle: [
    "Freedom",
    "Flexible Lifestyle",
    "Entrepreneurship",
    "Networking",
    "Learning AI",
  ],
  Other: ["Other"],
};

export const PAIN_CATEGORIES = Object.values(PAIN_CATEGORY_GROUPS).flat();

export const OPPORTUNITY_TYPES: SignalOpportunityType[] = [
  "Career Opportunity",
  "Business Opportunity",
  "Recruitment",
  "AI Consulting",
  "Networking",
  "Partnership",
  "Referral",
  "Investment",
  "Other",
];

export const SIGNAL_STATUSES: SignalFeedStatus[] = [
  "New",
  "Reviewed",
  "Saved",
  "Dismissed",
  "Not Applicable",
];
