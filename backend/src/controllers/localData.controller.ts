import type { Request, Response } from "express";
import { getLocalDataMap, searchNearbyPlaces } from "../services/osm.service";
import type { OsmQueryType } from "../types/truckflow";

export async function checkLocalDataController(req: Request, res: Response) {
  const result = await searchNearbyPlaces(req.body as { city: string; queryType: OsmQueryType; radiusMiles?: number });
  res.json({
    enabled: true,
    places: result.topPlaces,
    summary: result.summary,
    queryType: result.queryType,
    resultCount: result.resultCount
  });
}

export async function mapLocalDataController(req: Request, res: Response) {
  const result = await getLocalDataMap(req.body as { city: string; foodType: string; radiusMiles?: number });
  res.json(result);
}
