export type CityCoordinate = {
  city: string;
  latitude: number;
  longitude: number;
};

const coordinates: CityCoordinate[] = [
  { city: "Toledo, OR", latitude: 44.6215, longitude: -123.9384 },
  { city: "Newport, OR", latitude: 44.6368, longitude: -124.0535 },
  { city: "Lincoln City, OR", latitude: 44.9582, longitude: -124.0179 },
  { city: "Portland, OR", latitude: 45.5152, longitude: -122.6784 },
  { city: "Eugene, OR", latitude: 44.0521, longitude: -123.0868 },
  { city: "Bend, OR", latitude: 44.0582, longitude: -121.3153 },
  { city: "Salem, OR", latitude: 44.9429, longitude: -123.0351 },
  { city: "Seattle, WA", latitude: 47.6062, longitude: -122.3321 }
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findCityCoordinate(city: string) {
  const normalized = normalize(city);
  return coordinates.find((coordinate) => normalize(coordinate.city) === normalized);
}
