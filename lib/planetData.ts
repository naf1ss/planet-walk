import type { BodySlug } from "@/lib/planet-content";

/**
 * Physical Planet Walk scale data.
 * Campus corridor Sun → Pluto totals 7,561.3 ft (~1.43 mi).
 * Stop distances scale from real solar-system AU ratios.
 */

export const WALK_TOTAL_FT = 7561.3;
export const WALK_TOTAL_MI = WALK_TOTAL_FT / 5280; // ≈ 1.432 mi
export const PLUTO_AU = 39.482;
export const FT_PER_AU = WALK_TOTAL_FT / PLUTO_AU;

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
  { slug: "ceres", name: "Ceres", au: 2.77 },
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

/** Feet from Sun to the farthest visited stop. */
export function feetWalkedFromVisited(visited: Iterable<string>): number {
  const set = new Set(visited);
  let max = 0;
  for (const stop of WALK_STOPS) {
    if (set.has(stop.slug) && stop.walkFt > max) max = stop.walkFt;
  }
  return max;
}

/** Miles from Sun to the farthest visited stop. */
export function milesWalkedFromVisited(visited: Iterable<string>): number {
  return feetWalkedFromVisited(visited) / 5280;
}

export function completionPercent(visitedCount: number): number {
  if (WALK_STOPS.length === 0) return 0;
  return Math.round((visitedCount / WALK_STOPS.length) * 100);
}

/** Format campus walk distance for UI (e.g. "7,561 ft · 1.43 mi"). */
export function formatWalkDistance(feet: number): {
  feetLabel: string;
  milesLabel: string;
  combined: string;
} {
  const mi = feet / 5280;
  const feetLabel = `${Math.round(feet).toLocaleString("en-US")} ft`;
  const milesLabel = `${mi.toFixed(mi >= 1 ? 2 : 2)} mi`;
  return {
    feetLabel,
    milesLabel,
    combined: `${feetLabel} · ${milesLabel}`,
  };
}

export const WALK_TOTAL_LABEL = formatWalkDistance(WALK_TOTAL_FT);
