import { BODY_CONTENT, BODY_SLUGS, type BodySlug } from "@/lib/planet-content";

export type CampusMapStop = {
  slug: BodySlug;
  name: string;
  color: string;
  landmark: string;
  lat: number;
  lng: number;
  index: number;
  /** Optional location photo; blank until assets are uploaded */
  locationImage?: string;
};

/** Gettysburg College main campus center */
export const GETTYSBURG_COLLEGE_CENTER: [number, number] = [39.836597, -77.236792];

/**
 * Planet Walk map stations at real campus landmarks.
 * Anchors use published / USGS / OSM building positions so the path
 * zig-zags through campus (not a straight Planetarium→Observatory line).
 */
const STOP_COORDS: Record<BodySlug, [number, number]> = {
  // Masters Hall / Hatter Planetarium cluster
  sun: [39.83528, -77.23639],
  mercury: [39.83542, -77.23658],
  venus: [39.83512, -77.23648],
  earth: [39.83498, -77.23628],
  // Eddie Plank Gymnasium
  mars: [39.83583, -77.23639],
  // Glatfelter Lodge
  ceres: [39.8353, -77.2361],
  // Science Center walkway (between Science Center & McCreary)
  jupiter: [39.83493, -77.23688],
  // Glatfelter Hall
  saturn: [39.83444, -77.23583],
  // Schmucker Hall (ceramics studio exterior)
  uranus: [39.8339, -77.2342],
  // Eisenhower House — Admissions
  neptune: [39.8353, -77.2319],
  // College Observatory (NW campus edge)
  pluto: [39.840278, -77.240556],
};

/** Ordered Sun → Pluto stops for the walk path */
export const CAMPUS_MAP_STOPS: CampusMapStop[] = BODY_SLUGS.map((slug, index) => {
  const body = BODY_CONTENT[slug];
  const [lat, lng] = STOP_COORDS[slug];
  return {
    slug,
    name: body.name,
    color: body.color,
    landmark: body.campus.landmark,
    lat,
    lng,
    index,
  };
});

export const WALK_PATH: [number, number][] = CAMPUS_MAP_STOPS.map((s) => [
  s.lat,
  s.lng,
]);
