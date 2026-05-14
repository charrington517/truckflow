export type CityProfile = {
  city: string;
  aliases: string[];
  lunchDemand: number;
  dinnerDemand: number;
  lateNightDemand: number;
  eventDensity: number;
  foodTruckFriendliness: number;
  touristTraffic: number;
  officeWorkerDensity: number;
  industrialWorkerDensity: number;
  collegeCrowd: number;
  weekendDemand: number;
};

export const cityProfiles: CityProfile[] = [
  {
    city: "Portland, OR",
    aliases: ["portland", "portland or", "portland, or"],
    lunchDemand: 88,
    dinnerDemand: 82,
    lateNightDemand: 74,
    eventDensity: 86,
    foodTruckFriendliness: 96,
    touristTraffic: 78,
    officeWorkerDensity: 84,
    industrialWorkerDensity: 79,
    collegeCrowd: 63,
    weekendDemand: 88
  },
  {
    city: "Salem, OR",
    aliases: ["salem", "salem or", "salem, or"],
    lunchDemand: 72,
    dinnerDemand: 68,
    lateNightDemand: 45,
    eventDensity: 58,
    foodTruckFriendliness: 70,
    touristTraffic: 50,
    officeWorkerDensity: 73,
    industrialWorkerDensity: 67,
    collegeCrowd: 46,
    weekendDemand: 60
  },
  {
    city: "Eugene, OR",
    aliases: ["eugene", "eugene or", "eugene, or"],
    lunchDemand: 75,
    dinnerDemand: 78,
    lateNightDemand: 82,
    eventDensity: 72,
    foodTruckFriendliness: 80,
    touristTraffic: 55,
    officeWorkerDensity: 58,
    industrialWorkerDensity: 52,
    collegeCrowd: 94,
    weekendDemand: 76
  },
  {
    city: "Bend, OR",
    aliases: ["bend", "bend or", "bend, or"],
    lunchDemand: 70,
    dinnerDemand: 84,
    lateNightDemand: 58,
    eventDensity: 74,
    foodTruckFriendliness: 78,
    touristTraffic: 90,
    officeWorkerDensity: 60,
    industrialWorkerDensity: 43,
    collegeCrowd: 42,
    weekendDemand: 91
  },
  {
    city: "Lincoln City, OR",
    aliases: ["lincoln city", "lincoln city or", "lincoln city, or"],
    lunchDemand: 66,
    dinnerDemand: 72,
    lateNightDemand: 38,
    eventDensity: 55,
    foodTruckFriendliness: 61,
    touristTraffic: 92,
    officeWorkerDensity: 32,
    industrialWorkerDensity: 36,
    collegeCrowd: 18,
    weekendDemand: 89
  },
  {
    city: "Toledo, OR",
    aliases: ["toledo", "toledo or", "toledo, or"],
    lunchDemand: 62,
    dinnerDemand: 52,
    lateNightDemand: 22,
    eventDensity: 36,
    foodTruckFriendliness: 58,
    touristTraffic: 48,
    officeWorkerDensity: 28,
    industrialWorkerDensity: 86,
    collegeCrowd: 12,
    weekendDemand: 50
  },
  {
    city: "Newport, OR",
    aliases: ["newport", "newport or", "newport, or"],
    lunchDemand: 74,
    dinnerDemand: 82,
    lateNightDemand: 42,
    eventDensity: 62,
    foodTruckFriendliness: 66,
    touristTraffic: 95,
    officeWorkerDensity: 38,
    industrialWorkerDensity: 55,
    collegeCrowd: 20,
    weekendDemand: 93
  },
  {
    city: "Seattle, WA",
    aliases: ["seattle", "seattle wa", "seattle, wa"],
    lunchDemand: 92,
    dinnerDemand: 86,
    lateNightDemand: 78,
    eventDensity: 90,
    foodTruckFriendliness: 82,
    touristTraffic: 88,
    officeWorkerDensity: 94,
    industrialWorkerDensity: 70,
    collegeCrowd: 72,
    weekendDemand: 87
  }
];

export const fallbackCityProfile: CityProfile = {
  city: "Your Market",
  aliases: [],
  lunchDemand: 68,
  dinnerDemand: 66,
  lateNightDemand: 45,
  eventDensity: 52,
  foodTruckFriendliness: 62,
  touristTraffic: 55,
  officeWorkerDensity: 55,
  industrialWorkerDensity: 55,
  collegeCrowd: 45,
  weekendDemand: 65
};

export function findCityProfile(city: string) {
  const normalized = city.trim().toLowerCase();
  return cityProfiles.find((profile) => profile.aliases.includes(normalized)) ?? fallbackCityProfile;
}
