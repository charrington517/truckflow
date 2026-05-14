import type { Request, Response } from "express";
import { generateEventOpportunities, getDemoEvents } from "../services/events.service";

export async function getDemoEventsController(_req: Request, res: Response) {
  const events = await getDemoEvents();
  res.json(events);
}

export async function findEventsController(req: Request, res: Response) {
  const events = await generateEventOpportunities(req.body as { city: string; foodType: string });
  res.json(events);
}
