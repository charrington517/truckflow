export type DemandLevel = "low" | "medium" | "high";
export type CompetitionLevel = "low" | "medium" | "high";
export type EvidenceLevel = "verified" | "nearby" | "model" | "low_confidence";

export type OsmQueryType =
  | "brewery"
  | "restaurant"
  | "event_space"
  | "park"
  | "market"
  | "industrial"
  | "college"
  | "tourism";

export type LocalDataPlace = {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  tags: Record<string, string>;
  source: "openstreetmap";
};

export type LocalDataCheck = {
  queryType: OsmQueryType;
  resultCount: number;
  topPlaces: LocalDataPlace[];
  summary: string;
};

export type LocalDataResult = {
  enabled: true;
  sources: ["openstreetmap"];
  checks: LocalDataCheck[];
  summary: string;
};

export type NearbyMarket = {
  city: string;
  distanceMiles: number;
  reason: string;
  strongestOpportunityTypes: string[];
};

export type NearbyRecommendation = {
  city: string;
  distanceMiles: number;
  title: string;
  reason: string;
  strongestOpportunityTypes: string[];
  recommendation: string;
  evidenceLevel: EvidenceLevel;
  evidenceNotes: string[];
};

export type NearbyExpansionResult = {
  usedNearbyExpansion: boolean;
  nearbyMarkets: NearbyMarket[];
  recommendations: NearbyRecommendation[];
};

export type HotspotLocation = {
  name: string;
  latitude: number;
  longitude: number;
  score: number;
  demandLevel: DemandLevel;
  competitionLevel: CompetitionLevel;
  recommendation: string;
};

export type FreeReportRequest = {
  city: string;
  foodType: string;
};

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
  evidenceLevel: EvidenceLevel;
  evidenceNotes: string[];
  url?: string;
};

export type FlowEventsResult = {
  opportunities: FlowEventOpportunity[];
  summary: string;
  nearbyExpansion?: NearbyExpansionResult;
};

export type FreeReport = {
  city: string;
  foodType: string;
  bestSpot: {
    name: string;
    timeWindow: string;
    reason: string;
    score: number;
    evidenceLevel?: EvidenceLevel;
    evidenceNotes?: string[];
  };
  menuOpportunity: {
    item: string;
    reason: string;
    confidence: number;
    evidenceLevel?: EvidenceLevel;
    evidenceNotes?: string[];
  };
  eventOpportunity: {
    name: string;
    status: string;
    reason: string;
    evidenceLevel?: EvidenceLevel;
    evidenceNotes?: string[];
  };
  boostIdea: {
    promo: string;
    expectedLift: string;
    evidenceLevel?: EvidenceLevel;
    evidenceNotes?: string[];
  };
  scores?: OpportunityScores;
  summary?: string;
  research?: MarketResearch;
  localData?: LocalDataResult;
  nearbyExpansion?: NearbyExpansionResult;
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
