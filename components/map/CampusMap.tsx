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
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 17, animate: false });
  }, [map]);

  return null;
}

const DRAW_MS = 2600;

/**
 * Walk route: soft glow + solid core that draws itself Sun → Pluto on load,
 * then a stream of light dots flowing outward along it.
 */
function WalkPath() {
  const glowRef = useRef<L.Polyline>(null);
  const coreRef = useRef<L.Polyline>(null);
  const flowRef = useRef<L.Polyline>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = [glowRef.current, coreRef.current]
      .map((l) => l?.getElement() as SVGPathElement | undefined)
      .filter((el): el is SVGPathElement => Boolean(el));
    const flow = flowRef.current?.getElement() as SVGPathElement | undefined;

    if (reduce) {
      flow?.classList.add("is-on");
      return;
    }

    for (const el of paths) {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.getBoundingClientRect(); // commit start state before transitioning
      el.style.transition = `stroke-dashoffset ${DRAW_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
      el.style.strokeDashoffset = "0";
    }

    const done = window.setTimeout(() => {
      // Leaflet redraws paths on zoom; drop the dash trick once drawn.
      for (const el of paths) {
        el.style.transition = "";
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
      }
      flow?.classList.add("is-on");
    }, DRAW_MS + 100);

    return () => window.clearTimeout(done);
  }, []);

  return (
    <>
      <Polyline
        ref={glowRef}
        positions={WALK_PATH}
        interactive={false}
        pathOptions={{
          color: "#3b82f6",
          weight: 14,
          opacity: 0.16,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      <Polyline
        ref={coreRef}
        positions={WALK_PATH}
        interactive={false}
        pathOptions={{
          color: "#1d4ed8",
          weight: 3,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      <Polyline
        ref={flowRef}
        positions={WALK_PATH}
        interactive={false}
        pathOptions={{
          className: "walk-path-flow",
          color: "#ffffff",
          weight: 2.5,
          opacity: 0.95,
          dashArray: "0.1 18",
          lineCap: "round",
        }}
      />
    </>
  );
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

/** Each stop is a tiny planet in its own colour; the selected one pulses. */
function stopIcon(stop: CampusMapStop, selected: boolean) {
  const size = selected ? 36 : 28;
  return L.divIcon({
    className: "campus-stop-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
    html: `<span class="campus-stop-pin${selected ? " is-selected" : ""}" style="--stop-color:${stop.color}"><span class="campus-stop-pin__num">${stop.index + 1}</span></span>`,
  });
}

/**
 * Light campus map — muted OSM basemap (no API key), animated walk
 * path, planet-coloured stop markers.
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
        {/* OpenStreetMap tiles (free, no key), muted in CSS (.map-tiles-muted)
            so the walk path and planet pins carry the colour */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-muted"
          maxZoom={19}
        />

        <FitWalkBounds />
        <FocusSelected stop={selected} markerRefs={markerRefs} />
        <WalkPath />

        {CAMPUS_MAP_STOPS.map((stop) => (
          <Marker
            key={stop.slug}
            position={[stop.lat, stop.lng]}
            icon={icons[stop.slug]}
            zIndexOffset={stop.slug === selectedSlug ? 1000 : 0}
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
