import type { Request, Response } from "express";
import {
  createCompetitor,
  deleteCompetitor,
  getCompetitors,
  scanCompetitors,
  updateCompetitor
} from "../services/competitorIntel.service";
import type { CompetitorInput } from "../types/truckflow";

export async function scanCompetitorsController(req: Request, res: Response) {
  // TODO: add public rate limiting before launch.
  res.json(await scanCompetitors(req.body as { city: string; foodType: string }));
}

export function getCompetitorsController(_req: Request, res: Response) {
  res.json(getCompetitors());
}

export function createCompetitorController(req: Request, res: Response) {
  res.status(201).json(createCompetitor(req.body as CompetitorInput));
}

export function updateCompetitorController(req: Request, res: Response) {
  const updated = updateCompetitor(String(req.params.id), req.body as Partial<CompetitorInput>);
  if (!updated) return res.status(404).json({ error: "Competitor not found" });
  res.json(updated);
}

export function deleteCompetitorController(req: Request, res: Response) {
  deleteCompetitor(String(req.params.id));
  res.status(204).send();
}
