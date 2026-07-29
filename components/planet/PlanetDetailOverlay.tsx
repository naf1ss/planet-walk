"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BodyContent } from "@/lib/planet-content";

type PlanetDetailOverlayProps = {
  body: BodyContent;
  onBack: () => void;
  exiting?: boolean;
};

/**
 * Planet page chrome: centered hero copy over the spinning 3D body,
 * then facts + marker placeholder — vertical scroll drives horizontal slide.
 */
export function PlanetDetailOverlay({
  body,
  onBack,
  exiting = false,
}: PlanetDetailOverlayProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    const ctx = gsap.context(() => {
      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.fromTo(
        track,
        { x: 0 },
        {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    }, pin);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, [body.slug]);

  return (
    <div className="ui-layer relative z-20">
      <div ref={pinRef} className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-[200vw] will-change-transform"
        >
          {/* Hero — sparse text over the moving planet */}
          <section className="relative flex h-[100dvh] w-screen shrink-0 flex-col items-center justify-center px-6 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--void)_78%)]" />

            <motion.div
              initial={false}
              animate={{ opacity: exiting ? 0 : 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-2xl rounded-lg border border-white/12 bg-[rgba(3,4,10,0.84)] px-6 py-8 shadow-[0_12px_48px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-8"
            >
              <p className="font-nav text-[0.7rem] uppercase tracking-[0.32em] text-accent">
                {body.subtitle}
              </p>

              <h1 className="mt-4 font-display text-4xl tracking-tight text-star sm:text-6xl md:text-7xl">
                {body.name}
              </h1>

              <p className="mt-6 font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
                Campus marker
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">
                {body.markerLocation}
              </p>

              <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-foreground-muted sm:text-base">
                {body.facts[0]}
              </p>

              <p className="mt-10 font-nav text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted/80">
                Scroll for scientific notes
              </p>
            </motion.div>
          </section>

          {/* Details — revealed by horizontal slide */}
          <section className="relative flex h-[100dvh] w-screen shrink-0 flex-col justify-center overflow-y-auto border-l border-border bg-[rgba(3,4,10,0.94)] px-5 py-20 backdrop-blur-md sm:px-8">
            <div className="mx-auto grid w-full max-w-5xl gap-14 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
                  Campus marker
                </p>
                <p className="mt-3 text-base font-medium leading-relaxed text-star sm:text-lg">
                  {body.markerLocation}
                </p>

                <p className="mt-10 font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
                  Scientific notes
                </p>
                <ul className="mt-6 space-y-5">
                  {body.facts.map((fact) => (
                    <li
                      key={fact}
                      className="border-l-2 border-accent/40 py-1 pl-4 text-sm leading-relaxed text-foreground-muted sm:text-base"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={onBack}
                  disabled={exiting}
                  className="mt-12 inline-flex items-center gap-2 rounded-sm border border-border bg-glass px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-star transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60"
                >
                  ← Back to Solar System
                </button>
              </div>

              <figure className="relative">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-[#f4f4f6] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:p-6">
                  {body.slug === "ceres" ? (
                    <p className="px-4 text-center font-nav text-[0.7rem] uppercase tracking-[0.28em] text-foreground-muted">
                      Tile marker coming soon
                    </p>
                  ) : (
                    <Image
                      src={body.tileImage}
                      alt={`${body.name} campus walk marker tile`}
                      width={1024}
                      height={1024}
                      className="h-full w-full object-contain"
                      sizes="(max-width: 1024px) 90vw, 420px"
                    />
                  )}
                </div>
              </figure>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
