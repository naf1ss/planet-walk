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
  /** Production origin — change here if a custom domain is added. */
  url: "https://planet-walk.vercel.app",
  description:
    "Gettysburg Planet Walk is a walkable scale model of the solar system on the Gettysburg College campus, from the Hatter Planetarium to the College Observatory — with an interactive 3D solar system, campus map, and walk tracker by artist Md Nafisul Hasan Sami.",
} as const;
