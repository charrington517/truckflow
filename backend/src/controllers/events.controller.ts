import type { Request, Response } from "express";
import { generateEventOpportunities } from "../services/events.service";
import { suggestNearbyOpportunities } from "../services/nearbyMarkets.service";
import { getLocalDataChecks } from "../services/osm.service";

export async function getDemoEventsController(_req: Request, res: Response) {
  const localData = await getLocalDataChecks({ city: "Portland, OR" });
  const nearbyExpansion = suggestNearbyOpportunities({ city: "Portland, OR", foodType: "tacos", localData });
  const events = await generateEventOpportunities({ city: "Portland, OR", foodType: "tacos", localData, nearbyExpansion });
  res.json(events);
}

export async function findEventsController(req: Request, res: Response) {
  const input = req.body as { city: string; foodType: string };
  const localData = await getLocalDataChecks({ city: input.city });
  const nearbyExpansion = suggestNearbyOpportunities({ city: input.city, foodType: input.foodType, localData });
  const events = await generateEventOpportunities({ ...input, localData, nearbyExpansion });
  res.json(events);
}
