import { useSyncExternalStore } from "react";

/**
 * Tiny shared state linking the 3D bodies and the planet-name chips on the
 * home page: hovering either highlights both, and a chip click can ask the
 * 3D body to run its dive transition.
 */

let hoveredBody: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setHoveredBody(slug: string | null) {
  if (hoveredBody === slug) return;
  hoveredBody = slug;
  listeners.forEach((l) => l());
}

/** Slug of the body currently hovered (in 3D or via its chip), or null. */
export function useHoveredBody(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => hoveredBody,
    () => null,
  );
}

const selectHandlers = new Map<string, () => void>();

/** 3D bodies register how to start their dive; returns an unregister fn. */
export function registerBodySelect(slug: string, handler: () => void) {
  selectHandlers.set(slug, handler);
  return () => {
    if (selectHandlers.get(slug) === handler) selectHandlers.delete(slug);
  };
}

/** Start a body's dive transition. False if no 3D body is listening. */
export function requestBodySelect(slug: string): boolean {
  const handler = selectHandlers.get(slug);
  if (!handler) return false;
  handler();
  return true;
}
