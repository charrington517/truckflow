import { getNearbyMarketProfiles } from "../data/nearbyMarkets";
import { findLocalRealityProfile } from "../data/localRealityProfiles";
import type { LocalDataResult, NearbyExpansionResult } from "../types/truckflow";

type NearbyInput = {
  city: string;
  foodType: string;
  localData?: LocalDataResult;
};

const forcedExpansionCities = new Set(["toledo, or"]);

function normalize(city: string) {
  return city.trim().toLowerCase().replace(/\s+/g, " ");
}

function localDataIsWeak(city: string, localData?: LocalDataResult) {
  if (forcedExpansionCities.has(normalize(city))) {
    return true;
  }

  if (!localData?.checks?.length) {
    return true;
  }

  const keyCounts = localData.checks
    .filter((check) => ["tourism", "market", "event_space", "industrial", "college"].includes(check.queryType))
    .reduce((sum, check) => sum + check.resultCount, 0);

  return keyCounts < 8;
}

function readableType(type: string) {
  return type.replaceAll("_", " ");
}

export function getNearbyMarkets(city: string) {
  return getNearbyMarketProfiles(city);
}

export function suggestNearbyOpportunities(input: NearbyInput): NearbyExpansionResult {
  const nearbyMarkets = getNearbyMarkets(input.city);
  const reality = findLocalRealityProfile(input.city);
  const weak = localDataIsWeak(input.city, input.localData);

  if (!nearbyMarkets.length || !weak) {
    return {
      usedNearbyExpansion: false,
      nearbyMarkets,
      recommendations: []
    };
  }

  const recommendations = nearbyMarkets.slice(0, 3).map((market) => {
    const primaryType = market.strongestOpportunityTypes[0] ?? "nearby_market";
    const label = primaryType.includes("waterfront")
      ? "Waterfront Opportunity"
      : primaryType.includes("tourist")
        ? "Tourism Market Opportunity"
        : primaryType.includes("college")
          ? "College/Event Opportunity"
          : primaryType.includes("office")
            ? "Worksite Lunch Opportunity"
            : primaryType.includes("catering")
              ? "Catering Opportunity"
              : "Nearby Market Opportunity";

    return {
      city: market.city,
      distanceMiles: market.distanceMiles,
      title: `Nearby ${market.city.replace(/, .*/, "")} ${label}`,
      reason: `${input.city} may have limited direct signals for ${input.foodType}. ${market.reason}`,
      strongestOpportunityTypes: market.strongestOpportunityTypes,
      recommendation: `Research ${market.city} for ${market.strongestOpportunityTypes.map(readableType).join(", ")} before treating this as a local ${input.city} lead.`,
      evidenceLevel: "nearby" as const,
      evidenceNotes: [
        `This is not inside ${input.city}. It is a nearby market suggestion.`,
        `${input.city} local profile note: ${reality.marketReality}`,
        market.reason
      ]
    };
  });

  return {
    usedNearbyExpansion: true,
    nearbyMarkets,
    recommendations
  };
}
