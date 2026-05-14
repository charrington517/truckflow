import type { FreeReportRequest, HotspotLocation } from "../types/truckflow";

export function buildFreeReport({ city, foodType }: FreeReportRequest) {
  return {
    city,
    foodType,
    bestSpot: {
      name: "Industrial Lunch Corridor",
      timeWindow: "11:30 AM - 2:00 PM",
      reason: "High worker density and low direct competition nearby.",
      score: 87
    },
    menuOpportunity: {
      item: "Birria Ramen",
      reason: "Strong taco demand nearby with limited fusion offerings.",
      confidence: 82
    },
    eventOpportunity: {
      name: "Weekend Pop-Up Market",
      status: "Vendor applications likely open",
      reason: "Recurring local market with food vendor presence."
    },
    boostIdea: {
      promo: "3 tacos + consome lunch combo",
      expectedLift: "+18%"
    }
  };
}

export const demoLocations: HotspotLocation[] = [
  {
    name: "Industrial Lunch Corridor",
    latitude: 45.5421,
    longitude: -122.6814,
    score: 87,
    demandLevel: "high",
    competitionLevel: "low",
    recommendation: "Prioritize weekday lunch. Park near warehouse shift-change routes."
  },
  {
    name: "Pearl District Office Spine",
    latitude: 45.5289,
    longitude: -122.6819,
    score: 84,
    demandLevel: "high",
    competitionLevel: "medium",
    recommendation: "Run a premium combo and capture office lunch traffic before 1:30 PM."
  },
  {
    name: "Waterfront Event Edge",
    latitude: 45.5152,
    longitude: -122.6731,
    score: 79,
    demandLevel: "medium",
    competitionLevel: "medium",
    recommendation: "Best for dinner windows when events push foot traffic north."
  },
  {
    name: "Hawthorne Late Lunch Strip",
    latitude: 45.5122,
    longitude: -122.6251,
    score: 74,
    demandLevel: "medium",
    competitionLevel: "low",
    recommendation: "Good test zone for fusion items and limited-time offers."
  }
];

export const menuOpportunities = [
  {
    item: "Birria Ramen",
    foodType: "tacos",
    confidence: 82,
    reason: "Strong taco demand nearby with limited fusion offerings.",
    suggestedPrice: "$14"
  },
  {
    item: "Loaded Al Pastor Fries",
    foodType: "tacos",
    confidence: 78,
    reason: "Late lunch customers over-index on shareable, fast-serve items.",
    suggestedPrice: "$12"
  },
  {
    item: "Citrus Agua Fresca Combo",
    foodType: "drinks",
    confidence: 71,
    reason: "Attach-rate opportunity during clear weather and high pedestrian flow.",
    suggestedPrice: "+$4 combo"
  }
];

export const eventOpportunities = [
  {
    name: "Weekend Pop-Up Market",
    status: "Vendor applications likely open",
    dateWindow: "This weekend",
    reason: "Recurring local market with food vendor presence.",
    action: "Check vendor requirements and arrival window."
  },
  {
    name: "Waterfront Concert Night",
    status: "Permit review recommended",
    dateWindow: "Friday evening",
    reason: "Pre-show traffic creates a 90-minute high-conversion window.",
    action: "Stage nearby before 5:10 PM and run a compact menu."
  },
  {
    name: "Campus Late-Night Flow",
    status: "Low-friction opportunity",
    dateWindow: "Thursday-Saturday",
    reason: "Student traffic rises after 9 PM with limited hot food options.",
    action: "Offer a late-night combo and mobile-order pickup lane."
  }
];

export const boostIdeas = [
  {
    promo: "3 tacos + consome lunch combo",
    expectedLift: "+18%",
    bestWindow: "11:30 AM - 1:30 PM",
    reason: "Bundled lunch offer reduces decision friction in high-density work zones."
  },
  {
    promo: "Rainy-day pickup discount",
    expectedLift: "+11%",
    bestWindow: "Low-weather foot traffic",
    reason: "Pushes urgency when pedestrian movement drops."
  },
  {
    promo: "Event rush express menu",
    expectedLift: "+22%",
    bestWindow: "90 minutes before event start",
    reason: "Short menu improves line speed during compressed demand."
  }
];
