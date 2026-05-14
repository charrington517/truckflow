"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { hotspots } from "@/data/demo";

const colorByType = {
  demand: "#ff6a00",
  competition: "#2dd4bf",
  event: "#facc15"
};

function icon(type: keyof typeof colorByType) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:999px;background:${colorByType[type]};box-shadow:0 0 0 7px ${colorByType[type]}33,0 0 30px ${colorByType[type]};border:2px solid #0b0b0b"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

export function HotspotMap() {
  return (
    <div className="h-[420px] overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
      <MapContainer center={[45.5231, -122.6765]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {hotspots.map((spot) => (
          <Marker key={spot.id} position={spot.position} icon={icon(spot.type)}>
            <Popup>
              <div className="space-y-1">
                <strong>{spot.label}</strong>
                <p>{spot.metric}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
