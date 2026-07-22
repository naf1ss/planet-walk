"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const heroBlockRef = useRef<HTMLDivElement>(null);
  const scrollPromptRef = useRef<HTMLParagraphElement>(null);
  const midTextRef = useRef<HTMLParagraphElement>(null);
  const endSectionRef = useRef<HTMLParagraphElement>(null);

  const [introReady, setIntroReady] = useState(startAtSolarSystem);
  const [introOpacity, setIntroOpacity] = useState(0);
  const [introY, setIntroY] = useState(startAtSolarSystem ? -36 : -100);

  /* Hero text drop — 3s after mount, independent of the WebGL entrance */
  useLayoutEffect(() => {
    if (startAtSolarSystem) return;
    const el = heroBlockRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: -100 });

    const tl = gsap.timeline();
    tl.to(
      el,
      {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: "power3.out",
        onComplete: () => {
          setIntroOpacity(1);
          setIntroY(0);
          setIntroReady(true);
          gsap.set(el, { clearProps: "opacity,y,transform" });
        },
      },
      3,
    );

    return () => {
      tl.kill();
    };
  }, [startAtSolarSystem]);

  /* Hero title block fade — still tied to first scroll segment */
  useEffect(() => {
    if (startAtSolarSystem) {
      setIntroOpacity(0);
      setIntroY(-36);
      return;
    }

    if (!introReady) return;

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
  }, [zoomTrackRef, startAtSolarSystem, introReady]);

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
      gsap.set(endSection, { opacity: 1 });
      return;
    }

    gsap.set(scrollPrompt, { opacity: 1 });
    gsap.set(midText, { opacity: 0 });
    gsap.set(endSection, { opacity: 0 });

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

      // Enter only after "...milky way" has fully faded out
      tl.fromTo(
        endSection,
        { opacity: 0 },
        { opacity: 1, duration: 0.12, ease: "power2.inOut" },
        ">",
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
        ref={heroBlockRef}
        style={
          introReady
            ? {
                opacity: introOpacity,
                transform: `translateY(${introY}px)`,
              }
            : undefined
        }
        className="absolute top-32 left-1/2 flex w-full max-w-4xl -translate-x-1/2 flex-col items-center text-center sm:top-36"
      >
        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          className="mb-5 text-[0.7rem] uppercase tracking-[0.35em] text-accent sm:text-xs"
        >
          {SITE.campus}
        </motion.p>
        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          className="font-display text-5xl font-medium tracking-tight text-star drop-shadow-[0_0_40px_rgba(3,4,10,0.9)] sm:text-7xl md:text-8xl"
        >
          <span className="text-star drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            Planet
          </span>{" "}
          <span className="text-[#c084fc] drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]">
            Walk
          </span>
        </motion.h1>
        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
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

      <p
        ref={endSectionRef}
        className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 text-center animate-bounce font-nav text-[0.65rem] uppercase tracking-[0.38em] text-accent/90"
      >
        Click any world to begin
      </p>
    </div>
  );
}
