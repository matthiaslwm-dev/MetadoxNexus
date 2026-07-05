import type {
  SignalConfidence,
  SignalOpportunityLevel,
  SignalOpportunityType,
  SignalPriority,
} from "@/lib/supabase/types";

// Input a SignalSource or manual-add/CSV flow provides to SignalAnalysisService.
export type RawSignalInput = {
  platform: string;
  display_name: string;
  username?: string | null;
  avatar_url?: string | null;
  profile_url?: string | null;
  post_url?: string | null;
  post_text: string;
  post_date?: string | null;
  location?: string | null;
};

// Output of SignalAnalysisService.analyze() - everything the mock "AI" derives
// from a RawSignalInput, ready to be persisted alongside it.
export type ScoredSignal = {
  pain_summary: string;
  pain_categories: string[];
  lead_score: number;
  intent_score: number;
  confidence_level: SignalConfidence;
  opportunity_level: SignalOpportunityLevel;
  priority: SignalPriority;
  opportunity_type: SignalOpportunityType;
  why_this_is_a_signal: string;
  potential_needs: string;
  ai_reasoning: string;
  suggested_openers: string[];
  recommended_action: string;
};
