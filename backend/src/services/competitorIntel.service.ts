import { randomUUID } from "node:crypto";
import { researchLocalMarket } from "./firecrawl.service";
import { getDb } from "./db.service";
import { searchNearbyPlaces } from "./osm.service";
import type { Competitor, CompetitorInput, FlowIntelResult, LocalDataPlace } from "../types/truckflow";

type CompetitorRow = {
  id: string;
  name: string;
  city: string | null;
  foodType: string | null;
  usualLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  socialUrl: string | null;
  source: string | null;
  confidence: string | null;
  stationary: number | null;
  notes: string | null;
  lastVerifiedAt: string | null;
  createdAt: string;
};

const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

function rowToCompetitor(row: CompetitorRow): Competitor {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? undefined,
    foodType: row.foodType ?? undefined,
    usualLocation: row.usualLocation ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    website: row.website ?? undefined,
    socialUrl: row.socialUrl ?? undefined,
    source: row.source ?? undefined,
    confidence: row.confidence ?? undefined,
    stationary: Boolean(row.stationary),
    notes: row.notes ?? undefined,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    createdAt: row.createdAt
  };
}

function foodTerms(foodType: string) {
  const base = normalize(foodType);
  const terms = new Set(base.split(/[^a-z0-9]+/).filter(Boolean));
  if (base.includes("birria") || base.includes("taco")) {
    ["mexican", "taco", "tacos", "burrito", "birria"].forEach((term) => terms.add(term));
  }
  if (base.includes("seafood")) {
    ["fish", "seafood", "crab", "clam"].forEach((term) => terms.add(term));
  }
  if (base.includes("coffee") || base.includes("breakfast")) {
    ["coffee", "cafe", "breakfast"].forEach((term) => terms.add(term));
  }
  return [...terms];
}

function overlapScore(input: { foodType: string; placeText: string; stationary: boolean; hasCoords: boolean; confidence: string }) {
  const text = normalize(input.placeText);
  const terms = foodTerms(input.foodType);
  const matches = terms.filter((term) => text.includes(term)).length;
  let score = Math.min(85, 28 + matches * 18);
  if (input.stationary) score += 8;
  if (input.hasCoords) score += 6;
  if (input.confidence.includes("manual") || input.confidence.includes("verified")) score += 12;
  if (input.confidence.includes("low")) score -= 12;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function osmToCompetitor(place: LocalDataPlace, city: string, foodType: string): Competitor {
  const cuisine = place.tags.cuisine;
  const website = place.tags.website || place.tags["contact:website"];
  const placeText = [place.name, place.type, cuisine, place.tags.amenity, place.tags.takeaway].join(" ");
  const score = overlapScore({
    foodType,
    placeText,
    stationary: true,
    hasCoords: true,
    confidence: cuisine ? "osm_cuisine_signal" : "osm_place_signal"
  });

  return {
    id: `osm-${place.name}-${place.latitude}-${place.longitude}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: place.name,
    city,
    foodType: cuisine || place.type,
    usualLocation: place.tags["addr:street"] || place.tags["addr:full"] || "Mapped public place",
    latitude: place.latitude,
    longitude: place.longitude,
    website,
    source: "openstreetmap",
    confidence: cuisine ? "medium" : "low",
    stationary: true,
    overlapScore: score,
    notes: cuisine ? `OSM cuisine tag: ${cuisine}.` : "OSM restaurant/fast-food/cafe signal. Cuisine overlap is not verified.",
    url: website,
    lastVerifiedAt: new Date().toISOString()
  };
}

function manualToScanCompetitor(row: Competitor, foodType: string): Competitor {
  const placeText = [row.name, row.foodType, row.notes, row.usualLocation].join(" ");
  return {
    ...row,
    source: row.source || "manual_admin",
    confidence: row.confidence || "manual",
    overlapScore: overlapScore({
      foodType,
      placeText,
      stationary: row.stationary,
      hasCoords: typeof row.latitude === "number" && typeof row.longitude === "number",
      confidence: row.confidence || "manual"
    }),
    url: row.website || row.socialUrl
  };
}

function getManualCompetitorsForScan(city: string) {
  const rows = getDb()
    .prepare("SELECT * FROM competitors WHERE lower(city) = lower(?) OR city IS NULL OR city = '' ORDER BY datetime(createdAt) DESC")
    .all(city) as CompetitorRow[];
  return rows.map(rowToCompetitor);
}

export function getCompetitors(): Competitor[] {
  const rows = getDb().prepare("SELECT * FROM competitors ORDER BY datetime(createdAt) DESC").all() as CompetitorRow[];
  return rows.map(rowToCompetitor);
}

export function createCompetitor(input: CompetitorInput): Competitor {
  const competitor: Competitor = {
    id: randomUUID(),
    name: input.name,
    city: input.city,
    foodType: input.foodType,
    usualLocation: input.usualLocation,
    latitude: input.latitude,
    longitude: input.longitude,
    website: input.website,
    socialUrl: input.socialUrl,
    source: input.source || "manual_admin",
    confidence: input.confidence || "manual",
    stationary: Boolean(input.stationary),
    notes: input.notes,
    lastVerifiedAt: input.lastVerifiedAt || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  getDb()
    .prepare(`
      INSERT INTO competitors (
        id, name, city, foodType, usualLocation, latitude, longitude, website, socialUrl,
        source, confidence, stationary, notes, lastVerifiedAt, createdAt
      ) VALUES (
        @id, @name, @city, @foodType, @usualLocation, @latitude, @longitude, @website, @socialUrl,
        @source, @confidence, @stationary, @notes, @lastVerifiedAt, @createdAt
      )
    `)
    .run({ ...competitor, stationary: competitor.stationary ? 1 : 0 });

  return competitor;
}

export function updateCompetitor(id: string, input: Partial<CompetitorInput>): Competitor | null {
  const existing = getCompetitors().find((item) => item.id === id);
  if (!existing) return null;
  const next = { ...existing, ...input };
  getDb()
    .prepare(`
      UPDATE competitors SET
        name=@name, city=@city, foodType=@foodType, usualLocation=@usualLocation,
        latitude=@latitude, longitude=@longitude, website=@website, socialUrl=@socialUrl,
        source=@source, confidence=@confidence, stationary=@stationary, notes=@notes, lastVerifiedAt=@lastVerifiedAt
      WHERE id=@id
    `)
    .run({ ...next, stationary: next.stationary ? 1 : 0 });
  return getCompetitors().find((item) => item.id === id) ?? null;
}

export function deleteCompetitor(id: string) {
  getDb().prepare("DELETE FROM competitors WHERE id = ?").run(id);
}

export async function scanCompetitors(input: { city: string; foodType: string }): Promise<FlowIntelResult> {
  const [restaurantSignals, research] = await Promise.all([
    searchNearbyPlaces({ city: input.city, queryType: "restaurant", radiusMiles: 10 }),
    researchLocalMarket(input)
  ]);

  const osmCompetitors = restaurantSignals.topPlaces.map((place) => osmToCompetitor(place, input.city, input.foodType));
  const manualCompetitors = getManualCompetitorsForScan(input.city).map((row) => manualToScanCompetitor(row, input.foodType));

  const firecrawlCompetitors = research.enabled
    ? research.sources.slice(0, 5).map((source, index) => ({
        id: `firecrawl-${index}-${source.url}`,
        name: source.title,
        city: input.city,
        foodType: input.foodType,
        usualLocation: "Public web source",
        latitude: undefined,
        longitude: undefined,
        source: "firecrawl",
        confidence: "low",
        stationary: false,
        overlapScore: overlapScore({
          foodType: input.foodType,
          placeText: `${source.title} ${source.snippet ?? ""}`,
          stationary: false,
          hasCoords: false,
          confidence: "low"
        }),
        notes: source.snippet || "Public source found. Exact location and competitor status need verification.",
        url: source.url,
        lastVerifiedAt: new Date().toISOString()
      }))
    : [];

  const seen = new Set<string>();
  const competitors = [...manualCompetitors, ...osmCompetitors, ...firecrawlCompetitors]
    .filter((competitor) => {
      const key = normalize(`${competitor.name}-${competitor.latitude ?? ""}-${competitor.longitude ?? ""}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.overlapScore ?? 0) - (a.overlapScore ?? 0))
    .slice(0, 15);

  const highOverlap = competitors.filter((competitor) => (competitor.overlapScore ?? 0) >= 70);
  const opportunityGaps = [
    competitors.length === 0 ? "No strong public competitor signals found. This may mean limited public data, not zero competition." : "",
    highOverlap.length === 0 ? `${input.foodType} overlap appears light in public data, but verify manually before choosing a spot.` : "",
    manualCompetitors.length === 0 ? "No manually verified competitors have been entered for this city yet." : ""
  ].filter(Boolean);

  const warnings = [
    "OpenStreetMap and public web data may be incomplete or stale.",
    "Do not treat missing public data as proof that no competitors exist.",
    research.enabled ? "" : "Firecrawl live competitor research is not enabled, so web source coverage is limited."
  ].filter(Boolean);

  return {
    city: input.city,
    foodType: input.foodType,
    competitors,
    summary: competitors.length
      ? `FlowIntel found ${competitors.length} public/manual competitor signal${competitors.length === 1 ? "" : "s"} near ${input.city}. ${highOverlap.length} show stronger ${input.foodType} overlap.`
      : `FlowIntel did not find strong public competitor signals near ${input.city}. This may mean limited public data, not zero competition.`,
    opportunityGaps,
    warnings
  };
}
