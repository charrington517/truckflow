import { Router } from "express";
import { z } from "zod";
import { checkLocalDataController, mapLocalDataController } from "../controllers/localData.controller";
import { requireAdminKey } from "../middleware/admin-key";
import { validateBody } from "../middleware/validate";

const queryTypeSchema = z.enum(["brewery", "restaurant", "event_space", "park", "market", "industrial", "college", "tourism"]);

const localDataCheckSchema = z.object({
  city: z.string().trim().min(2, "city is required"),
  queryType: queryTypeSchema,
  radiusMiles: z.number().min(1).max(25).optional()
});

const localDataMapSchema = z.object({
  city: z.string().trim().min(2, "city is required"),
  foodType: z.string().trim().min(2, "foodType is required"),
  radiusMiles: z.number().min(1).max(25).optional()
});

export const localDataRouter = Router();

localDataRouter.post("/local-data/map", validateBody(localDataMapSchema), mapLocalDataController);
localDataRouter.post("/local-data/check", requireAdminKey, validateBody(localDataCheckSchema), checkLocalDataController);
