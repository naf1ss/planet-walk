"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { BodyContent } from "@/lib/planet-content";

type PlanetDetailOverlayProps = {
  body: BodyContent;
  onBack: () => void;
  exiting?: boolean;
};

/**
 * Planet page chrome: first viewport = title top / marker+hero bottom over 3D;
 * scrolling down reveals the facts panel + tile (normal vertical scroll).
 */
export function PlanetDetailOverlay({
  body,
  onBack,
  exiting = false,
}: PlanetDetailOverlayProps) {

  return (
    <div className="ui-layer relative z-20">
      <div className="relative">
        <div className="flex flex-col">
          {/* Initial viewport — unobstructed canvas; no backdrops or glass */}
          <section className="pointer-events-none relative z-10 flex h-[100svh] w-full shrink-0 flex-col justify-between px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,env(safe-area-inset-top))] sm:px-8">
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
                className="mt-3 font-display text-[clamp(2rem,10vw,4.5rem)] tracking-tight text-star drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:mt-4 sm:text-6xl md:text-7xl"
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
              <p className="font-nav text-[0.72rem] uppercase tracking-[0.28em] text-accent drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                Campus marker
              </p>
              <p className="mt-2 text-base leading-relaxed text-star drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-lg">
                {body.markerLocation}
              </p>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-base">
                {body.heroFact}
              </p>

              <p className="mt-8 font-nav text-[0.68rem] uppercase tracking-[0.24em] text-foreground-muted/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] sm:mt-10 sm:text-[0.72rem] sm:tracking-[0.3em]">
                Scroll for more
              </p>
            </motion.div>
          </section>

          {/* Facts panel — directly below the hero */}
          <section className="relative flex w-full shrink-0 flex-col border-t border-border bg-[rgba(3,4,10,0.94)] px-5 py-14 backdrop-blur-md sm:px-8 sm:py-20 lg:py-28 safe-pb">
            <div className="mx-auto grid w-full max-w-5xl gap-10 sm:gap-14 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="font-nav text-[0.72rem] uppercase tracking-[0.28em] text-accent">
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
                  className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-sm border border-border bg-glass px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-star transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60 sm:mt-12"
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
