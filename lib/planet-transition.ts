import type { BodySlug } from "@/lib/planet-content";
import { PLANET_VISUALS, SUN } from "@/lib/planets";

/** FOV shared by dive end + planet hero page — must stay in sync */
export const TRANSITION_FOV = 34;

/**
 * Camera distance = bodyRadius × VIEWING_RATIO keeps every body at the same
 * angular size on screen (small planets → camera moves in; Sun → pulls back).
 */
export const VIEWING_RATIO = 6.0;

const TRANSITION_KEY = "planet-walk-transition";

export type PlanetTransitionState = {
  slug: BodySlug;
  posX: number;
  posY: number;
  posZ: number;
  fov: number;
  radius: number;
};

export function getBodyRadius(slug: BodySlug): number {
  if (slug === "sun") return SUN.size;
  return PLANET_VISUALS.find((p) => p.slug === slug)?.size ?? 0.4;
}

export function getCameraDistance(radius: number): number {
  return radius * VIEWING_RATIO;
}

/** Camera offset from body center — +Z is toward the viewer, body at origin */
export function getTransitionCameraOffset(radius: number) {
  const z = getCameraDistance(radius);
  return {
    x: 0,
    y: radius * 0.08,
    z,
  };
}

export function getPlanetPageCamera(slug: BodySlug) {
  const radius = getBodyRadius(slug);
  const offset = getTransitionCameraOffset(radius);
  return {
    position: [offset.x, offset.y, offset.z] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
    fov: TRANSITION_FOV,
    radius,
  };
}

/**
 * Dive end camera in solar-system world space.
 * Uses the clicked body's live radius so angular size matches the planet page.
 */
export function getDiveEndCamera(
  planetX: number,
  planetY: number,
  planetZ: number,
  radius: number,
) {
  const offset = getTransitionCameraOffset(radius);
  return {
    posX: planetX + offset.x,
    posY: planetY + offset.y,
    posZ: planetZ + offset.z,
    lookX: planetX,
    lookY: planetY,
    lookZ: planetZ,
    fov: TRANSITION_FOV,
  };
}

export function savePlanetTransition(state: PlanetTransitionState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TRANSITION_KEY, JSON.stringify(state));
}

export function readPlanetTransition(slug: BodySlug): PlanetTransitionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TRANSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanetTransitionState;
    if (parsed.slug !== slug) return null;
    sessionStorage.removeItem(TRANSITION_KEY);
    return parsed;
  } catch {
    return null;
  }
}
