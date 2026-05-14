import { Router } from "express";
import { z } from "zod";
import { createLeadController, getLeadsController } from "../controllers/leads.controller";
import { requireAdminKey } from "../middleware/admin-key";
import { validateBody } from "../middleware/validate";

const leadSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address."),
  businessName: z.string().trim().optional(),
  city: z.string().trim().min(1, "city is required"),
  foodType: z.string().trim().min(1, "foodType is required")
});

export const leadsRouter = Router();

leadsRouter.post("/leads", validateBody(leadSchema), createLeadController);
leadsRouter.get("/leads", requireAdminKey, getLeadsController);
