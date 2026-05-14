import { eventOpportunityProfiles } from "../data/eventOpportunityProfiles";
import { findCityProfile } from "../data/cityProfiles";
import { findFoodTypeProfile } from "../data/foodTypeProfiles";
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

function statusForScore(score: number) {
  if (score >= 84) return "High-priority lead";
  if (score >= 74) return "Strong fit";
  if (score >= 64) return "Worth checking";
  return "Monitor";
}

function reasonFor(profileLabel: string, city: string, foodType: string, traitScore: number, foodScore: number) {
  return `${profileLabel} fits ${foodType} in ${city} because the city traits scored ${traitScore}/100 and the food-type fit scored ${foodScore}/100.`;
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
    status: "Live research lead",
    reason: source.snippet || `Public source found for ${input.foodType} opportunities in ${input.city}.`,
    suggestedAction: "Open the source, check vendor/contact details, and verify dates or permit requirements.",
    typicalLeadTime: "Verify source",
    source: "firecrawl" as const,
    url: source.url
  }));
}

export async function generateEventOpportunities(input: EventInput): Promise<FlowEventsResult> {
  const cityProfile = input.cityProfile ?? findCityProfile(input.city);
  const foodTypeProfile = input.foodTypeProfile ?? findFoodTypeProfile(input.foodType);

  const modelOpportunities = eventOpportunityProfiles.map((profile) => {
    const traitScore = clamp(profile.bestCityTraits.reduce((sum, trait) => sum + traitValue(cityProfile, trait), 0) / profile.bestCityTraits.length);
    const foodScore = foodMatchScore(profile.bestFoodTypes, foodTypeProfile.foodType === "food" ? input.foodType : foodTypeProfile.foodType);
    const ticketBonus = foodTypeProfile.averageTicketPotential * 0.08;
    const score = clamp(profile.averageOpportunityScore * 0.34 + traitScore * 0.36 + foodScore * 0.22 + ticketBonus);

    return {
      id: profile.type,
      title: profile.label,
      type: profile.type,
      score,
      status: statusForScore(score),
      reason: reasonFor(profile.label, input.city, input.foodType, traitScore, foodScore),
      suggestedAction: profile.suggestedAction,
      typicalLeadTime: profile.typicalLeadTime,
      source: "model" as const
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
      ? `FlowEvents found ${opportunities.length} event, pop-up, vendor, or permit leads for ${input.foodType} in ${input.city}. The strongest lead is ${top.title} with a ${top.score}/100 fit score.`
      : `FlowEvents did not find a strong event fit yet for ${input.foodType} in ${input.city}.`
  };
}

export async function getDemoEvents() {
  return generateEventOpportunities({ city: "Portland, OR", foodType: "tacos" });
}
