/**
 * Relative orbital mechanics — real sidereal periods, sped up for the scene.
 * Earth completes one orbit in EARTH_VISUAL_PERIOD_SEC real seconds; others
 * keep correct period ratios (Keplerian relative rates).
 */

/** Mean sidereal orbital period in Earth days */
export const ORBIT_PERIOD_DAYS: Record<string, number> = {
  mercury: 87.969,
  venus: 224.701,
  earth: 365.256,
  mars: 686.98,
  ceres: 1680.18,
  jupiter: 4332.59,
  saturn: 10759.22,
  uranus: 30688.5,
  neptune: 60182,
  pluto: 90560,
};

/** How long one Earth year takes on screen (seconds). Outer planets stay slower. */
export const EARTH_VISUAL_PERIOD_SEC = 48;

const TWO_PI = Math.PI * 2;
const EARTH_DAYS = ORBIT_PERIOD_DAYS.earth;

/** Radians / second for a planet, relative to real periods + visual time scale */
export function orbitalSpeedRadPerSec(periodDays: number): number {
  const earthOmega = TWO_PI / EARTH_VISUAL_PERIOD_SEC;
  return earthOmega * (EARTH_DAYS / periodDays);
}

/** Stable starting angle so planets don’t stack on load */
export function orbitPhase(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000) * TWO_PI;
}
