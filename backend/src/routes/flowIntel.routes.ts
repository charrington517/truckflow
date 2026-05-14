import { Router } from "express";
import { z } from "zod";
import {
  createCompetitorController,
  deleteCompetitorController,
  getCompetitorsController,
  scanCompetitorsController,
  updateCompetitorController
} from "../controllers/flowIntel.controller";
import { requireAdminKey } from "../middleware/admin-key";
import { validateBody } from "../middleware/validate";

const scanSchema = z.object({
  city: z.string().trim().min(2, "city is required"),
  foodType: z.string().trim().min(2, "foodType is required")
});

const competitorSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  city: z.string().trim().optional(),
  foodType: z.string().trim().optional(),
  usualLocation: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  website: z.string().trim().optional(),
  socialUrl: z.string().trim().optional(),
  source: z.string().trim().optional(),
  confidence: z.string().trim().optional(),
  stationary: z.boolean().optional(),
  notes: z.string().trim().optional(),
  lastVerifiedAt: z.string().trim().optional()
});

export const flowIntelRouter = Router();

flowIntelRouter.post("/flowintel/scan", validateBody(scanSchema), scanCompetitorsController);
flowIntelRouter.get("/admin/competitors", requireAdminKey, getCompetitorsController);
flowIntelRouter.post("/admin/competitors", requireAdminKey, validateBody(competitorSchema), createCompetitorController);
flowIntelRouter.patch("/admin/competitors/:id", requireAdminKey, validateBody(competitorSchema.partial()), updateCompetitorController);
flowIntelRouter.delete("/admin/competitors/:id", requireAdminKey, deleteCompetitorController);
