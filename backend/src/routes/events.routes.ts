import { Router } from "express";
import { z } from "zod";
import { findEventsController, getDemoEventsController } from "../controllers/events.controller";
import { validateBody } from "../middleware/validate";

const eventFindSchema = z.object({
  city: z.string().trim().min(2, "city is required"),
  foodType: z.string().trim().min(2, "foodType is required")
});

export const eventsRouter = Router();

eventsRouter.get("/events/demo", getDemoEventsController);
eventsRouter.post("/events/find", validateBody(eventFindSchema), findEventsController);
