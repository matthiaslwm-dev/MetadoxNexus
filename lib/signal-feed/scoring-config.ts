// Data-only scoring configuration for the mock AI analysis engine.
// Retuning the heuristic (Phase 1, no real LLM) means editing this file only
// - no logic changes needed elsewhere.

export type KeywordRule = {
  id: string;
  label: string;
  keywords: string[];
  weight: number;
  intentWeight?: number;
  painCategories?: string[];
};

export const SCORING_RULES: KeywordRule[] = [
  {
    id: "looking_for_opportunities",
    label: "looking for new opportunities",
    keywords: [
      "looking for opportunities",
      "open to opportunities",
      "open to work",
      "seeking new role",
      "seeking a new role",
    ],
    weight: 30,
    intentWeight: 35,
    painCategories: ["Career Change"],
  },
  {
    id: "income_frustration",
    label: "income frustration",
    keywords: [
      "not making enough",
      "need more income",
      "struggling financially",
      "living paycheck to paycheck",
      "can't afford",
    ],
    weight: 20,
    painCategories: ["Income Pain", "Financial Stress"],
  },
  {
    id: "career_frustration",
    label: "career frustration",
    keywords: [
      "hate my job",
      "burnt out",
      "burned out",
      "want a career change",
      "stuck in my career",
      "no growth",
    ],
    weight: 15,
    painCategories: ["Burnout", "Career Change"],
  },
  {
    id: "sales_pipeline_problems",
    label: "sales pipeline problems",
    keywords: [
      "no leads",
      "pipeline is dry",
      "prospecting is hard",
      "can't find clients",
      "sales are down",
    ],
    weight: 20,
    painCategories: ["No Leads", "Sales Pipeline", "Prospecting Problems"],
  },
  {
    id: "burnout",
    label: "burnout",
    keywords: ["exhausted", "overworked", "need a break", "burnout"],
    weight: 10,
    painCategories: ["Burnout"],
  },
  {
    id: "networking_mindset",
    label: "networking mindset",
    keywords: [
      "let's connect",
      "open to connecting",
      "always happy to network",
      "expanding my network",
    ],
    weight: 10,
    painCategories: ["Networking"],
  },
  {
    id: "debt_stress",
    label: "debt stress",
    keywords: ["drowning in debt", "credit card debt", "in debt"],
    weight: 15,
    painCategories: ["Debt", "Financial Stress"],
  },
  {
    id: "job_security",
    label: "job security worries",
    keywords: ["got laid off", "worried about layoffs", "job security"],
    weight: 15,
    painCategories: ["Job Security"],
  },
  {
    id: "ai_job_fear",
    label: "AI job fear",
    keywords: [
      "ai is taking my job",
      "worried about ai replacing",
      "afraid of ai",
    ],
    weight: 15,
    painCategories: ["AI Job Fear"],
  },
  {
    id: "wants_business",
    label: "wants to start a business",
    keywords: [
      "want to start a business",
      "thinking of starting my own",
      "side hustle idea",
    ],
    weight: 20,
    painCategories: ["Wants Business", "Entrepreneurship"],
  },
  {
    id: "scaling_cashflow",
    label: "scaling / cash flow problems",
    keywords: [
      "scaling my business",
      "cash flow problems",
      "cashflow issues",
    ],
    weight: 15,
    painCategories: ["Scaling", "Cash Flow"],
  },
  {
    id: "lifestyle_freedom",
    label: "wants more freedom",
    keywords: [
      "want more freedom",
      "flexible lifestyle",
      "tired of the 9 to 5",
      "9-5",
    ],
    weight: 10,
    painCategories: ["Freedom", "Flexible Lifestyle"],
  },
  {
    id: "learning_ai",
    label: "learning AI",
    keywords: ["learning ai", "want to learn ai", "upskilling in ai"],
    weight: 10,
    painCategories: ["Learning AI"],
  },
  {
    id: "promotion_frustration",
    label: "promotion frustration",
    keywords: [
      "passed over for promotion",
      "denied a promotion",
      "no path to promotion",
    ],
    weight: 15,
    painCategories: ["Promotion Frustration"],
  },
  {
    id: "poor_conversion",
    label: "poor conversion / commission drop",
    keywords: [
      "conversion rate is down",
      "commission dropped",
      "commissions are down",
    ],
    weight: 15,
    painCategories: ["Poor Conversion", "Commission Drop"],
  },
  {
    id: "higher_income_side_income",
    label: "wants higher / side income",
    keywords: [
      "looking for a side income",
      "want higher income",
      "extra income stream",
    ],
    weight: 15,
    painCategories: ["Higher Income", "Side Income"],
  },
  {
    id: "marketing_struggles",
    label: "marketing struggles",
    keywords: ["marketing isn't working", "struggling with marketing"],
    weight: 10,
    painCategories: ["Marketing"],
  },
];

export const RECENT_ACTIVITY_WINDOW_DAYS = 7;
export const RECENT_ACTIVITY_BONUS = 5;

export const LEAD_SCORE_BANDS = { HIGH_MIN: 91, MEDIUM_MIN: 60 };
export const PRIORITY_BANDS = { HOT_MIN: 91, WARM_MIN: 60 };
