import { eventOpportunityProfiles } from "../data/eventOpportunityProfiles";
import { findCityProfile } from "../data/cityProfiles";
import { findFoodTypeProfile } from "../data/foodTypeProfiles";
import { evidenceLabel, findLocalRealityProfile, type EvidenceLevel } from "../data/localRealityProfiles";
import type { FlowEventsResult, MarketResearch } from "../types/truckflow";

type EventInput = {
  city: string;
  foodType: string;
  cityProfile?: ReturnType<typeof findCityProfile>;
  foodTypeProfile?: ReturnType<typeof findFoodTypeProfile>;
  research?: MarketResearch;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function traitValue(profile: ReturnType<typeof findCityProfile>, trait: string) {
  const value = profile[trait as keyof typeof profile];
  return typeof value === "number" ? value : 50;
}

function foodMatchScore(bestFoodTypes: string[], foodType: string) {
  const normalized = foodType.toLowerCase();
  if (bestFoodTypes.some((item) => normalized.includes(item) || item.includes(normalized))) {
    return 100;
  }

  if ((normalized.includes("birria") || normalized.includes("taco")) && bestFoodTypes.includes("tacos")) {
    return 96;
  }

  return 58;
}

function statusForScore(score: number, evidenceLevel: EvidenceLevel) {
  if (evidenceLevel === "verified") return "Source found - verify details";
  if (evidenceLevel === "nearby") return "Nearby lead - verify fit";
  if (evidenceLevel === "low_confidence") return "Needs verification";
  if (score >= 84) return "Strong model fit - verify first";
  if (score >= 74) return "Worth researching";
  return "Monitor";
}

function saferTitle(type: string, label: string, city: string, evidenceLevel: EvidenceLevel, nearbyMarkets: string[]) {
  if (evidenceLevel === "verified") return label;
  if (evidenceLevel === "nearby") return `Check nearby ${label.toLowerCase()}`;

  const nearbyText = nearbyMarkets.length ? ` near ${nearbyMarkets.slice(0, 2).join(" or ")}` : "";
  switch (type) {
    case "brewery_pop_up":
      return `Research brewery/pop-up opportunities${nearbyText}`;
    case "city_permit_window":
      return `Research ${city} vending and permit rules`;
    case "seasonal_vendor_call":
      return `Research seasonal vendor calls${nearbyText}`;
    case "waterfront_event":
      return `Check nearby waterfront opportunities${nearbyText}`;
    case "tourist_market":
      return `Check nearby tourism-market opportunities${nearbyText}`;
    default:
      return `Potential ${label.toLowerCase()}`;
  }
}

function evidenceForType(type: string, input: EventInput, hasLiveResearch: boolean): EvidenceLevel {
  const reality = findLocalRealityProfile(input.city);
  if (hasLiveResearch) return "verified";
  if (reality.avoidUnverifiedTypes.includes(type)) {
    return reality.nearbyMarkets.length ? "nearby" : "low_confidence";
  }
  if (reality.cautionOpportunityTypes.includes(type)) return "low_confidence";
  return reality.defaultEvidenceLevel;
}

function evidenceNotesForType(type: string, input: EventInput, evidenceLevel: EvidenceLevel) {
  const reality = findLocalRealityProfile(input.city);
  const notes = [reality.researchDisabledNote];

  if (evidenceLevel === "nearby") {
    notes.push(`No verified ${input.city} source is attached. Nearby opportunity may apply in ${reality.nearbyMarkets.slice(0, 2).join(" or ")}.`);
  }

  if (type === "brewery_pop_up" && evidenceLevel !== "verified") {
    notes.push(`No verified ${input.city} brewery or food-truck rotation source found.`);
  }

  if (type === "city_permit_window" && evidenceLevel !== "verified") {
    notes.push("No verified permit opening is attached. Check the city or county permit office before acting.");
  }

  notes.push("Treat this as decision support, not a confirmed booking, event, or permit.");
  return notes;
}

function reasonFor(profileLabel: string, city: string, foodType: string, traitScore: number, foodScore: number, evidenceLevel: EvidenceLevel) {
  const prefix = evidenceLevel === "verified" ? "A public source was found and" : "TruckFlow's model estimates that";
  return `${prefix} ${profileLabel.toLowerCase()} could fit ${foodType} in or near ${city} because the city traits scored ${traitScore}/100 and the food-type fit scored ${foodScore}/100. Verify the specific venue, organizer, and permit requirements before acting.`;
}

function sourceBasedOpportunities(input: EventInput) {
  const research = input.research;
  if (!research?.enabled || !research.sources.length) {
    return [];
  }

  return research.sources.slice(0, 2).map((source, index) => ({
    id: `firecrawl-${index + 1}`,
    title: source.title,
    type: "live_research",
    score: clamp(72 + (research.signals.competitorMentions * 2) - index * 4),
    status: "Source found - verify details",
    reason: source.snippet || `Public source found for ${input.foodType} opportunities in ${input.city}.`,
    suggestedAction: "Open the source, check vendor/contact details, and verify dates or permit requirements.",
    typicalLeadTime: "Verify source",
    source: "firecrawl" as const,
    evidenceLevel: "verified" as const,
    evidenceNotes: [
      "A public source was returned by live research.",
      "Still verify dates, organizer authority, vending permission, and fees before acting."
    ],
    url: source.url
  }));
}

export async function generateEventOpportunities(input: EventInput): Promise<FlowEventsResult> {
  const cityProfile = input.cityProfile ?? findCityProfile(input.city);
  const foodTypeProfile = input.foodTypeProfile ?? findFoodTypeProfile(input.foodType);
  const realityProfile = findLocalRealityProfile(input.city);
  const hasLiveResearch = Boolean(input.research?.enabled);

  const modelOpportunities = eventOpportunityProfiles.map((profile) => {
    const traitScore = clamp(profile.bestCityTraits.reduce((sum, trait) => sum + traitValue(cityProfile, trait), 0) / profile.bestCityTraits.length);
    const foodScore = foodMatchScore(profile.bestFoodTypes, foodTypeProfile.foodType === "food" ? input.foodType : foodTypeProfile.foodType);
    const ticketBonus = foodTypeProfile.averageTicketPotential * 0.08;
    let score = clamp(profile.averageOpportunityScore * 0.34 + traitScore * 0.36 + foodScore * 0.22 + ticketBonus);
    const evidenceLevel = evidenceForType(profile.type, input, false);

    if (realityProfile.favoredOpportunityTypes.includes(profile.type)) {
      score = clamp(score + 8);
    }
    if (realityProfile.avoidUnverifiedTypes.includes(profile.type)) {
      score = clamp(score - 20);
    }
    if (realityProfile.cautionOpportunityTypes.includes(profile.type)) {
      score = clamp(score - 8);
    }

    return {
      id: profile.type,
      title: saferTitle(profile.type, profile.label, input.city, evidenceLevel, realityProfile.nearbyMarkets),
      type: profile.type,
      score,
      status: statusForScore(score, evidenceLevel),
      reason: reasonFor(profile.label, input.city, input.foodType, traitScore, foodScore, evidenceLevel),
      suggestedAction: evidenceLevel === "verified" ? profile.suggestedAction : `Research first: ${profile.suggestedAction}`,
      typicalLeadTime: profile.typicalLeadTime,
      source: "model" as const,
      evidenceLevel,
      evidenceNotes: evidenceNotesForType(profile.type, input, evidenceLevel)
    };
  });

  const liveOpportunities = sourceBasedOpportunities(input);
  const opportunities = [...liveOpportunities, ...modelOpportunities]
    .sort((a, b) => b.score - a.score)
    .slice(0, liveOpportunities.length ? 6 : 5);

  const top = opportunities[0];

  return {
    opportunities,
    summary: top
      ? `FlowEvents found ${opportunities.length} event, pop-up, vendor, or permit leads for ${input.foodType} in ${input.city}. The strongest lead is ${top.title} with a ${top.score}/100 fit score and ${evidenceLabel(top.evidenceLevel)} evidence. Verify details before acting.`
      : `FlowEvents did not find a strong event fit yet for ${input.foodType} in ${input.city}.`
  };
}

export async function getDemoEvents() {
  return generateEventOpportunities({ city: "Portland, OR", foodType: "tacos" });
}
