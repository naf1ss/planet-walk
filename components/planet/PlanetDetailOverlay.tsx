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
 * Planet page chrome: first viewport = title top / marker+hero bottom over 3D;
 * horizontal scroll reveals glass facts panel + vinyl tile.
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
          {/* Initial viewport — unobstructed canvas; no backdrops or glass */}
          <section className="pointer-events-none relative z-10 flex h-screen w-screen shrink-0 flex-col justify-between px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,env(safe-area-inset-top))] sm:px-8">
            <motion.div
              initial={false}
              animate={{ opacity: exiting ? 0 : 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="w-full text-center"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="font-nav text-[0.7rem] uppercase tracking-[0.32em] text-accent drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]"
              >
                {body.subtitle}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.1,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-4 font-display text-4xl tracking-tight text-star drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-6xl md:text-7xl"
              >
                {body.name}
              </motion.h1>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: exiting ? 0 : 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto mx-auto w-full max-w-xl text-center"
            >
              <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                Campus marker
              </p>
              <p className="mt-2 text-base leading-relaxed text-star drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-lg">
                {body.markerLocation}
              </p>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-base">
                {body.heroFact}
              </p>

              <p className="mt-10 font-nav text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                Scroll for more
              </p>
            </motion.div>
          </section>

          {/* Side-scroll panel — glass layout unchanged; heading renamed to Facts */}
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
                  Facts
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
                  <Image
                    src={body.tileImage}
                    alt={`${body.name} campus walk marker tile`}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-contain"
                    sizes="(max-width: 1024px) 90vw, 420px"
                  />
                </div>
              </figure>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
