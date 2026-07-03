import { ScoringService } from "@/lib/signal-feed/scoring-service";
import { IntentScoringService } from "@/lib/signal-feed/intent-scoring-service";
import { RecommendationService } from "@/lib/signal-feed/recommendation-service";
import type { RawSignalInput, ScoredSignal } from "@/lib/signal-feed/types";

// Mock "AI" orchestrator: the single seam where a real LLM-backed analysis
// call would replace the deterministic heuristics below. Callers only ever
// depend on `analyze()`'s signature, never its internals.
export class SignalAnalysisService {
  constructor(
    private scoring = new ScoringService(),
    private intentScoring = new IntentScoringService(),
    private recommendation = new RecommendationService()
  ) {}

  analyze(input: RawSignalInput): ScoredSignal {
    const { lead_score, matchedRuleIds, matchedPainCategories } = this.scoring.score({
      post_text: input.post_text,
      post_date: input.post_date,
    });
    const intent_score = this.intentScoring.score(
      { post_text: input.post_text },
      matchedRuleIds
    );
    const confidence_level = this.recommendation.deriveConfidence(
      matchedRuleIds,
      input.post_text
    );
    const opportunity_level = this.recommendation.deriveOpportunityLevel(lead_score);
    const priority = this.recommendation.derivePriority(lead_score);
    const opportunity_type = this.recommendation.deriveOpportunityType(matchedRuleIds);
    const pain_categories = matchedPainCategories.length > 0 ? matchedPainCategories : ["Other"];

    return {
      pain_summary: this.recommendation.buildPainSummary(input.post_text, pain_categories),
      pain_categories,
      lead_score,
      intent_score,
      confidence_level,
      opportunity_level,
      priority,
      opportunity_type,
      why_this_is_a_signal: this.recommendation.buildWhyThisIsASignal(
        matchedRuleIds,
        pain_categories
      ),
      potential_needs: this.recommendation.buildPotentialNeeds(pain_categories),
      ai_reasoning: this.recommendation.buildAiReasoning(
        lead_score,
        intent_score,
        matchedRuleIds
      ),
      suggested_openers: this.recommendation.buildSuggestedOpeners(
        input.display_name,
        pain_categories,
        opportunity_type
      ),
      recommended_action: this.recommendation.buildRecommendedAction(
        opportunity_type,
        priority
      ),
    };
  }
}

export const signalAnalysisService = new SignalAnalysisService();
