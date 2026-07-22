"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SITE } from "@/lib/constants";

type HeroOverlayProps = {
  zoomTrackRef: React.RefObject<HTMLElement | null>;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Landing hero copy — centered over the 3D canvas.
 * Fades as the user scrolls into the galaxy zoom.
 */
export function HeroOverlay({ zoomTrackRef }: HeroOverlayProps) {
  const [introOpacity, setIntroOpacity] = useState(1);
  const [introY, setIntroY] = useState(0);
  const [zoomProgress, setZoomProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const track = zoomTrackRef.current;
      if (!track) {
        setIntroOpacity(1);
        setIntroY(0);
        setZoomProgress(0);
        return;
      }

      const zoomTop = track.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const fadeDistance = vh * 0.55;

      if (zoomTop >= fadeDistance) {
        setIntroOpacity(1);
        setIntroY(0);
      } else if (zoomTop <= 0) {
        setIntroOpacity(0);
        setIntroY(-36);
      } else {
        const t = zoomTop / fadeDistance;
        setIntroOpacity(t);
        setIntroY(-36 * (1 - t));
      }

      const trackHeight = Math.max(1, track.offsetHeight - vh);
      setZoomProgress(clamp01(-zoomTop / trackHeight));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [zoomTrackRef]);

  const scrimOpacity = introOpacity * 0.78;

  const midOpacity =
    zoomProgress < 0.18
      ? 0
      : zoomProgress < 0.3
        ? (zoomProgress - 0.18) / 0.12
        : zoomProgress < 0.5
          ? 1
          : zoomProgress < 0.62
            ? 1 - (zoomProgress - 0.5) / 0.12
            : 0;

  const endOpacity =
    zoomProgress < 0.72 ? 0 : zoomProgress > 0.88 ? 1 : (zoomProgress - 0.72) / 0.16;
  const endY =
    zoomProgress < 0.72 ? 24 : Math.max(0, 24 * (1 - (zoomProgress - 0.72) / 0.2));

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center px-6">
      <div
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--hero-scrim)_75%,var(--void)_100%)]"
      />

      <div
        style={{
          opacity: introOpacity,
          transform: `translateY(${introY}px)`,
        }}
        className="relative flex flex-col items-center text-center"
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
          Click any world to begin its guided journey.
        </p>
      </div>
    </div>
  );
}
