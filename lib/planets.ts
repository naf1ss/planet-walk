import type { PlanetSlug } from "@/lib/constants";

export type PlanetVisual = {
  slug: PlanetSlug;
  name: string;
  orbit: number;
  size: number;
  /** Equirectangular color map under /public/textures */
  texture: string;
  /** Fallback tint if texture fails */
  color: string;
};

export const SUN = {
  size: 1.6,
  texture: "/textures/sun.jpg",
  color: "#ffcc66",
} as const;

/** Readable scene scale — not true astronomical ratios */
export const PLANET_VISUALS: PlanetVisual[] = [
  { slug: "mercury", name: "Mercury", orbit: 3.0, size: 0.28, texture: "/textures/mercury.jpg", color: "#a8a29e" },
  { slug: "venus", name: "Venus", orbit: 4.0, size: 0.38, texture: "/textures/venus.jpg", color: "#e8c07a" },
  { slug: "earth", name: "Earth", orbit: 5.2, size: 0.4, texture: "/textures/earth.jpg", color: "#3b82c4" },
  { slug: "mars", name: "Mars", orbit: 6.4, size: 0.32, texture: "/textures/mars.jpg", color: "#c45c3a" },
  { slug: "jupiter", name: "Jupiter", orbit: 8.8, size: 0.95, texture: "/textures/jupiter.jpg", color: "#d4a574" },
  { slug: "saturn", name: "Saturn", orbit: 11.2, size: 0.82, texture: "/textures/saturn.jpg", color: "#e6d5a8" },
  { slug: "uranus", name: "Uranus", orbit: 13.4, size: 0.52, texture: "/textures/uranus.jpg", color: "#7ec8c8" },
  { slug: "neptune", name: "Neptune", orbit: 15.2, size: 0.5, texture: "/textures/neptune.jpg", color: "#4169e1" },
  { slug: "pluto", name: "Pluto", orbit: 17.0, size: 0.2, texture: "/textures/pluto.jpg", color: "#c4b5a0" },
];
