export type EventOpportunityType = {
  type: string;
  label: string;
  description: string;
  bestFoodTypes: string[];
  bestCityTraits: string[];
  averageOpportunityScore: number;
  suggestedAction: string;
  typicalLeadTime: string;
};

export const eventOpportunityProfiles: EventOpportunityType[] = [
  {
    type: "farmers_market",
    label: "Farmers Market Vendor Slot",
    description: "Recurring market traffic with predictable morning and lunch demand.",
    bestFoodTypes: ["coffee", "breakfast", "vegan", "dessert", "tacos"],
    bestCityTraits: ["weekendDemand", "touristTraffic", "foodTruckFriendliness"],
    averageOpportunityScore: 78,
    suggestedAction: "Check the market vendor page and ask about rotating food truck availability.",
    typicalLeadTime: "2-6 weeks"
  },
  {
    type: "street_festival",
    label: "Street Festival Food Vendor",
    description: "Compressed foot traffic around public events and neighborhood festivals.",
    bestFoodTypes: ["tacos", "birria", "burgers", "bbq", "pizza", "dessert"],
    bestCityTraits: ["eventDensity", "weekendDemand", "touristTraffic"],
    averageOpportunityScore: 84,
    suggestedAction: "Build a compact event menu and contact the organizer before vendor deadlines.",
    typicalLeadTime: "4-10 weeks"
  },
  {
    type: "brewery_pop_up",
    label: "Brewery Pop-Up Rotation",
    description: "Evening pop-up demand near breweries, taprooms, and casual gathering spots.",
    bestFoodTypes: ["tacos", "birria", "burgers", "bbq", "pizza", "ramen"],
    bestCityTraits: ["dinnerDemand", "foodTruckFriendliness", "weekendDemand"],
    averageOpportunityScore: 80,
    suggestedAction: "Pitch a two-night pop-up with a simple pairing menu.",
    typicalLeadTime: "1-4 weeks"
  },
  {
    type: "office_lunch",
    label: "Office Lunch Rotation",
    description: "Weekday lunch demand from office clusters and business parks.",
    bestFoodTypes: ["tacos", "birria", "burgers", "coffee", "breakfast", "vegan"],
    bestCityTraits: ["officeWorkerDensity", "lunchDemand", "foodTruckFriendliness"],
    averageOpportunityScore: 76,
    suggestedAction: "Contact property managers and offer a fixed lunch window with preorder support.",
    typicalLeadTime: "1-3 weeks"
  },
  {
    type: "college_event",
    label: "College Event or Late-Night Crowd",
    description: "Campus events, student nights, and late food gaps.",
    bestFoodTypes: ["ramen", "pizza", "burgers", "tacos", "dessert", "coffee"],
    bestCityTraits: ["collegeCrowd", "lateNightDemand", "eventDensity"],
    averageOpportunityScore: 82,
    suggestedAction: "Target student org calendars and late-night event windows.",
    typicalLeadTime: "2-5 weeks"
  },
  {
    type: "waterfront_event",
    label: "Waterfront Event Edge",
    description: "Tourist and event traffic near waterfronts, marinas, and public gathering areas.",
    bestFoodTypes: ["seafood", "tacos", "dessert", "coffee", "pizza"],
    bestCityTraits: ["touristTraffic", "eventDensity", "weekendDemand"],
    averageOpportunityScore: 86,
    suggestedAction: "Look for marina, concert, and waterfront vendor applications.",
    typicalLeadTime: "3-8 weeks"
  },
  {
    type: "tourist_market",
    label: "Tourist Market Stand",
    description: "Visitor-heavy areas where approachable menus and fast service matter.",
    bestFoodTypes: ["seafood", "coffee", "dessert", "tacos", "pizza", "breakfast"],
    bestCityTraits: ["touristTraffic", "weekendDemand", "dinnerDemand"],
    averageOpportunityScore: 83,
    suggestedAction: "Package a visitor-friendly special and confirm temporary vending rules.",
    typicalLeadTime: "2-6 weeks"
  },
  {
    type: "community_fair",
    label: "Community Fair Vendor Call",
    description: "Local fairs and school/community fundraisers with family traffic.",
    bestFoodTypes: ["burgers", "bbq", "pizza", "dessert", "tacos", "coffee"],
    bestCityTraits: ["weekendDemand", "foodTruckFriendliness", "eventDensity"],
    averageOpportunityScore: 72,
    suggestedAction: "Prepare a family-priced offer and contact local organizers.",
    typicalLeadTime: "3-8 weeks"
  },
  {
    type: "sports_event",
    label: "Sports Event Food Window",
    description: "Pre-game and post-game traffic with quick-service demand.",
    bestFoodTypes: ["burgers", "pizza", "tacos", "bbq", "dessert"],
    bestCityTraits: ["eventDensity", "lateNightDemand", "weekendDemand"],
    averageOpportunityScore: 79,
    suggestedAction: "Use a short high-speed menu and scout legal staging zones near venues.",
    typicalLeadTime: "2-6 weeks"
  },
  {
    type: "private_catering",
    label: "Private Catering Lead",
    description: "Office, wedding, and private party catering where average ticket can rise.",
    bestFoodTypes: ["bbq", "pizza", "seafood", "vegan", "birria", "dessert"],
    bestCityTraits: ["dinnerDemand", "touristTraffic", "officeWorkerDensity"],
    averageOpportunityScore: 75,
    suggestedAction: "Create a one-page catering menu and pitch local venues.",
    typicalLeadTime: "2-12 weeks"
  },
  {
    type: "city_permit_window",
    label: "City Permit Window",
    description: "Permit and temporary vending windows worth monitoring before event season.",
    bestFoodTypes: ["tacos", "birria", "coffee", "seafood", "vegan", "burgers", "ramen"],
    bestCityTraits: ["foodTruckFriendliness", "eventDensity", "touristTraffic"],
    averageOpportunityScore: 70,
    suggestedAction: "Review city vending rules and prepare documents before peak season.",
    typicalLeadTime: "4-12 weeks"
  },
  {
    type: "seasonal_vendor_call",
    label: "Seasonal Vendor Call",
    description: "Seasonal markets, holiday events, and summer visitor programs.",
    bestFoodTypes: ["coffee", "dessert", "seafood", "tacos", "bbq", "breakfast"],
    bestCityTraits: ["touristTraffic", "weekendDemand", "eventDensity"],
    averageOpportunityScore: 81,
    suggestedAction: "Search seasonal vendor calls and apply early with photos and menu proof.",
    typicalLeadTime: "6-14 weeks"
  }
];
