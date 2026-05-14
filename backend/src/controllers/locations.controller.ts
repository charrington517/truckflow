import type { Request, Response } from "express";
import { getDemoLocations } from "../services/locations.service";

export function getDemoLocationsController(_req: Request, res: Response) {
  res.json(getDemoLocations());
}
