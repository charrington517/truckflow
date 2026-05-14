export type OpportunityScores = {
  demandScore: number;
  competitionScore: number;
  eventPotentialScore: number;
  menuGapScore: number;
  revenueBoostScore: number;
  finalScore: number;
};

export type AiNarrative = {
  enabled: boolean;
  executiveSummary?: string;
  recommendations?: string[];
  risks?: string[];
  nextSteps?: string[];
};

export type MarketResearch = {
  enabled: boolean;
  sources: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  signals: {
    competitorMentions: number;
    menuMentions: string[];
    opportunityGaps: string[];
    reviewSignals: string[];
  };
  summary: string;
};

export type FlowEventOpportunity = {
  id: string;
  title: string;
  type: string;
  score: number;
  status: string;
  reason: string;
  suggestedAction: string;
  typicalLeadTime: string;
  source: "model" | "firecrawl";
  url?: string;
};

export type FlowEventsResult = {
  opportunities: FlowEventOpportunity[];
  summary: string;
};

export type FreeReport = {
  city: string;
  foodType: string;
  bestSpot: {
    name: string;
    timeWindow: string;
    reason: string;
    score: number;
  };
  menuOpportunity: {
    item: string;
    reason: string;
    confidence: number;
  };
  eventOpportunity: {
    name: string;
    status: string;
    reason: string;
  };
  boostIdea: {
    promo: string;
    expectedLift: string;
  };
  scores?: OpportunityScores;
  summary?: string;
  research?: MarketResearch;
  aiNarrative?: AiNarrative;
  flowEvents?: FlowEventsResult;
};

export type ReportActivity = {
  id: string;
  city: string;
  foodType: string;
  report: FreeReport;
  createdAt: string;
  userAgent?: string;
  ip?: string;
};
