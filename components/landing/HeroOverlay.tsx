"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/constants";

type HeroOverlayProps = {
  zoomTrackRef: React.RefObject<HTMLElement | null>;
  startAtSolarSystem?: boolean;
};

/**
 * Landing hero copy — anchored above the galaxy center.
 * Scroll-driven fades via GSAP ScrollTrigger (synced with zoom track).
 */
export function HeroOverlay({
  zoomTrackRef,
  startAtSolarSystem = false,
}: HeroOverlayProps) {
  const scrollPromptRef = useRef<HTMLParagraphElement>(null);
  const midTextRef = useRef<HTMLParagraphElement>(null);
  const endSectionRef = useRef<HTMLDivElement>(null);

  const [introOpacity, setIntroOpacity] = useState(startAtSolarSystem ? 0 : 1);
  const [introY, setIntroY] = useState(0);

  /* Hero title block fade — still tied to first scroll segment */
  useEffect(() => {
    if (startAtSolarSystem) {
      setIntroOpacity(0);
      setIntroY(-36);
      return;
    }

    const update = () => {
      const track = zoomTrackRef.current;
      if (!track) {
        setIntroOpacity(1);
        setIntroY(0);
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
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [zoomTrackRef, startAtSolarSystem]);

  /* GSAP timeline — scroll prompt ↔ Milky Way copy */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const track = zoomTrackRef.current;
    const scrollPrompt = scrollPromptRef.current;
    const midText = midTextRef.current;
    const endSection = endSectionRef.current;
    if (!track || !scrollPrompt || !midText || !endSection) return;

    if (startAtSolarSystem) {
      gsap.set(scrollPrompt, { opacity: 0 });
      gsap.set(midText, { opacity: 0 });
      gsap.set(endSection, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(scrollPrompt, { opacity: 1 });
    gsap.set(midText, { opacity: 0 });
    gsap.set(endSection, { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.addLabel("diveBegin", 0.18);

      tl.to(
        scrollPrompt,
        { opacity: 0, duration: 0.12, ease: "power2.inOut" },
        "diveBegin",
      );

      tl.fromTo(
        midText,
        { opacity: 0 },
        { opacity: 1, duration: 0.12, ease: "power2.inOut" },
        "diveBegin",
      );

      tl.to(
        midText,
        { opacity: 0, duration: 0.12, ease: "power2.inOut" },
        0.5,
      );

      tl.fromTo(
        endSection,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" },
        0.72,
      );
    }, track);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, [zoomTrackRef, startAtSolarSystem]);

  const scrimOpacity = introOpacity * 0.78;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 px-6">
      <div
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--hero-scrim)_75%,var(--void)_100%)]"
      />

      <div
        style={{
          opacity: introOpacity,
          transform: `translateY(${introY}px)`,
        }}
        className="absolute top-32 left-1/2 flex w-full max-w-4xl -translate-x-1/2 flex-col items-center text-center sm:top-36"
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
      </div>

      <p
        ref={scrollPromptRef}
        className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 text-center animate-bounce font-nav text-[0.65rem] uppercase tracking-[0.38em] text-accent/90"
      >
        Scroll to enter the galaxy
      </p>

      <p
        ref={midTextRef}
        className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 text-center font-nav text-[0.65rem] uppercase tracking-[0.38em] text-foreground-muted/90"
      >
        Diving through the Milky Way
      </p>

      <div
        ref={endSectionRef}
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
