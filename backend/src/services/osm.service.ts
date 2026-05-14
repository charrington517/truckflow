import { findCityCoordinate } from "../data/cityCoordinates";
import type { LocalDataCheck, LocalDataMapResult, LocalDataResult, OsmQueryType } from "../types/truckflow";

type SearchNearbyPlacesInput = {
  city: string;
  state?: string;
  queryType: OsmQueryType;
  radiusMiles?: number;
};

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const MAX_RADIUS_MILES = 25;
const DEFAULT_RADIUS_MILES = 10;
const MAX_RESULTS = 20;
const CACHE_TTL_MS = 30 * 60 * 1000;

const cache = new Map<string, { expiresAt: number; result: LocalDataCheck }>();

const queryTagMap: Record<OsmQueryType, Array<[string, string]>> = {
  brewery: [
    ["craft", "brewery"],
    ["amenity", "bar"],
    ["amenity", "pub"]
  ],
  restaurant: [
    ["amenity", "restaurant"],
    ["amenity", "fast_food"],
    ["amenity", "cafe"]
  ],
  event_space: [
    ["amenity", "events_venue"],
    ["tourism", "attraction"],
    ["leisure", "park"],
    ["amenity", "community_centre"]
  ],
  park: [["leisure", "park"]],
  market: [
    ["amenity", "marketplace"],
    ["shop", "supermarket"],
    ["shop", "convenience"]
  ],
  industrial: [
    ["landuse", "industrial"],
    ["man_made", "works"]
  ],
  college: [
    ["amenity", "college"],
    ["amenity", "university"]
  ],
  tourism: [
    ["tourism", "attraction"],
    ["tourism", "viewpoint"],
    ["tourism", "museum"],
    ["tourism", "hotel"]
  ]
};

function radiusMeters(radiusMiles?: number) {
  const miles = Math.min(Math.max(radiusMiles ?? DEFAULT_RADIUS_MILES, 1), MAX_RADIUS_MILES);
  return Math.round(miles * 1609.344);
}

function buildQuery(input: SearchNearbyPlacesInput, latitude: number, longitude: number) {
  const radius = radiusMeters(input.radiusMiles);
  const filters = queryTagMap[input.queryType]
    .flatMap(([key, value]) => [
      `node(around:${radius},${latitude},${longitude})["${key}"="${value}"];`,
      `way(around:${radius},${latitude},${longitude})["${key}"="${value}"];`,
      `relation(around:${radius},${latitude},${longitude})["${key}"="${value}"];`
    ])
    .join("\n");

  return `[out:json][timeout:8];\n(\n${filters}\n);\nout center tags ${MAX_RESULTS};`;
}

function placeType(tags: Record<string, string> | undefined, fallback: string) {
  if (!tags) return fallback;
  if (tags.craft) return tags.craft;
  if (tags.amenity) return tags.amenity;
  if (tags.tourism) return tags.tourism;
  if (tags.leisure) return tags.leisure;
  if (tags.shop) return tags.shop;
  if (tags.landuse) return tags.landuse;
  if (tags.man_made) return tags.man_made;
  return fallback;
}

function emptyCheck(input: SearchNearbyPlacesInput, summary: string): LocalDataCheck {
  return {
    queryType: input.queryType,
    resultCount: 0,
    topPlaces: [],
    summary
  };
}

export async function searchNearbyPlaces(input: SearchNearbyPlacesInput): Promise<LocalDataCheck> {
  const radius = Math.min(Math.max(input.radiusMiles ?? DEFAULT_RADIUS_MILES, 1), MAX_RADIUS_MILES);
  const coordinate = findCityCoordinate(input.city);

  if (!coordinate) {
    return emptyCheck(input, `No local coordinate profile exists for ${input.city}, so OpenStreetMap was not checked.`);
  }

  const cacheKey = `${coordinate.city}:${input.queryType}:${radius}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "TruckFlow/0.1 local-data-check"
      },
      body: new URLSearchParams({ data: buildQuery(input, coordinate.latitude, coordinate.longitude) }),
      signal: controller.signal
    });

    if (!response.ok) {
      return emptyCheck(input, `OpenStreetMap check failed for ${input.queryType} near ${coordinate.city}.`);
    }

    const data = (await response.json()) as { elements?: OverpassElement[] };
    const places = (data.elements ?? [])
      .filter((element) => element.tags?.name)
      .slice(0, MAX_RESULTS)
      .map((element) => ({
        name: element.tags?.name ?? "Unnamed place",
        type: placeType(element.tags, input.queryType),
        latitude: element.lat ?? element.center?.lat ?? coordinate.latitude,
        longitude: element.lon ?? element.center?.lon ?? coordinate.longitude,
        tags: element.tags ?? {},
        source: "openstreetmap" as const
      }));

    const result: LocalDataCheck = {
      queryType: input.queryType,
      resultCount: places.length,
      topPlaces: places.slice(0, MAX_RESULTS),
      summary: `${places.length} ${input.queryType.replace("_", " ")} signal${places.length === 1 ? "" : "s"} found within ${radius} miles of ${coordinate.city}.`
    };

    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, result });
    return result;
  } catch {
    return emptyCheck(input, `OpenStreetMap check timed out or failed for ${input.queryType} near ${coordinate.city}.`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLocalDataChecks(input: { city: string; radiusMiles?: number; queryTypes?: OsmQueryType[] }): Promise<LocalDataResult> {
  const queryTypes = input.queryTypes ?? ["brewery", "market", "tourism", "industrial", "college", "event_space"];
  const checks = await Promise.all(
    queryTypes.map((queryType) => searchNearbyPlaces({ city: input.city, queryType, radiusMiles: input.radiusMiles }))
  );

  const found = checks.filter((check) => check.resultCount > 0);

  const coordinate = findCityCoordinate(input.city);

  return {
    enabled: true,
    sources: ["openstreetmap"],
    center: coordinate ? { latitude: coordinate.latitude, longitude: coordinate.longitude } : undefined,
    checks,
    summary: found.length
      ? `OpenStreetMap found local signals for ${found.map((check) => check.queryType.replace("_", " ")).join(", ")} near ${input.city}.`
      : `OpenStreetMap did not return local business/place signals for the checked categories near ${input.city}. Treat recommendations as low-confidence until verified.`
  };
}


export async function getLocalDataMap(input: { city: string; foodType: string; radiusMiles?: number }): Promise<LocalDataMapResult> {
  const coordinate = findCityCoordinate(input.city);
  const queryTypes: OsmQueryType[] = ["brewery", "restaurant", "market", "industrial", "tourism", "college", "event_space"];
  const checks = await Promise.all(
    queryTypes.map((queryType) => searchNearbyPlaces({ city: input.city, queryType, radiusMiles: input.radiusMiles }))
  );

  return {
    city: input.city,
    foodType: input.foodType,
    center: coordinate ? { latitude: coordinate.latitude, longitude: coordinate.longitude } : null,
    signals: checks.map((check) => ({
      category: check.queryType,
      count: check.resultCount,
      places: check.topPlaces
    }))
  };
}
