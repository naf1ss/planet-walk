"use client";

import { motion } from "framer-motion";
import type { BodyContent } from "@/lib/planet-content";

type PlanetDetailOverlayProps = {
  body: BodyContent;
  onBack: () => void;
  exiting?: boolean;
};

/**
 * Planet page chrome: centered hero copy over the spinning 3D body,
 * then facts + vinyl tile below (no campus map — tiles are meant to be found).
 */
export function PlanetDetailOverlay({
  body,
  onBack,
  exiting = false,
}: PlanetDetailOverlayProps) {
  return (
    <div className="ui-layer relative z-20">
      {/* Hero — sparse text over the moving planet */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--void)_78%)]" />

        {/* Fade hero copy quickly as the camera zoom-out begins */}
        <motion.div
          initial={false}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-nav text-[0.7rem] uppercase tracking-[0.32em] text-accent"
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
            className="mt-4 font-display text-5xl tracking-tight text-star drop-shadow-[0_0_40px_rgba(0,0,0,0.65)] sm:text-7xl md:text-8xl"
          >
            {body.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="mx-auto mt-6 w-full max-w-lg text-center text-sm text-foreground-muted sm:text-base"
          >
            {body.facts[0]}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 font-nav text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted/80"
          >
            Scroll for more
          </motion.p>
        </motion.div>
      </section>

      {/* Details below the hero */}
      <section className="relative border-t border-border bg-background/90 px-5 py-20 backdrop-blur-md sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
              Scientific notes
            </p>
            <ul className="mt-6 space-y-5">
              {body.facts.map((fact) => (
                <li
                  key={fact}
                  className="border-l border-accent/35 pl-4 text-sm leading-relaxed text-foreground-muted sm:text-base"
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

          <figure>
            <div className="overflow-hidden rounded-sm border border-border shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={body.tileImage}
                alt={`${body.name} vinyl art tile`}
                className="aspect-[7/5] w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs tracking-wide text-foreground-muted">
              {body.tileCaption}
              <span className="mt-1 block text-foreground-muted/70">
                Find this tile somewhere on the Gettysburg campus walk.
              </span>
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
