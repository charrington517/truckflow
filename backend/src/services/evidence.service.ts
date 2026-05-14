import type { EvidenceSource, FlowEventOpportunity, FreeReport, OsmQueryType } from "../types/truckflow";

type SourceDraft = Omit<EvidenceSource, "id"> & { id?: string };

const nowIso = () => new Date().toISOString();

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90) || "source";
}

function sourceId(prefix: string, label: string, url?: string) {
  return `${prefix}-${slug(url || label)}`;
}

function confidenceFromEvidence(level?: string): EvidenceSource["confidence"] {
  if (level === "verified") return "verified";
  if (level === "nearby") return "nearby";
  if (level === "model") return "estimated";
  return "low";
}

function addSource(map: Map<string, EvidenceSource>, draft: SourceDraft) {
  const id = draft.id ?? sourceId(draft.sourceType, draft.label, draft.url);
  const existing = map.get(id);
  if (existing) {
    const notes = [existing.notes, draft.notes].filter(Boolean).join(" ").trim();
    map.set(id, {
      ...existing,
      confidence: existing.confidence === "verified" ? existing.confidence : draft.confidence,
      url: existing.url || draft.url,
      notes: notes || undefined
    });
    return id;
  }

  map.set(id, { ...draft, id });
  return id;
}

function eventQueryTypes(type: string): OsmQueryType[] {
  switch (type) {
    case "brewery_pop_up": return ["brewery"];
    case "tourist_market": return ["tourism", "market"];
    case "waterfront_event": return ["tourism", "event_space", "park"];
    case "college_event": return ["college"];
    case "office_lunch": return ["industrial"];
    case "farmers_market":
    case "seasonal_vendor_call": return ["market", "event_space"];
    case "street_festival":
    case "community_fair":
    case "sports_event": return ["event_space", "park"];
    default: return [];
  }
}

function sourceIdsForEvent(opportunity: FlowEventOpportunity, report: FreeReport, map: Map<string, EvidenceSource>, modelId: string) {
  const ids = new Set<string>();
  if (opportunity.url) {
    ids.add(addSource(map, {
      label: opportunity.title,
      url: opportunity.url,
      sourceType: opportunity.source === "firecrawl" ? "firecrawl" : "model_estimate",
      confidence: opportunity.evidenceLevel === "verified" ? "verified" : confidenceFromEvidence(opportunity.evidenceLevel),
      lastCheckedAt: nowIso(),
      notes: opportunity.evidenceNotes?.[0]
    }));
  }

  if (opportunity.evidenceLevel === "nearby") {
    report.nearbyExpansion?.recommendations.forEach((recommendation) => {
      if (opportunity.title.includes(recommendation.city) || opportunity.reason.includes(recommendation.city)) {
        ids.add(addSource(map, {
          id: sourceId("nearby", recommendation.city),
          label: `${recommendation.city} nearby market profile`,
          sourceType: "model_estimate",
          confidence: "nearby",
          notes: `Nearby market suggestion ${recommendation.distanceMiles} miles from ${report.city}: ${recommendation.reason}`
        }));
      }
    });
  }

  eventQueryTypes(opportunity.type).forEach((queryType) => {
    const check = report.localData?.checks.find((item) => item.queryType === queryType);
    if (check) {
      ids.add(addSource(map, {
        id: sourceId("osm-check", `${report.city}-${queryType}`),
        label: `${queryType.replaceAll("_", " ")} OpenStreetMap check near ${report.city}`,
        sourceType: "openstreetmap",
        confidence: check.resultCount > 0 ? "nearby" : "low",
        lastCheckedAt: nowIso(),
        notes: check.summary
      }));
    }
  });

  if (ids.size === 0) ids.add(modelId);
  return [...ids];
}

export function applyEvidenceSources(report: FreeReport): FreeReport {
  const map = new Map<string, EvidenceSource>();
  const modelId = addSource(map, {
    id: sourceId("model", `${report.city}-${report.foodType}-scoring`),
    label: `TruckFlow scoring model for ${report.city} / ${report.foodType}`,
    sourceType: "model_estimate",
    confidence: "estimated",
    lastCheckedAt: nowIso(),
    notes: "Rule-based opportunity scoring using TruckFlow city, food-type, time, and quality-control profiles. Treat as a modeled estimate until verified locally."
  });

  report.localData?.checks.forEach((check) => {
    const checkId = addSource(map, {
      id: sourceId("osm-check", `${report.city}-${check.queryType}`),
      label: `${check.queryType.replaceAll("_", " ")} OpenStreetMap check near ${report.city}`,
      sourceType: "openstreetmap",
      confidence: check.resultCount > 0 ? "nearby" : "low",
      lastCheckedAt: nowIso(),
      notes: check.summary
    });
    check.evidenceSourceIds = [checkId];

    check.topPlaces.forEach((place) => {
      const placeId = addSource(map, {
        id: sourceId("osm-place", `${place.name}-${place.latitude}-${place.longitude}`),
        label: `${place.name} (${place.type})`,
        sourceType: "openstreetmap",
        confidence: "nearby",
        lastCheckedAt: nowIso(),
        notes: `OpenStreetMap place signal near ${report.city}. Verify current operations before acting.`
      });
      place.evidenceSourceIds = [placeId, checkId];
    });
  });

  report.research?.sources.forEach((source) => {
    addSource(map, {
      id: sourceId("firecrawl", source.url),
      label: source.title,
      url: source.url,
      sourceType: "firecrawl",
      confidence: "verified",
      lastCheckedAt: nowIso(),
      notes: source.snippet || "Public web source returned by live research. Verify details before acting."
    });
  });

  report.nearbyExpansion?.recommendations.forEach((recommendation) => {
    const id = addSource(map, {
      id: sourceId("nearby", recommendation.city),
      label: `${recommendation.city} nearby market profile`,
      sourceType: "model_estimate",
      confidence: "nearby",
      notes: `Nearby market suggestion ${recommendation.distanceMiles} miles from ${report.city}: ${recommendation.reason}`
    });
    recommendation.evidenceSourceIds = [id, modelId];
  });

  report.flowEvents?.opportunities.forEach((opportunity) => {
    opportunity.evidenceSourceIds = sourceIdsForEvent(opportunity, report, map, modelId);
  });

  report.flowIntel?.competitors.forEach((competitor) => {
    const type = competitor.source === "manual_admin" ? "manual_admin" : competitor.source === "firecrawl" ? "firecrawl" : competitor.source === "openstreetmap" ? "openstreetmap" : "model_estimate";
    const confidence = competitor.source === "manual_admin" || competitor.confidence === "verified" ? "verified" : competitor.confidence === "low" ? "low" : type === "openstreetmap" ? "nearby" : "estimated";
    const id = addSource(map, {
      id: sourceId(type === "manual_admin" ? "manual" : type, competitor.url || competitor.website || competitor.name),
      label: competitor.name,
      url: competitor.url || competitor.website || competitor.socialUrl,
      sourceType: type,
      confidence,
      lastCheckedAt: competitor.lastVerifiedAt || nowIso(),
      notes: competitor.notes || "Competitor signal needs manual verification."
    });
    competitor.evidenceSourceIds = [id];
  });

  report.bestSpot.evidenceSourceIds = report.bestSpot.evidenceSourceIds ?? [modelId];
  report.menuOpportunity.evidenceSourceIds = report.menuOpportunity.evidenceSourceIds ?? [modelId];
  report.eventOpportunity.evidenceSourceIds = report.flowEvents?.opportunities[0]?.evidenceSourceIds ?? [modelId];
  report.boostIdea.evidenceSourceIds = report.boostIdea.evidenceSourceIds ?? [modelId];

  report.evidenceSources = [...map.values()].sort((a, b) => {
    const order = { verified: 0, nearby: 1, estimated: 2, low: 3 } as const;
    return order[a.confidence] - order[b.confidence] || a.label.localeCompare(b.label);
  });

  return report;
}
