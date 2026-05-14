import { Router } from "express";
import { z } from "zod";
import { createFreeReportController, getReportsController } from "../controllers/report.controller";
import { createReportFeedbackController, getReportFeedbackController } from "../controllers/reportFeedback.controller";
import { requireAdminKey } from "../middleware/admin-key";
import { validateBody } from "../middleware/validate";

const freeReportSchema = z.object({
  city: z.string().min(2, "city is required"),
  foodType: z.string().min(2, "foodType is required")
});

const reportFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  issueType: z.enum([
    "inaccurate_location",
    "fake_specific_claim",
    "repetitive_answer",
    "weak_recommendation",
    "wrong_food_type",
    "missing_nearby_market",
    "other"
  ]).optional(),
  notes: z.string().trim().max(2000).optional()
});

export const reportRouter = Router();

reportRouter.post("/report/free", validateBody(freeReportSchema), createFreeReportController);
reportRouter.get("/reports", requireAdminKey, getReportsController);
reportRouter.get("/reports/feedback", requireAdminKey, getReportFeedbackController);
reportRouter.post("/reports/:id/feedback", requireAdminKey, validateBody(reportFeedbackSchema), createReportFeedbackController);
