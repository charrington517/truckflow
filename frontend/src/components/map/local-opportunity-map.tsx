"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { LocalDataMapResult, LocalDataMapSignal, LocalDataPlace } from "@/types/report";
import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  brewery: "#ff6a00",
  restaurant: "#ef4444",
  market: "#22c55e",
  industrial: "#64748b",
  tourism: "#38bdf8",
  college: "#a855f7",
  event_space: "#facc15"
};

function labelFor(value: string) {
  return value.replaceAll("_", " ");
}

function markerIcon(category: string) {
  const color = categoryColors[category] ?? "#ff6a00";
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:999px;background:${color};box-shadow:0 0 0 6px ${color}33,0 0 22px ${color};border:2px solid #0b0b0b"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function flattenPlaces(signals: LocalDataMapSignal[]) {
  const seen = new Set<string>();
  const places: Array<LocalDataPlace & { category: string }> = [];

  for (const signal of signals) {
    for (const place of signal.places) {
      const key = `${place.name}-${place.latitude}-${place.longitude}`;
      if (seen.has(key)) continue;
      seen.add(key);
      places.push({ ...place, category: signal.category });
    }
  }

  return places;
}

export function LocalOpportunityMap({ data }: { data: LocalDataMapResult }) {
  const places = flattenPlaces(data.signals);
  const center = data.center;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="font-semibold">Local Opportunity Map</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Map signals come from OpenStreetMap and may be incomplete. Verify details before operating.
            </p>
          </div>
          <Badge variant="outline">{places.length} mapped signals</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.signals.map((signal) => (
            <Badge key={signal.category} variant={signal.count > 0 ? "teal" : "secondary"}>
              {labelFor(signal.category)}: {signal.count}
            </Badge>
          ))}
        </div>
      </div>

      {center && places.length ? (
        <div className="h-[360px] md:h-[460px]">
          <MapContainer center={[center.latitude, center.longitude]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[center.latitude, center.longitude]} icon={markerIcon("center")}>
              <Popup>
                <strong>{data.city}</strong>
                <p>Search center</p>
              </Popup>
            </Marker>
            {places.map((place) => (
              <Marker key={`${place.name}-${place.latitude}-${place.longitude}-${place.category}`} position={[place.latitude, place.longitude]} icon={markerIcon(place.category)}>
                <Popup>
                  <div className="space-y-1">
                    <strong>{place.name}</strong>
                    <p>{labelFor(place.category)} / {place.type}</p>
                    <p>Source: {place.source}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center p-6 text-center text-sm text-muted-foreground">
          No mappable OpenStreetMap signals were found for this search yet.
        </div>
      )}
    </div>
  );
}
