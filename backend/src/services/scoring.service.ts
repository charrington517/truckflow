import { findCityProfile } from "../data/cityProfiles";
import { findFoodTypeProfile } from "../data/foodTypeProfiles";
import type { FreeReport, FreeReportRequest, OpportunityScores } from "../types/truckflow";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const titleCase = (value: string) => value.trim().replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

function getDayPart(hour: number) {
  if (hour >= 21 || hour < 5) return "late-night";
  if (hour >= 15) return "dinner";
  return "lunch";
}

function selectBestSpot(profile: ReturnType<typeof findCityProfile>, dayPart: string, isWeekend: boolean) {
  if (profile.industrialWorkerDensity >= 78 && dayPart === "lunch") return "Industrial Lunch Corridor";
  if (profile.officeWorkerDensity >= 76 && dayPart === "lunch") return "Downtown Office Cluster";
  if (profile.touristTraffic >= 82 && (isWeekend || dayPart === "dinner")) return "Tourist Waterfront Strip";
  if (profile.collegeCrowd >= 78 && dayPart !== "lunch") return "College Night Crowd";
  if (profile.eventDensity >= 72 && isWeekend) return "Weekend Market Zone";
  return "Brewery/Food Pod Area";
}

function selectTimeWindow(dayPart: string, isWeekend: boolean) {
  if (dayPart === "late-night") return "9:30 PM - 12:30 AM";
  if (dayPart === "dinner") return isWeekend ? "4:30 PM - 8:30 PM" : "5:00 PM - 8:00 PM";
  return "11:15 AM - 2:00 PM";
}

function selectMenuOpportunity(foodType: string, dayPart: string, cityProfile: ReturnType<typeof findCityProfile>) {
  const normalized = foodType.toLowerCase();
  if (normalized.includes("birria") || normalized.includes("taco")) {
    return cityProfile.touristTraffic > 80 ? "Seafood Taco Special" : "Birria Ramen";
  }
  if (normalized.includes("coffee") || normalized.includes("breakfast")) return "Breakfast Burrito Combo";
  if (normalized.includes("seafood")) return "Seafood Taco Special";
  if (dayPart === "late-night") return "Late Night Slider Combo";
  if (cityProfile.eventDensity > 75) return "Street Corn Bowl";
  if (cityProfile.weekendDemand > 82) return "Family Share Pack";
  return "Loaded Taco Box";
}

function selectBoostIdea(dayPart: string, isWeekend: boolean, eventPotentialScore: number, foodType: string) {
  if (eventPotentialScore >= 78) return "Event Bundle";
  if (isWeekend) return "Weekend Limited-Time Offer";
  if (dayPart === "lunch") return "Lunch Combo";
  if (dayPart === "late-night") return "Slow Hour Drop";
  if (foodType.toLowerCase().includes("coffee") || foodType.toLowerCase().includes("ramen")) return "Rainy Day Special";
  return "Family Pack";
}

export function generateOpportunityReport(input: FreeReportRequest): FreeReport {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const dayPart = getDayPart(hour);
  const cityProfile = findCityProfile(input.city);
  const foodProfile = findFoodTypeProfile(input.foodType);

  const timeDemand =
    dayPart === "late-night"
      ? cityProfile.lateNightDemand * 0.65 + foodProfile.lateNightFit * 0.35
      : dayPart === "dinner"
        ? cityProfile.dinnerDemand * 0.6 + foodProfile.dinnerFit * 0.4
        : cityProfile.lunchDemand * 0.6 + foodProfile.lunchFit * 0.4;

  const weekendLift = isWeekend ? (cityProfile.weekendDemand + foodProfile.eventFit) / 12 : 0;
  const demandScore = clamp(timeDemand + weekendLift);
  const competitionScore = clamp(100 - (foodProfile.broadAppeal * 0.38) + foodProfile.uniqueness * 0.42 + cityProfile.foodTruckFriendliness * 0.2);
  const eventPotentialScore = clamp(cityProfile.eventDensity * 0.45 + cityProfile.touristTraffic * 0.25 + foodProfile.eventFit * 0.3 + (isWeekend ? 8 : 0));
  const menuGapScore = clamp(foodProfile.uniqueness * 0.55 + foodProfile.averageTicketPotential * 0.25 + cityProfile.foodTruckFriendliness * 0.2);
  const revenueBoostScore = clamp(foodProfile.averageTicketPotential * 0.35 + demandScore * 0.3 + cityProfile.weekendDemand * 0.2 + foodProfile.weatherResistance * 0.15);
  const finalScore = clamp(
    demandScore * 0.35 +
      competitionScore * 0.25 +
      eventPotentialScore * 0.15 +
      menuGapScore * 0.15 +
      revenueBoostScore * 0.1
  );

  const scores: OpportunityScores = {
    demandScore,
    competitionScore,
    eventPotentialScore,
    menuGapScore,
    revenueBoostScore,
    finalScore
  };

  const bestSpotName = selectBestSpot(cityProfile, dayPart, isWeekend);
  const menuItem = selectMenuOpportunity(input.foodType, dayPart, cityProfile);
  const boostPromo = selectBoostIdea(dayPart, isWeekend, eventPotentialScore, input.foodType);
  const displayFoodType = titleCase(input.foodType);
  const displayCity = input.city.trim();
  const expectedLift = `+${Math.max(10, Math.round(finalScore / 4))}%`;

  return {
    city: displayCity,
    foodType: displayFoodType,
    bestSpot: {
      name: bestSpotName,
      timeWindow: selectTimeWindow(dayPart, isWeekend),
      reason: `${bestSpotName} fits ${displayFoodType} because ${displayCity} is showing ${dayPart.replace("-", " ")} demand strength, a ${cityProfile.foodTruckFriendliness}/100 truck-friendly profile, and a ${competitionScore}/100 opportunity gap.`,
      score: finalScore
    },
    menuOpportunity: {
      item: menuItem,
      reason: `${menuItem} gives this concept a sharper edge: ${displayFoodType} has ${foodProfile.averageTicketPotential}/100 ticket potential and ${foodProfile.uniqueness}/100 uniqueness in this scoring model.`,
      confidence: clamp(menuGapScore * 0.7 + demandScore * 0.3)
    },
    eventOpportunity: {
      name: eventPotentialScore >= 78 ? "High-Traffic Event Corridor" : isWeekend ? "Weekend Pop-Up Market" : "Neighborhood Demand Pocket",
      status: eventPotentialScore >= 75 ? "Strong near-term opportunity" : "Worth monitoring",
      reason: `${displayCity} scored ${eventPotentialScore}/100 for event potential using event density, tourist traffic, weekend demand, and food-type fit.`
    },
    boostIdea: {
      promo: boostPromo,
      expectedLift
    },
    scores,
    summary: `TruckFlow sees a ${finalScore}/100 opportunity for ${displayFoodType} in ${displayCity}. The strongest signals are demand (${demandScore}/100), menu gap (${menuGapScore}/100), and revenue lift potential (${revenueBoostScore}/100) for the current ${dayPart.replace("-", " ")} window.`
  };
}
