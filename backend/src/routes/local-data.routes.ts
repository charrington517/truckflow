import { Router } from "express";
import { z } from "zod";
import { checkLocalDataController } from "../controllers/localData.controller";
import { requireAdminKey } from "../middleware/admin-key";
import { validateBody } from "../middleware/validate";

const localDataCheckSchema = z.object({
  city: z.string().trim().min(2, "city is required"),
  queryType: z.enum(["brewery", "restaurant", "event_space", "park", "market", "industrial", "college", "tourism"]),
  radiusMiles: z.number().min(1).max(25).optional()
});

export const localDataRouter = Router();

localDataRouter.post("/local-data/check", requireAdminKey, validateBody(localDataCheckSchema), checkLocalDataController);
