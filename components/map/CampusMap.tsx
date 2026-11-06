"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  CAMPUS_MAP_STOPS,
  GETTYSBURG_COLLEGE_CENTER,
  WALK_PATH,
  type CampusMapStop,
} from "@/lib/campus-map-stops";
import type { BodySlug } from "@/lib/planet-content";

type CampusMapProps = {
  selectedSlug: BodySlug | null;
  onSelect: (slug: BodySlug) => void;
  previewSlug: BodySlug | null;
  onPreviewPhoto: (stop: CampusMapStop) => void;
};

function FitWalkBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(WALK_PATH);
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 17 });
  }, [map]);

  return null;
}

function FocusSelected({
  stop,
  markerRefs,
}: {
  stop: CampusMapStop | null;
  markerRefs: React.MutableRefObject<Partial<Record<BodySlug, L.Marker>>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!stop) return;
    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 17), {
      duration: 0.7,
    });
    const marker = markerRefs.current[stop.slug];
    const t = window.setTimeout(() => marker?.openPopup(), 320);
    return () => window.clearTimeout(t);
  }, [stop, map, markerRefs]);

  return null;
}

function stopIcon(stop: CampusMapStop, selected: boolean) {
  const size = selected ? 34 : 28;
  return L.divIcon({
    className: "campus-stop-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span class="campus-stop-pin${selected ? " is-selected" : ""}" style="--stop-color:${stop.color}">${stop.index + 1}</span>`,
  });
}

/**
 * Light campus map — OSM basemap (no API key), walk path, numbered stop markers.
 */
export function CampusMap({
  selectedSlug,
  onSelect,
  previewSlug,
  onPreviewPhoto,
}: CampusMapProps) {
  const markerRefs = useRef<Partial<Record<BodySlug, L.Marker>>>({});
  const selected =
    CAMPUS_MAP_STOPS.find((s) => s.slug === selectedSlug) ?? null;

  const icons = useMemo(() => {
    const map = {} as Record<BodySlug, L.DivIcon>;
    for (const stop of CAMPUS_MAP_STOPS) {
      map[stop.slug] = stopIcon(stop, stop.slug === selectedSlug);
    }
    return map;
  }, [selectedSlug]);

  return (
    <div className="campus-map-root absolute inset-0 overflow-hidden">
      <MapContainer
        center={GETTYSBURG_COLLEGE_CENTER}
        zoom={16}
        minZoom={14}
        maxZoom={19}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FitWalkBounds />
        <FocusSelected stop={selected} markerRefs={markerRefs} />

        <Polyline
          positions={WALK_PATH}
          pathOptions={{
            color: "#1d4ed8",
            weight: 3.5,
            opacity: 0.55,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
        <Polyline
          positions={WALK_PATH}
          pathOptions={{
            color: "#93c5fd",
            weight: 1.5,
            opacity: 0.9,
            dashArray: "2 10",
            lineCap: "round",
          }}
        />

        {CAMPUS_MAP_STOPS.map((stop) => (
          <Marker
            key={stop.slug}
            position={[stop.lat, stop.lng]}
            icon={icons[stop.slug]}
            ref={(ref) => {
              if (ref) markerRefs.current[stop.slug] = ref;
            }}
            eventHandlers={{
              click: () => onSelect(stop.slug),
            }}
          >
            <Popup>
              <div className="campus-map-popup">
                <p className="campus-map-popup__index">Stop {stop.index + 1}</p>
                <p className="campus-map-popup__title">{stop.name}</p>
                <p className="campus-map-popup__landmark">{stop.landmark}</p>
                <div className="campus-map-popup__photo">
                  <p className="campus-map-popup__photo-label">Location Picture</p>
                  {stop.locationImage ? (
                    <button
                      type="button"
                      className="campus-map-popup__photo-btn"
                      aria-label={`Expand ${stop.name} location picture`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPreviewPhoto(stop);
                      }}
                    >
                      {previewSlug === stop.slug ? (
                        <span className="campus-map-popup__photo-spacer" />
                      ) : (
                        <motion.span
                          layoutId={`location-photo-${stop.slug}`}
                          className="campus-map-popup__photo-frame"
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 34,
                            mass: 0.85,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={stop.locationImage}
                            alt={`${stop.name} campus location`}
                            className="campus-map-popup__photo-img"
                            draggable={false}
                          />
                        </motion.span>
                      )}
                    </button>
                  ) : (
                    <div className="campus-map-popup__photo-blank" aria-hidden />
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
