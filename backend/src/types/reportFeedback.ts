export const reportFeedbackIssueTypes = [
  "inaccurate_location",
  "fake_specific_claim",
  "repetitive_answer",
  "weak_recommendation",
  "wrong_food_type",
  "missing_nearby_market",
  "other"
] as const;

export type ReportFeedbackIssueType = (typeof reportFeedbackIssueTypes)[number];

export type ReportFeedbackInput = {
  rating?: number;
  issueType?: ReportFeedbackIssueType;
  notes?: string;
};

export type ReportFeedback = {
  id: string;
  reportId: string;
  rating?: number;
  issueType?: ReportFeedbackIssueType;
  notes?: string;
  createdAt: string;
};
