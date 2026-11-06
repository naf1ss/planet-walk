"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BODY_CONTENT, BODY_SLUGS } from "@/lib/planet-content";
import { cn } from "@/lib/utils";
import {
  requestBodySelect,
  setHoveredBody,
  useHoveredBody,
} from "@/lib/body-hover";
import { HeroOverlay } from "@/components/landing/HeroOverlay";
import { SceneCanvas } from "@/components/canvas/SceneCanvas";
import { RESTART_INTRO_EVENT } from "@/components/layout/SiteHeader";
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
  /** Bumped to remount the 3D scene + hero when restarting the intro */
  const [instance, setInstance] = useState(0);
  const hoveredBody = useHoveredBody();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const fromQuery = searchParams.get(RETURN_PARAM) === "true";
    const fromSession = consumeReturnToSolarSystem();
    const fromHash = window.location.hash === "#explore";
    const isReturn = fromQuery || fromSession || fromHash;
    setReturnFromPlanet(isReturn);

    if (isReturn) {
      router.replace("/#explore", { scroll: false });
    } else {
      window.scrollTo(0, 0);
    }

    setMounted(true);
  }, [router, searchParams]);

  // "Planet Walk" clicked while the page opened at Explore: the scroll
  // animation only runs forward from the solar system, so restart the intro.
  useEffect(() => {
    if (!returnFromPlanet) return;
    const onRestart = (e: Event) => {
      e.preventDefault();
      window.scrollTo(0, 0);
      setInteractive(false);
      setReturnFromPlanet(false);
      setInstance((n) => n + 1);
    };
    window.addEventListener(RESTART_INTRO_EVENT, onRestart);
    return () => window.removeEventListener(RESTART_INTRO_EVENT, onRestart);
  }, [returnFromPlanet]);

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
          key={`scene-${instance}`}
          zoomTrackRef={zoomTrackRef}
          interactive={interactive}
          startAtSolarSystem={returnFromPlanet}
        />
      ) : null}
      <HeroOverlay
        key={`hero-${instance}`}
        zoomTrackRef={zoomTrackRef}
        startAtSolarSystem={returnFromPlanet}
      />

      {/* Plain links to every world — for keyboards, screen readers and
          anyone who finds the tiny 3D planets hard to tap. */}
      <nav
        aria-label="Planets"
        inert={!interactive}
        className={cn(
          "fixed inset-x-0 bottom-[max(6.5rem,calc(5.5rem+env(safe-area-inset-bottom)))] z-20 transition-opacity duration-500 sm:bottom-28",
          interactive ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onMouseLeave={() => setHoveredBody(null)}
      >
        <ul className="mx-auto flex max-w-4xl gap-1.5 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
          {BODY_SLUGS.map((slug) => {
            const active = hoveredBody === slug;
            return (
              <li key={slug} className="shrink-0">
                <Link
                  href={`/planet/${slug}`}
                  onMouseEnter={() => setHoveredBody(slug)}
                  onMouseLeave={() => setHoveredBody(null)}
                  onFocus={() => setHoveredBody(slug)}
                  onBlur={() => setHoveredBody(null)}
                  onClick={(e) => {
                    // Same zoom-in as clicking the planet; plain link if 3D isn't ready.
                    if (requestBodySelect(slug)) e.preventDefault();
                    setHoveredBody(null);
                  }}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs backdrop-blur-md transition-all duration-200 focus-visible:outline-none",
                    active
                      ? "border-accent-warm/80 bg-accent-warm/15 text-star shadow-[0_0_18px_rgba(240,192,106,0.35)]"
                      : "border-white/15 bg-black/45 text-foreground",
                  )}
                >
                  {BODY_CONTENT[slug].name.replace(/^The /, "")}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
