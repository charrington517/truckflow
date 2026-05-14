"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { Competitor } from "@/types/report";
import { Badge } from "@/components/ui/badge";

function markerIcon(score: number) {
  const color = score >= 70 ? "#ef4444" : score >= 45 ? "#ff6a00" : "#38bdf8";
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:999px;background:${color};box-shadow:0 0 0 6px ${color}33,0 0 24px ${color};border:2px solid #0b0b0b"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

export function CompetitorMap({ competitors, city }: { competitors: Competitor[]; city: string }) {
  const mapped = competitors.filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number");
  const center = mapped[0] ? [mapped[0].latitude as number, mapped[0].longitude as number] as [number, number] : null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="font-semibold">Competitor Location Map</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Competitor map signals come from public data or manual admin entries and may be incomplete.
            </p>
          </div>
          <Badge variant="outline">{mapped.length} mapped</Badge>
        </div>
      </div>
      {center ? (
        <div className="h-[360px] md:h-[460px]">
          <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {mapped.map((competitor) => (
              <Marker key={competitor.id} position={[competitor.latitude as number, competitor.longitude as number]} icon={markerIcon(competitor.overlapScore ?? 0)}>
                <Popup>
                  <div className="space-y-1">
                    <strong>{competitor.name}</strong>
                    <p>{competitor.foodType || "Food type unknown"}</p>
                    <p>Confidence: {competitor.confidence || "unknown"}</p>
                    <p>Overlap: {competitor.overlapScore ?? 0}/100</p>
                    <p>Source: {competitor.source || "unknown"}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid min-h-44 place-items-center p-6 text-center text-sm text-muted-foreground">
          No mapped competitor coordinates found for {city}. Showing list-only signals below.
        </div>
      )}
    </div>
  );
}
