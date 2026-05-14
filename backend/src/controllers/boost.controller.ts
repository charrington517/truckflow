import type { Request, Response } from "express";
import { getDemoBoostIdeas } from "../services/boost.service";

export function getDemoBoostIdeasController(_req: Request, res: Response) {
  res.json(getDemoBoostIdeas());
}
