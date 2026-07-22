"use client";

import { useEffect, useState, useRef } from "react";
import { HeroOverlay } from "@/components/landing/HeroOverlay";
import { SceneCanvas } from "@/components/canvas/SceneCanvas";

/**
 * Full-screen Milky Way hero + scroll-driven camera zoom into the Solar System.
 * Mounts the WebGL canvas only after hydration to avoid SSR/HMR glitches.
 */
export function LandingExperience() {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  return (
    <div ref={scrollTrackRef} className="relative" style={{ height: "400vh" }}>
      {mounted ? <SceneCanvas scrollTrackRef={scrollTrackRef} /> : null}
      <HeroOverlay />
      <div className="pointer-events-none h-full" aria-hidden />
    </div>
  );
}
