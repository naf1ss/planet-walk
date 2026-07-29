"use client";

import { MapContainer, Popup, TileLayer, CircleMarker } from "react-leaflet";
import { useRouter } from "next/navigation";
import { CAMPUS_MAP_STOPS, GETTYSBURG_COLLEGE_CENTER } from "@/lib/campus-map-stops";

/**
 * Interactive dark campus map with Planet Walk stops.
 */
export function CampusMap() {
  const router = useRouter();

  return (
    <div className="campus-map-root overflow-hidden rounded-sm border border-border bg-background-elevated shadow-[0_28px_70px_rgba(0,0,0,0.45)]">
      <MapContainer
        center={GETTYSBURG_COLLEGE_CENTER}
        zoom={16}
        minZoom={15}
        scrollWheelZoom
        className="h-[70vh] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {CAMPUS_MAP_STOPS.map((stop) => (
          <CircleMarker
            key={stop.slug}
            center={[stop.lat, stop.lng]}
            radius={8}
            pathOptions={{
              color: "#f5f7ff",
              weight: 1.2,
              fillColor: stop.color,
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="min-w-[11rem] space-y-2.5">
                <p className="text-sm font-semibold text-slate-900">{stop.name}</p>
                <p className="text-xs text-slate-700">{stop.landmark}</p>
                <button
                  type="button"
                  onClick={() => router.push(`/planet/${stop.slug}`)}
                  className="rounded-sm bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

