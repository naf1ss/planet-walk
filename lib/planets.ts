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
  /** Sidereal orbital period in Earth days (real physics ratio) */
  periodDays: number;
};

export const SUN = {
  size: 1.6,
  texture: "/textures/sm/sun.jpg",
  color: "#ffcc66",
} as const;

/** Readable scene scale — periods drive relative orbital speeds */
export const PLANET_VISUALS: PlanetVisual[] = [
  { slug: "mercury", name: "Mercury", orbit: 3.0, size: 0.28, texture: "/textures/sm/mercury.jpg", color: "#a8a29e", periodDays: 87.969 },
  { slug: "venus", name: "Venus", orbit: 4.0, size: 0.38, texture: "/textures/sm/venus.jpg", color: "#e8c07a", periodDays: 224.701 },
  { slug: "earth", name: "Earth", orbit: 5.2, size: 0.4, texture: "/textures/sm/earth.jpg", color: "#3b82c4", periodDays: 365.256 },
  { slug: "mars", name: "Mars", orbit: 6.4, size: 0.32, texture: "/textures/sm/mars.jpg", color: "#c45c3a", periodDays: 686.98 },
  {
    slug: "ceres",
    name: "Ceres",
    orbit: 7.21,
    /** True scale ≈0.03; readability floor keeps it visible in the belt */
    size: 0.14,
    texture: "/textures/sm/ceres.jpg",
    color: "#c4b5a0",
    periodDays: 1680.18,
  },
  { slug: "jupiter", name: "Jupiter", orbit: 8.8, size: 0.95, texture: "/textures/sm/jupiter.jpg", color: "#d4a574", periodDays: 4332.59 },
  { slug: "saturn", name: "Saturn", orbit: 11.2, size: 0.82, texture: "/textures/sm/saturn.jpg", color: "#e6d5a8", periodDays: 10759.22 },
  { slug: "uranus", name: "Uranus", orbit: 13.4, size: 0.52, texture: "/textures/sm/uranus.jpg", color: "#7ec8c8", periodDays: 30688.5 },
  { slug: "neptune", name: "Neptune", orbit: 15.2, size: 0.5, texture: "/textures/sm/neptune.jpg", color: "#4169e1", periodDays: 60182 },
  { slug: "pluto", name: "Pluto", orbit: 17.0, size: 0.2, texture: "/textures/sm/pluto.jpg", color: "#c4b5a0", periodDays: 90560 },
];
