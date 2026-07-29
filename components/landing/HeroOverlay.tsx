"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const midTextRef = useRef<HTMLParagraphElement>(null);
  const endSectionRef = useRef<HTMLDivElement>(null);

  const [introReady, setIntroReady] = useState(startAtSolarSystem);
  const [introOpacity, setIntroOpacity] = useState(0);
  const [introY, setIntroY] = useState(startAtSolarSystem ? -36 : -100);

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

  const scrimOpacity = introOpacity * 0.72;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 px-6">
      <div
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_8%,var(--hero-scrim)_78%,var(--void)_100%)]"
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
        className="absolute top-[7.5rem] left-1/2 flex w-full max-w-3xl -translate-x-1/2 flex-col items-center text-center sm:top-36"
      >
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden
            className="h-px w-8 bg-gradient-to-r from-transparent to-accent/70 sm:w-12"
          />
          <p className="font-nav text-[0.65rem] uppercase tracking-[0.4em] text-accent sm:text-[0.7rem]">
            {SITE.campus}
          </p>
          <span
            aria-hidden
            className="h-px w-8 bg-gradient-to-l from-transparent to-accent/70 sm:w-12"
          />
        </div>

        <h1 className="font-display text-[clamp(2.75rem,9vw,5.5rem)] font-medium tracking-[-0.04em] leading-none">
          <span className="text-star drop-shadow-[0_0_40px_rgba(245,247,255,0.2)]">
            Planet
          </span>{" "}
          <span className="text-accent-warm drop-shadow-[0_0_48px_rgba(240,192,106,0.28)]">
            Walk
          </span>
        </h1>

        <p className="mt-7 max-w-sm text-sm leading-relaxed text-foreground-muted sm:mt-8 sm:max-w-md sm:text-base">
          {SITE.tagline}
        </p>
      </div>

      <div
        ref={scrollPromptRef}
        className="absolute bottom-10 left-1/2 flex w-full -translate-x-1/2 flex-col items-center gap-3"
      >
        <p className="font-nav text-[0.65rem] uppercase tracking-[0.38em] text-accent/90">
          Scroll to enter the galaxy
        </p>
        <span
          aria-hidden
          className="h-8 w-px origin-top animate-pulse bg-gradient-to-b from-accent/80 to-transparent"
        />
      </div>

      <p
        ref={midTextRef}
        className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 text-center font-nav text-[0.65rem] uppercase tracking-[0.38em] text-foreground-muted/90"
      >
        Diving through the Milky Way
      </p>

      <div
        ref={endSectionRef}
        className="absolute bottom-10 left-1/2 flex w-full -translate-x-1/2 flex-col items-center gap-3"
      >
        <p className="font-nav text-[0.65rem] uppercase tracking-[0.38em] text-accent-warm/95">
          Click any world to begin
        </p>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-accent-warm shadow-[0_0_12px_rgba(240,192,106,0.7)]"
        />
      </div>
    </div>
  );
}
