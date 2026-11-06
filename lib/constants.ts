/** Canonical planet route slugs for /planet/[name] */
export const PLANET_SLUGS = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "ceres",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export type PlanetSlug = (typeof PLANET_SLUGS)[number];

export const SITE = {
  name: "Planet Walk",
  tagline: "A solar system journey across Gettysburg College",
  campus: "Gettysburg College",
  author: "Md Nafisul Hasan Sami",
} as const;
