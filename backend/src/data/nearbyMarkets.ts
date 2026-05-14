export type NearbyMarketProfile = {
  city: string;
  distanceMiles: number;
  reason: string;
  strongestOpportunityTypes: string[];
};

const nearbyMarkets: Record<string, NearbyMarketProfile[]> = {
  "toledo, or": [
    {
      city: "Newport, OR",
      distanceMiles: 7,
      reason: "Nearby coastal market with stronger tourism, waterfront, seafood, visitor, and event signals than Toledo itself.",
      strongestOpportunityTypes: ["waterfront_event", "tourist_market", "seasonal_vendor_call", "private_catering"]
    },
    {
      city: "Lincoln City, OR",
      distanceMiles: 25,
      reason: "Nearby coastal tourism market with seasonal visitor traffic and event potential.",
      strongestOpportunityTypes: ["tourist_market", "seasonal_vendor_call", "community_fair"]
    },
    {
      city: "Corvallis, OR",
      distanceMiles: 47,
      reason: "Regional college and event market that may fit larger catering, campus, and pop-up opportunities.",
      strongestOpportunityTypes: ["college_event", "private_catering", "street_festival"]
    }
  ],
  "newport, or": [
    {
      city: "Toledo, OR",
      distanceMiles: 7,
      reason: "Nearby inland worksite and community market that may support lunch or catering routes.",
      strongestOpportunityTypes: ["office_lunch", "community_fair", "private_catering"]
    },
    {
      city: "Lincoln City, OR",
      distanceMiles: 26,
      reason: "Additional coastal tourism market with weekend and seasonal event potential.",
      strongestOpportunityTypes: ["tourist_market", "seasonal_vendor_call", "waterfront_event"]
    }
  ],
  "lincoln city, or": [
    {
      city: "Newport, OR",
      distanceMiles: 26,
      reason: "Nearby coastal hub with waterfront, seafood, visitor, and event activity.",
      strongestOpportunityTypes: ["waterfront_event", "tourist_market", "seasonal_vendor_call"]
    },
    {
      city: "Depoe Bay, OR",
      distanceMiles: 13,
      reason: "Small coastal visitor market where tourism-oriented specials may fit peak weekends.",
      strongestOpportunityTypes: ["tourist_market", "seasonal_vendor_call", "community_fair"]
    }
  ],
  "salem, or": [
    {
      city: "Keizer, OR",
      distanceMiles: 5,
      reason: "Nearby suburban market with family, retail, and community event traffic.",
      strongestOpportunityTypes: ["community_fair", "private_catering", "office_lunch"]
    },
    {
      city: "Silverton, OR",
      distanceMiles: 15,
      reason: "Nearby town with community events and weekend visitor potential.",
      strongestOpportunityTypes: ["community_fair", "seasonal_vendor_call", "farmers_market"]
    },
    {
      city: "Albany, OR",
      distanceMiles: 24,
      reason: "Regional market with community events, office lunch, and private catering potential.",
      strongestOpportunityTypes: ["office_lunch", "community_fair", "private_catering"]
    }
  ],
  "eugene, or": [
    {
      city: "Springfield, OR",
      distanceMiles: 5,
      reason: "Nearby worksite, community, and event market connected to the Eugene metro.",
      strongestOpportunityTypes: ["office_lunch", "community_fair", "private_catering"]
    },
    {
      city: "Cottage Grove, OR",
      distanceMiles: 21,
      reason: "Nearby smaller community market with event and catering potential.",
      strongestOpportunityTypes: ["community_fair", "seasonal_vendor_call", "private_catering"]
    }
  ],
  "bend, or": [
    {
      city: "Redmond, OR",
      distanceMiles: 17,
      reason: "Nearby Central Oregon market with events, airport/visitor flow, and family traffic.",
      strongestOpportunityTypes: ["community_fair", "seasonal_vendor_call", "private_catering"]
    },
    {
      city: "Sisters, OR",
      distanceMiles: 22,
      reason: "Nearby visitor and event town with seasonal tourism upside.",
      strongestOpportunityTypes: ["tourist_market", "seasonal_vendor_call", "community_fair"]
    }
  ],
  "portland, or": [
    {
      city: "Beaverton, OR",
      distanceMiles: 8,
      reason: "Nearby office, suburban, and event market in the Portland metro.",
      strongestOpportunityTypes: ["office_lunch", "private_catering", "farmers_market"]
    },
    {
      city: "Gresham, OR",
      distanceMiles: 15,
      reason: "Nearby east metro market with community, family, and event demand.",
      strongestOpportunityTypes: ["community_fair", "seasonal_vendor_call", "private_catering"]
    },
    {
      city: "Vancouver, WA",
      distanceMiles: 9,
      reason: "Nearby cross-river market with waterfront, office, and community event potential.",
      strongestOpportunityTypes: ["waterfront_event", "office_lunch", "community_fair"]
    },
    {
      city: "Hillsboro, OR",
      distanceMiles: 19,
      reason: "Nearby office and industrial market with lunch rotation potential.",
      strongestOpportunityTypes: ["office_lunch", "private_catering", "farmers_market"]
    }
  ]
};

export function normalizeMarketCity(city: string) {
  return city.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getNearbyMarketProfiles(city: string) {
  return nearbyMarkets[normalizeMarketCity(city)] ?? [];
}
