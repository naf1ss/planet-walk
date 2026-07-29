import { BODY_CONTENT, type BodySlug } from "@/lib/planet-content";

export type CampusMapStop = {
  slug: BodySlug;
  name: string;
  color: string;
  landmark: string;
  lat: number;
  lng: number;
};

/** Gettysburg College main campus center */
export const GETTYSBURG_COLLEGE_CENTER: [number, number] = [39.836597, -77.236792];

/**
 * Planet Walk map stations.
 * Planetarium/Observatory points use published facility coordinates; the
 * in-between stops follow the campus walk path used by the project.
 */
const STOP_COORDS: Record<BodySlug, [number, number]> = {
  sun: [39.835556, -77.236111],
  mercury: [39.83578, -77.23635],
  venus: [39.83602, -77.23668],
  earth: [39.83628, -77.23696],
  mars: [39.83662, -77.23735],
  ceres: [39.83698, -77.23778],
  jupiter: [39.83735, -77.2382],
  saturn: [39.83815, -77.239],
  uranus: [39.839, -77.23965],
  neptune: [39.83965, -77.24015],
  pluto: [39.840278, -77.240556],
};

export const CAMPUS_MAP_STOPS: CampusMapStop[] = (
  Object.keys(STOP_COORDS) as BodySlug[]
).map((slug) => {
  const body = BODY_CONTENT[slug];
  const [lat, lng] = STOP_COORDS[slug];
  return {
    slug,
    name: body.name,
    color: body.color,
    landmark: body.campus.landmark,
    lat,
    lng,
  };
});

