import type { BodySlug } from "@/lib/planet-content";
import { WALK_STOPS, WALK_TOTAL_FT } from "@/lib/planetData";

/**
 * Stat row on each planet page. `value` counts up from 0 when it scrolls
 * into view; `decimals`, `prefix` and `unit` control how it's printed.
 */
export type PlanetStat = {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  unit: string;
  note?: string;
};

const MILES_PER_AU = 92_955_807;

/** Diameter relative to Earth (Earth = 1) */
const DIAMETER_X_EARTH: Record<BodySlug, number> = {
  sun: 109,
  mercury: 0.38,
  venus: 0.95,
  earth: 1,
  mars: 0.53,
  ceres: 0.074,
  jupiter: 11.2,
  saturn: 9.45,
  uranus: 4.0,
  neptune: 3.88,
  pluto: 0.19,
};

/** One orbit around the Sun, in Earth days */
const YEAR_DAYS: Record<Exclude<BodySlug, "sun">, number> = {
  mercury: 87.97,
  venus: 224.7,
  earth: 365.26,
  mars: 686.98,
  ceres: 1680.2,
  jupiter: 4332.6,
  saturn: 10759.2,
  uranus: 30688.5,
  neptune: 60182,
  pluto: 90560,
};

function yearStat(days: number): PlanetStat {
  if (days < 400) {
    return { label: "One year", value: Math.round(days), unit: "days" };
  }
  const years = days / 365.26;
  return {
    label: "One year",
    value: years,
    decimals: years < 10 ? 1 : 0,
    unit: "Earth years",
  };
}

function distanceStat(au: number): PlanetStat {
  const miles = au * MILES_PER_AU;
  if (miles >= 1e9) {
    return {
      label: "From the real Sun",
      value: miles / 1e9,
      decimals: 2,
      unit: "billion mi",
    };
  }
  return {
    label: "From the real Sun",
    value: miles / 1e6,
    decimals: 1,
    unit: "million mi",
  };
}

function sizeStat(slug: BodySlug): PlanetStat {
  const x = DIAMETER_X_EARTH[slug];
  return {
    label: "Diameter",
    value: x,
    decimals: x === 1 ? 0 : x < 1 ? 2 : x < 20 ? 1 : 0,
    unit: "× Earth",
  };
}

export function getPlanetStats(slug: BodySlug): PlanetStat[] {
  const stop = WALK_STOPS.find((s) => s.slug === slug);

  if (slug === "sun" || !stop) {
    return [
      {
        label: "Walk length",
        value: Math.round(WALK_TOTAL_FT),
        unit: "ft",
        note: "Sun → Pluto",
      },
      sizeStat("sun"),
      { label: "Surface", value: 10000, prefix: "~", unit: "°F" },
      { label: "One spin", value: 25, unit: "days", note: "at the equator" },
    ];
  }

  return [
    {
      label: "On the walk",
      value: Math.round(stop.walkFt),
      unit: "ft",
      note: "from the Sun",
    },
    distanceStat(stop.au),
    sizeStat(slug),
    yearStat(YEAR_DAYS[slug]),
  ];
}

/** The next stop outward, with how far to walk to it. */
export function getNextStop(slug: BodySlug) {
  const i = WALK_STOPS.findIndex((s) => s.slug === slug);
  if (i < 0 || i >= WALK_STOPS.length - 1) return null;
  const here = WALK_STOPS[i];
  const next = WALK_STOPS[i + 1];
  return { slug: next.slug, name: next.name, feet: next.walkFt - here.walkFt };
}
