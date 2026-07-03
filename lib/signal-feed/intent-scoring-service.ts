import { SCORING_RULES } from "@/lib/signal-feed/scoring-config";
import { clamp } from "@/lib/signal-feed/utils";

const OUTREACH_PHRASES = /\b(dm me|message me|reach out|contact me|let's talk)\b/;

// Intent is distinct from lead_score: it measures how likely this person is
// to be *actively seeking change* right now, vs. simply venting about a
// pain point. A high pain-score post that isn't about seeking change should
// still score lower on intent.
export class IntentScoringService {
  score(input: { post_text: string }, matchedRuleIds: string[]): number {
    const text = input.post_text.toLowerCase();
    let intent = 0;

    for (const rule of SCORING_RULES) {
      if (matchedRuleIds.includes(rule.id)) {
        intent += rule.intentWeight ?? Math.round(rule.weight * 0.6);
      }
    }

    if (OUTREACH_PHRASES.test(text)) {
      intent += 10;
    }

    return clamp(intent, 0, 100);
  }
}
