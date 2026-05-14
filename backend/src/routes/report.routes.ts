import { Router } from "express";
import { z } from "zod";
import { createFreeReportController, getReportsController } from "../controllers/report.controller";
import { requireAdminKey } from "../middleware/admin-key";
import { validateBody } from "../middleware/validate";

const freeReportSchema = z.object({
  city: z.string().min(2, "city is required"),
  foodType: z.string().min(2, "foodType is required")
});

export const reportRouter = Router();

reportRouter.post("/report/free", validateBody(freeReportSchema), createFreeReportController);
reportRouter.get("/reports", requireAdminKey, getReportsController);
