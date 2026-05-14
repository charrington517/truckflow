import { randomUUID } from "node:crypto";
import { getDb } from "./db.service";
import type { ReportFeedback, ReportFeedbackInput, ReportFeedbackIssueType } from "../types/reportFeedback";

type FeedbackRow = {
  id: string;
  reportId: string;
  rating: number | null;
  issueType: ReportFeedbackIssueType | null;
  notes: string | null;
  createdAt: string;
};

function rowToFeedback(row: FeedbackRow): ReportFeedback {
  return {
    id: row.id,
    reportId: row.reportId,
    rating: row.rating ?? undefined,
    issueType: row.issueType ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
  };
}

export function saveReportFeedback(reportId: string, input: ReportFeedbackInput): ReportFeedback {
  const feedback: ReportFeedback = {
    id: randomUUID(),
    reportId,
    rating: input.rating,
    issueType: input.issueType,
    notes: input.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(`
      INSERT INTO report_feedback (
        id, reportId, rating, issueType, notes, createdAt
      ) VALUES (
        @id, @reportId, @rating, @issueType, @notes, @createdAt
      )
    `)
    .run({
      id: feedback.id,
      reportId: feedback.reportId,
      rating: feedback.rating ?? null,
      issueType: feedback.issueType ?? null,
      notes: feedback.notes ?? null,
      createdAt: feedback.createdAt,
    });

  return feedback;
}

export function getReportFeedback(): ReportFeedback[] {
  const rows = getDb()
    .prepare("SELECT id, reportId, rating, issueType, notes, createdAt FROM report_feedback ORDER BY datetime(createdAt) DESC")
    .all() as FeedbackRow[];

  return rows.map(rowToFeedback);
}
