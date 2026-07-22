"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroOverlay } from "@/components/landing/HeroOverlay";
import { SceneCanvas } from "@/components/canvas/SceneCanvas";
import {
  consumeReturnToSolarSystem,
  getSolarSystemScrollPosition,
  RETURN_PARAM,
} from "@/lib/planet-transition";

/**
 * Page 1: full-viewport Planet Walk hero.
 * Scroll zooms the Milky Way; near Explore, planets are clickable with a dive transition.
 */
export function LandingExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const heroRef = useRef<HTMLElement>(null);
  const zoomTrackRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [returnFromPlanet, setReturnFromPlanet] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const fromQuery = searchParams.get(RETURN_PARAM) === "true";
    const fromSession = consumeReturnToSolarSystem();
    const isReturn = fromQuery || fromSession;
    setReturnFromPlanet(isReturn);

    if (isReturn) {
      if (fromQuery) {
        router.replace("/#explore", { scroll: false });
      }
    } else {
      window.scrollTo(0, 0);
    }

    setMounted(true);
  }, [router, searchParams]);

  useEffect(() => {
    if (!mounted || !returnFromPlanet) return;

    const applyReturnScroll = () => {
      const track = zoomTrackRef.current;
      if (!track) return false;
      window.scrollTo(0, getSolarSystemScrollPosition(track));
      setInteractive(true);
      return true;
    };

    if (applyReturnScroll()) return;

    const raf = requestAnimationFrame(() => {
      applyReturnScroll();
    });
    return () => cancelAnimationFrame(raf);
  }, [mounted, returnFromPlanet]);

  useEffect(() => {
    const update = () => {
      const track = zoomTrackRef.current;
      if (!track) {
        setInteractive(false);
        return;
      }
      const zoomTop = track.getBoundingClientRect().top;
      const trackHeight = Math.max(1, track.offsetHeight - window.innerHeight);
      const intoZoom = Math.min(1, Math.max(0, -zoomTop / trackHeight));
      setInteractive(intoZoom > 0.55);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="relative">
      {mounted ? (
        <SceneCanvas
          zoomTrackRef={zoomTrackRef}
          interactive={interactive}
          startAtSolarSystem={returnFromPlanet}
        />
      ) : null}
      <HeroOverlay
        zoomTrackRef={zoomTrackRef}
        startAtSolarSystem={returnFromPlanet}
      />

      <section
        id="hero"
        ref={heroRef}
        className="pointer-events-none relative z-10 h-screen w-full"
        aria-label="Planet Walk intro"
      />

      <div
        ref={zoomTrackRef}
        className="pointer-events-none relative z-10 w-full"
        style={{ height: "350vh" }}
        aria-hidden
      >
        <div
          id="explore"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-screen w-full"
        />
      </div>
    </div>
  );
}
