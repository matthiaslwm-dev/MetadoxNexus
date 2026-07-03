import {
  LEAD_SCORE_BANDS,
  PRIORITY_BANDS,
  SCORING_RULES,
} from "@/lib/signal-feed/scoring-config";
import type {
  SignalConfidence,
  SignalOpportunityLevel,
  SignalOpportunityType,
  SignalPriority,
} from "@/lib/supabase/types";

const RULE_LABEL_BY_ID = new Map(SCORING_RULES.map((rule) => [rule.id, rule.label]));

// rule id -> opportunity type, first match in matchedRuleIds order wins.
const OPPORTUNITY_TYPE_BY_RULE: Record<string, SignalOpportunityType> = {
  looking_for_opportunities: "Career Opportunity",
  career_frustration: "Career Opportunity",
  promotion_frustration: "Career Opportunity",
  job_security: "Recruitment",
  wants_business: "Business Opportunity",
  scaling_cashflow: "Business Opportunity",
  sales_pipeline_problems: "Business Opportunity",
  poor_conversion: "Business Opportunity",
  networking_mindset: "Networking",
  learning_ai: "AI Consulting",
  higher_income_side_income: "Referral",
};

const NEED_BY_PAIN_CATEGORY: Record<string, string> = {
  Burnout: "support to avoid burnout",
  "Career Change": "guidance on a career change",
  "Promotion Frustration": "career growth opportunities",
  "Job Security": "more stable career options",
  "AI Job Fear": "AI upskilling",
  "Income Pain": "additional income sources",
  Debt: "financial planning support",
  "Financial Stress": "financial stability",
  "Higher Income": "higher-paying opportunities",
  "Side Income": "side income streams",
  "Sales Pipeline": "lead generation support",
  "No Leads": "lead generation",
  "Prospecting Problems": "sales training",
  "Poor Conversion": "sales training",
  "Commission Drop": "a better commission structure",
  "Wants Business": "business growth support",
  Scaling: "business scaling support",
  Marketing: "marketing help",
  "Cash Flow": "cash flow management",
  Freedom: "more flexible work arrangements",
  "Flexible Lifestyle": "more flexible work arrangements",
  Entrepreneurship: "entrepreneurship support",
  Networking: "networking connections",
  "Learning AI": "AI training",
  Other: "general opportunity discovery",
};

export class RecommendationService {
  deriveConfidence(matchedRuleIds: string[], postText: string): SignalConfidence {
    if (matchedRuleIds.length >= 3 && postText.length > 120) return "High";
    if (matchedRuleIds.length >= 1) return "Medium";
    return "Low";
  }

  deriveOpportunityLevel(leadScore: number): SignalOpportunityLevel {
    if (leadScore >= LEAD_SCORE_BANDS.HIGH_MIN) return "High";
    if (leadScore >= LEAD_SCORE_BANDS.MEDIUM_MIN) return "Medium";
    return "Low";
  }

  derivePriority(leadScore: number): SignalPriority {
    if (leadScore >= PRIORITY_BANDS.HOT_MIN) return "Hot";
    if (leadScore >= PRIORITY_BANDS.WARM_MIN) return "Warm";
    return "Cold";
  }

  deriveOpportunityType(matchedRuleIds: string[]): SignalOpportunityType {
    for (const id of matchedRuleIds) {
      const type = OPPORTUNITY_TYPE_BY_RULE[id];
      if (type) return type;
    }
    return "Other";
  }

  buildRecommendedAction(
    opportunityType: SignalOpportunityType,
    priority: SignalPriority
  ): string {
    if (priority === "Hot") {
      return `Reach out within 24 hours - high probability of reply for a ${opportunityType.toLowerCase()}.`;
    }
    if (priority === "Warm") {
      return `Monitor and reach out this week about a ${opportunityType.toLowerCase()}.`;
    }
    return "Save only and monitor for further signals.";
  }

  buildWhyThisIsASignal(matchedRuleIds: string[], painCategories: string[]): string {
    const relevantIds = matchedRuleIds.filter((id) => id !== "recent_activity");
    const topLabel = relevantIds
      .map((id) => RULE_LABEL_BY_ID.get(id))
      .find((label): label is string => Boolean(label));

    if (topLabel) {
      return `Posted about ${topLabel}.`;
    }
    if (painCategories.length > 0) {
      return `Expressed signs of ${painCategories[0].toLowerCase()}.`;
    }
    return "Publicly shared a post that may indicate an emerging opportunity.";
  }

  buildPotentialNeeds(painCategories: string[]): string {
    const needs = painCategories
      .map((category) => NEED_BY_PAIN_CATEGORY[category])
      .filter((need): need is string => Boolean(need));
    const unique = [...new Set(needs)];
    return unique.length > 0
      ? unique.map((need) => need[0].toUpperCase() + need.slice(1)).join(", ")
      : "General opportunity discovery";
  }

  buildAiReasoning(
    leadScore: number,
    intentScore: number,
    matchedRuleIds: string[]
  ): string {
    const relevantIds = matchedRuleIds.filter((id) => id !== "recent_activity");
    const labels = relevantIds
      .map((id) => RULE_LABEL_BY_ID.get(id))
      .filter((label): label is string => Boolean(label));

    if (labels.length === 0) {
      return `No strong signal keywords matched. Lead score ${leadScore}/100, intent score ${intentScore}/100.`;
    }

    return `Matched signals for ${labels.join(", ")}, producing a lead score of ${leadScore}/100 and an intent score of ${intentScore}/100.`;
  }

  buildPainSummary(postText: string, painCategories: string[]): string {
    const trimmed = postText.trim();
    const excerpt = trimmed.length > 140 ? `${trimmed.slice(0, 140)}...` : trimmed;
    const topCategory = painCategories[0];
    return topCategory && topCategory !== "Other"
      ? `${topCategory}: ${excerpt}`
      : excerpt;
  }

  buildSuggestedOpeners(
    displayName: string,
    painCategories: string[],
    opportunityType: SignalOpportunityType
  ): string[] {
    const firstName = displayName.split(" ")[0] || displayName;
    const painPhrase = (NEED_BY_PAIN_CATEGORY[painCategories[0]] ?? "new opportunities").toLowerCase();

    return [
      `Hey ${firstName}, saw your post and it really resonated - would love to connect if you're open to it!`,
      `Hi ${firstName}, I came across your post about ${painPhrase}. I work in ${opportunityType.toLowerCase()} and thought it might be worth a quick chat.`,
      `Hi ${firstName}, curious to hear more about what you're going through - what's been the biggest challenge so far?`,
      `Hi ${firstName}, always keen to expand my network with people thinking about ${painPhrase}. Open to connecting?`,
    ];
  }
}
