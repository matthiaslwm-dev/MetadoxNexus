import {
  RECENT_ACTIVITY_BONUS,
  RECENT_ACTIVITY_WINDOW_DAYS,
  SCORING_RULES,
} from "@/lib/signal-feed/scoring-config";
import { clamp, isWithinDays } from "@/lib/signal-feed/utils";

export type ScoringResult = {
  lead_score: number;
  matchedRuleIds: string[];
  matchedPainCategories: string[];
};

// Deterministic keyword-heuristic scorer standing in for a real AI model.
// Swap the internals of `score()` for a real classifier later without
// touching any caller.
export class ScoringService {
  score(input: { post_text: string; post_date?: string | null }): ScoringResult {
    const text = input.post_text.toLowerCase();
    let score = 0;
    const matchedRuleIds: string[] = [];
    const painCategories = new Set<string>();

    for (const rule of SCORING_RULES) {
      if (rule.keywords.some((keyword) => text.includes(keyword))) {
        score += rule.weight;
        matchedRuleIds.push(rule.id);
        rule.painCategories?.forEach((category) => painCategories.add(category));
      }
    }

    if (input.post_date && isWithinDays(input.post_date, RECENT_ACTIVITY_WINDOW_DAYS)) {
      score += RECENT_ACTIVITY_BONUS;
      matchedRuleIds.push("recent_activity");
    }

    return {
      lead_score: clamp(score, 0, 100),
      matchedRuleIds,
      matchedPainCategories: [...painCategories],
    };
  }
}
