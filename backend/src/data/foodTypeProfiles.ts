export type FoodTypeProfile = {
  foodType: string;
  aliases: string[];
  broadAppeal: number;
  lunchFit: number;
  dinnerFit: number;
  lateNightFit: number;
  eventFit: number;
  weatherResistance: number;
  uniqueness: number;
  averageTicketPotential: number;
};

export const foodTypeProfiles: FoodTypeProfile[] = [
  { foodType: "tacos", aliases: ["taco", "tacos"], broadAppeal: 92, lunchFit: 90, dinnerFit: 82, lateNightFit: 78, eventFit: 88, weatherResistance: 74, uniqueness: 52, averageTicketPotential: 70 },
  { foodType: "birria", aliases: ["birria"], broadAppeal: 86, lunchFit: 80, dinnerFit: 88, lateNightFit: 82, eventFit: 84, weatherResistance: 86, uniqueness: 78, averageTicketPotential: 82 },
  { foodType: "burgers", aliases: ["burger", "burgers"], broadAppeal: 90, lunchFit: 86, dinnerFit: 88, lateNightFit: 84, eventFit: 86, weatherResistance: 78, uniqueness: 40, averageTicketPotential: 76 },
  { foodType: "bbq", aliases: ["bbq", "barbecue", "barbeque"], broadAppeal: 82, lunchFit: 72, dinnerFit: 90, lateNightFit: 50, eventFit: 88, weatherResistance: 82, uniqueness: 66, averageTicketPotential: 88 },
  { foodType: "ramen", aliases: ["ramen"], broadAppeal: 76, lunchFit: 72, dinnerFit: 86, lateNightFit: 78, eventFit: 54, weatherResistance: 95, uniqueness: 82, averageTicketPotential: 84 },
  { foodType: "pizza", aliases: ["pizza"], broadAppeal: 94, lunchFit: 74, dinnerFit: 92, lateNightFit: 90, eventFit: 88, weatherResistance: 72, uniqueness: 45, averageTicketPotential: 78 },
  { foodType: "coffee", aliases: ["coffee", "espresso"], broadAppeal: 88, lunchFit: 54, dinnerFit: 25, lateNightFit: 38, eventFit: 66, weatherResistance: 90, uniqueness: 44, averageTicketPotential: 58 },
  { foodType: "seafood", aliases: ["seafood", "fish", "fish tacos"], broadAppeal: 74, lunchFit: 76, dinnerFit: 86, lateNightFit: 35, eventFit: 72, weatherResistance: 58, uniqueness: 80, averageTicketPotential: 90 },
  { foodType: "vegan", aliases: ["vegan", "plant based", "plant-based"], broadAppeal: 64, lunchFit: 76, dinnerFit: 74, lateNightFit: 50, eventFit: 70, weatherResistance: 68, uniqueness: 84, averageTicketPotential: 74 },
  { foodType: "breakfast", aliases: ["breakfast", "brunch"], broadAppeal: 86, lunchFit: 70, dinnerFit: 20, lateNightFit: 18, eventFit: 62, weatherResistance: 76, uniqueness: 55, averageTicketPotential: 66 },
  { foodType: "dessert", aliases: ["dessert", "ice cream", "sweets"], broadAppeal: 82, lunchFit: 48, dinnerFit: 70, lateNightFit: 72, eventFit: 86, weatherResistance: 46, uniqueness: 62, averageTicketPotential: 60 }
];

export const fallbackFoodTypeProfile: FoodTypeProfile = {
  foodType: "food",
  aliases: [],
  broadAppeal: 70,
  lunchFit: 70,
  dinnerFit: 70,
  lateNightFit: 55,
  eventFit: 65,
  weatherResistance: 65,
  uniqueness: 60,
  averageTicketPotential: 70
};

export function findFoodTypeProfile(foodType: string) {
  const normalized = foodType.trim().toLowerCase();
  return foodTypeProfiles.find((profile) => profile.aliases.includes(normalized)) ?? fallbackFoodTypeProfile;
}
