"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SITE } from "@/lib/constants";

/**
 * Planet Walk intro stays locked on screen until the user actually scrolls.
 * Uses window.scrollY (not Framer target progress) so hydration / layout
 * measurement can't wipe the intro after ~1s.
 */
export function HeroOverlay() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Hold intro fully opaque until ~8% scroll, then fade out by ~28%
  const introOpacity =
    progress <= 0.08 ? 1 : progress >= 0.28 ? 0 : 1 - (progress - 0.08) / 0.2;
  const scrimOpacity = introOpacity * 0.75;
  const introY = progress <= 0.08 ? 0 : -36 * Math.min(1, (progress - 0.08) / 0.2);

  const midOpacity =
    progress < 0.34
      ? 0
      : progress < 0.45
        ? (progress - 0.34) / 0.11
        : progress < 0.58
          ? 1
          : progress < 0.7
            ? 1 - (progress - 0.58) / 0.12
            : 0;

  const endOpacity =
    progress < 0.78 ? 0 : progress > 0.9 ? 1 : (progress - 0.78) / 0.12;
  const endY = progress < 0.78 ? 24 : Math.max(0, 24 * (1 - (progress - 0.78) / 0.17));

  return (
    <div className="ui-layer pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-6">
      <div
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,4,10,0.55)_0%,rgba(3,4,10,0.78)_55%,rgba(3,4,10,0.92)_100%)] transition-opacity duration-150"
      />

      <div
        style={{
          opacity: introOpacity,
          transform: `translateY(${introY}px)`,
        }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center transition-[opacity,transform] duration-150"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[0.7rem] uppercase tracking-[0.35em] text-accent sm:text-xs"
        >
          {SITE.campus}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.25, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-medium tracking-tight text-star drop-shadow-[0_0_40px_rgba(3,4,10,0.9)] sm:text-7xl md:text-8xl"
        >
          {SITE.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-md text-base text-foreground-muted sm:text-lg"
        >
          {SITE.tagline}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-14 text-[0.65rem] uppercase tracking-[0.32em] text-foreground-muted/90"
        >
          Scroll to enter the galaxy
        </motion.p>
      </div>

      <p
        style={{ opacity: midOpacity }}
        className="absolute bottom-[18%] text-center text-sm tracking-[0.2em] text-foreground-muted uppercase"
      >
        Diving through the Milky Way
      </p>

      <div
        style={{
          opacity: endOpacity,
          transform: `translateY(${endY}px)`,
        }}
        className="absolute inset-x-0 bottom-[14%] flex flex-col items-center text-center"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-accent-warm">
          Our neighborhood
        </p>
        <h2 className="font-display mt-3 text-3xl text-star sm:text-4xl">
          The Solar System
        </h2>
        <p className="mt-3 max-w-sm text-sm text-foreground-muted">
          Each world maps to a tile on the Gettysburg campus walk.
        </p>
      </div>
    </div>
  );
}
