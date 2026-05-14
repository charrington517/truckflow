import type { Request, Response } from "express";
import { getDemoMenuOpportunities } from "../services/menu.service";

export function getDemoMenuOpportunitiesController(_req: Request, res: Response) {
  res.json(getDemoMenuOpportunities());
}
