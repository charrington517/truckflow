import type { Request, Response } from "express";
import { getReportFeedback, saveReportFeedback } from "../services/reportFeedback.service";
import type { ReportFeedbackInput } from "../types/reportFeedback";

export function createReportFeedbackController(req: Request, res: Response) {
  const feedback = saveReportFeedback(String(req.params.id), req.body as ReportFeedbackInput);
  res.status(201).json(feedback);
}

export function getReportFeedbackController(_req: Request, res: Response) {
  res.json(getReportFeedback());
}
