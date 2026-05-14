export type EvidenceLevel = "verified" | "nearby" | "model" | "low_confidence";

export type LocalRealityProfile = {
  city: string;
  marketReality: string;
  localNotes: string[];
  nearbyMarkets: string[];
  avoidUnverifiedTypes: string[];
  favoredOpportunityTypes: string[];
  cautionOpportunityTypes: string[];
  defaultEvidenceLevel: EvidenceLevel;
  researchDisabledNote: string;
};

const profiles: LocalRealityProfile[] = [
  {
    city: "Toledo, OR",
    marketReality: "Small inland coastal Oregon city with limited nightlife and limited dense downtown lunch traffic.",
    localNotes: [
      "Toledo should not default to brewery or nightlife recommendations without a verified source.",
      "Stronger nearby opportunities are more likely in Newport, Lincoln City, coastal tourism, industrial/worksite lunches, community events, and private catering.",
      "Specific vendor calls, brewery rotations, and permit openings need verification before acting."
    ],
    nearbyMarkets: ["Newport, OR", "Lincoln City, OR"],
    avoidUnverifiedTypes: ["brewery_pop_up", "college_event", "sports_event", "waterfront_event", "tourist_market"],
    favoredOpportunityTypes: ["community_fair", "office_lunch", "private_catering", "street_festival", "seasonal_vendor_call"],
    cautionOpportunityTypes: ["city_permit_window", "farmers_market"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so this Toledo report is based on TruckFlow's scoring model and local profile assumptions. Verify specific events, businesses, permits, and vending rules before acting."
  },
  {
    city: "Newport, OR",
    marketReality: "Coastal visitor market with stronger tourism, waterfront, seafood, and seasonal event potential.",
    localNotes: [
      "Waterfront and tourist recommendations are plausible but still need source verification.",
      "Seasonal demand can vary sharply with weather and visitor traffic."
    ],
    nearbyMarkets: ["Toledo, OR", "Lincoln City, OR"],
    avoidUnverifiedTypes: [],
    favoredOpportunityTypes: ["waterfront_event", "tourist_market", "seasonal_vendor_call", "community_fair", "private_catering"],
    cautionOpportunityTypes: ["city_permit_window"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so Newport opportunities are model estimates based on coastal tourism and local profile assumptions."
  },
  {
    city: "Lincoln City, OR",
    marketReality: "Coastal tourism market with weekend, seasonal, visitor, and family traffic potential.",
    localNotes: [
      "Tourism-oriented opportunities are plausible but should be verified against current event calendars.",
      "Weather and seasonality can change the value of any location quickly."
    ],
    nearbyMarkets: ["Newport, OR", "Toledo, OR"],
    avoidUnverifiedTypes: [],
    favoredOpportunityTypes: ["tourist_market", "seasonal_vendor_call", "community_fair", "waterfront_event", "private_catering"],
    cautionOpportunityTypes: ["city_permit_window"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so Lincoln City opportunities are model estimates based on coastal tourism and local profile assumptions."
  },
  {
    city: "Portland, OR",
    marketReality: "Large metro food-truck market with many pods, events, breweries, offices, and stronger competition.",
    localNotes: [
      "Recommendations can be more specific once live research verifies current pods, events, and competitor density.",
      "Competition should be treated as high until specific gaps are verified."
    ],
    nearbyMarkets: ["Beaverton, OR", "Gresham, OR", "Vancouver, WA"],
    avoidUnverifiedTypes: [],
    favoredOpportunityTypes: ["brewery_pop_up", "office_lunch", "street_festival", "seasonal_vendor_call", "farmers_market"],
    cautionOpportunityTypes: ["city_permit_window"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so Portland recommendations are model estimates and should be checked against current events, pods, and permitting rules."
  },
  {
    city: "Eugene, OR",
    marketReality: "College and community event market with campus-adjacent, late-night, and weekend potential.",
    localNotes: [
      "College recommendations are plausible but should be verified against current campus calendars.",
      "Private events and community fairs can be stronger than generic downtown assumptions."
    ],
    nearbyMarkets: ["Springfield, OR"],
    avoidUnverifiedTypes: [],
    favoredOpportunityTypes: ["college_event", "community_fair", "farmers_market", "street_festival", "office_lunch"],
    cautionOpportunityTypes: ["city_permit_window"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so Eugene recommendations are model estimates based on college and community-event assumptions."
  },
  {
    city: "Bend, OR",
    marketReality: "Tourism, outdoor recreation, brewery, and weekend visitor market with meaningful competition.",
    localNotes: [
      "Brewery and event recommendations are plausible but still need verification against current host schedules.",
      "Premium coffee, breakfast, and event bundles can fit visitor traffic."
    ],
    nearbyMarkets: ["Redmond, OR", "Sisters, OR"],
    avoidUnverifiedTypes: [],
    favoredOpportunityTypes: ["brewery_pop_up", "tourist_market", "seasonal_vendor_call", "farmers_market", "private_catering"],
    cautionOpportunityTypes: ["city_permit_window"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so Bend recommendations are model estimates based on tourism and local profile assumptions."
  },
  {
    city: "Salem, OR",
    marketReality: "Capital city market with office, government, community event, and weekend demand potential.",
    localNotes: [
      "Office lunch and civic/community event opportunities are plausible but need verification.",
      "Do not assume specific permit windows or vendor calls without a source."
    ],
    nearbyMarkets: ["Keizer, OR", "Albany, OR"],
    avoidUnverifiedTypes: [],
    favoredOpportunityTypes: ["office_lunch", "community_fair", "street_festival", "farmers_market", "private_catering"],
    cautionOpportunityTypes: ["city_permit_window", "brewery_pop_up"],
    defaultEvidenceLevel: "model",
    researchDisabledNote: "Live market research is not currently enabled, so Salem recommendations are model estimates based on civic, office, and community-event assumptions."
  }
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findLocalRealityProfile(city: string): LocalRealityProfile {
  const normalized = normalize(city);
  return (
    profiles.find((profile) => normalize(profile.city) === normalized) ?? {
      city,
      marketReality: "TruckFlow does not have a city-specific local profile for this market yet.",
      localNotes: [
        "Recommendations are based on the scoring model only.",
        "Specific businesses, events, permits, and vendor openings must be verified before acting."
      ],
      nearbyMarkets: [],
      avoidUnverifiedTypes: [],
      favoredOpportunityTypes: ["community_fair", "office_lunch", "private_catering", "farmers_market"],
      cautionOpportunityTypes: ["city_permit_window", "brewery_pop_up"],
      defaultEvidenceLevel: "low_confidence",
      researchDisabledNote: "Live market research is not currently enabled, and TruckFlow does not have a detailed local profile for this city. Treat this report as a low-confidence model estimate."
    }
  );
}

export function evidenceLabel(level: EvidenceLevel) {
  switch (level) {
    case "verified":
      return "Verified";
    case "nearby":
      return "Nearby";
    case "model":
      return "Model Estimate";
    case "low_confidence":
      return "Needs Verification";
  }
}
