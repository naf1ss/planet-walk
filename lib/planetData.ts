import type { BodySlug } from "@/lib/planet-content";

/**
 * Physical Planet Walk scale data.
 * Source: solar-system-walk-model.html (Sun → Pluto = 1923.94 ft).
 * Swap / extend intervals here when you get final field measurements.
 */

export const WALK_TOTAL_FT = 1923.94;
export const WALK_TOTAL_MI = WALK_TOTAL_FT / 5280; // ~0.364 mi
export const PLUTO_AU = 39.482;
export const FT_PER_AU = WALK_TOTAL_FT / PLUTO_AU; // ~48.73 ft per AU on the walk

export type WalkStop = {
  slug: BodySlug;
  name: string;
  /** Mean distance from Sun in AU (real solar system) */
  au: number;
  /** Distance from Sun along the campus walk (feet) */
  walkFt: number;
  /** Distance from Sun along the campus walk (miles) */
  walkMi: number;
  /** Segment from previous stop (miles on the walk) */
  segmentMi: number;
};

const RAW: { slug: BodySlug; name: string; au: number }[] = [
  { slug: "sun", name: "The Sun", au: 0 },
  { slug: "mercury", name: "Mercury", au: 0.387 },
  { slug: "venus", name: "Venus", au: 0.723 },
  { slug: "earth", name: "Earth", au: 1.0 },
  { slug: "mars", name: "Mars", au: 1.524 },
  { slug: "jupiter", name: "Jupiter", au: 5.203 },
  { slug: "saturn", name: "Saturn", au: 9.537 },
  { slug: "uranus", name: "Uranus", au: 19.19 },
  { slug: "neptune", name: "Neptune", au: 30.07 },
  { slug: "pluto", name: "Pluto", au: 39.482 },
];

export const WALK_STOPS: WalkStop[] = RAW.map((b, i) => {
  const walkFt = b.au * FT_PER_AU;
  const walkMi = walkFt / 5280;
  const prevFt = i > 0 ? RAW[i - 1].au * FT_PER_AU : 0;
  const segmentMi = (walkFt - prevFt) / 5280;
  return {
    slug: b.slug,
    name: b.name,
    au: b.au,
    walkFt,
    walkMi,
    segmentMi,
  };
});

/** Miles from Sun to the farthest visited stop (assumes path starts at the Planetarium). */
export function milesWalkedFromVisited(visited: Iterable<string>): number {
  const set = new Set(visited);
  let max = 0;
  for (const stop of WALK_STOPS) {
    if (set.has(stop.slug) && stop.walkMi > max) max = stop.walkMi;
  }
  return max;
}

export function completionPercent(visitedCount: number): number {
  if (WALK_STOPS.length === 0) return 0;
  return Math.round((visitedCount / WALK_STOPS.length) * 100);
}
