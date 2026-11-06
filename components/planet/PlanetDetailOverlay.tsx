"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import type { BodyContent } from "@/lib/planet-content";
import { getNextStop, getPlanetStats } from "@/lib/planet-stats";
import { formatWalkDistance } from "@/lib/planetData";
import { CountUp } from "@/components/planet/CountUp";
import { TiltTile } from "@/components/planet/TiltTile";

type PlanetDetailOverlayProps = {
  body: BodyContent;
  onBack: () => void;
  exiting?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise as a block scrolls into view (once). */
const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: i * 0.08 },
  }),
};

/** Big serif name; letters rise out of a mask one after another. */
function RevealName({ text }: { text: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="inline-block" aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, delay: 0.25 + i * 0.045, ease: EASE }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Planet page content over the fixed 3D scene:
 * hero → stats + facts (planet drifts aside) → campus tile → next stop.
 */
export function PlanetDetailOverlay({
  body,
  onBack,
  exiting = false,
}: PlanetDetailOverlayProps) {
  const stats = getPlanetStats(body.slug);
  const next = getNextStop(body.slug);

  return (
    <motion.div
      className="ui-layer relative z-20"
      initial={false}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {/* ── Hero: name over the planet ─────────────────────────────── */}
      <section className="pointer-events-none relative flex h-[100svh] w-full flex-col justify-between px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,env(safe-area-inset-top))] sm:px-8 sm:pt-28">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="font-display text-xl italic text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)] sm:text-2xl"
          >
            {body.subtitle}
          </motion.p>
          <h1 className="mt-1 font-display text-[clamp(3.75rem,17vw,9.5rem)] leading-[0.95] text-star drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
            <RevealName text={body.name} />
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: EASE }}
          className="mx-auto flex w-full max-w-xl flex-col items-center text-center"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-sm text-star backdrop-blur-md">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-accent-warm" />
            {body.markerLocation}
          </p>
          <p className="mt-5 font-display text-xl italic leading-snug text-star/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-2xl">
            {body.heroFact}
          </p>
          <span
            aria-hidden
            className="mt-7 block h-10 w-px origin-top animate-[scrollcue_2.2s_ease-in-out_infinite] bg-gradient-to-b from-accent/80 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Stats + facts: planet drifts to the right behind this ──── */}
      <section className="relative w-full px-5 py-20 sm:px-8 lg:py-32">
        {/* scrim: solid on phones, left-to-right fade on desktop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[rgba(3,4,10,0.82)] backdrop-blur-sm lg:bg-transparent lg:bg-[linear-gradient(90deg,rgba(3,4,10,0.96)_0%,rgba(3,4,10,0.85)_42%,rgba(3,4,10,0)_68%)] lg:backdrop-blur-none"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-xl">
            <motion.h2
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-15%" }}
              className="font-display text-4xl text-star sm:text-5xl"
            >
              {body.name} <span className="italic text-foreground-muted">by the numbers</span>
            </motion.h2>

            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={reveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-10%" }}
                  custom={i}
                  className="bg-[#05070f]/95 p-4 sm:p-5"
                >
                  <dt className="text-xs text-foreground-muted">{s.label}</dt>
                  <dd className="mt-2">
                    <span className="font-display text-[2rem] leading-none text-star sm:text-[2.5rem]">
                      <CountUp
                        value={s.value}
                        decimals={s.decimals}
                        prefix={s.prefix}
                        delay={i * 120}
                      />
                    </span>
                    <span className="mt-1 block text-sm text-accent-warm sm:ml-1.5 sm:mt-0 sm:inline">
                      {s.unit}
                    </span>
                    {s.note ? (
                      <span className="mt-1 block text-xs text-foreground-muted/80">
                        {s.note}
                      </span>
                    ) : null}
                  </dd>
                </motion.div>
              ))}
            </dl>

            <ol className="mt-14 space-y-7">
              {body.facts.map((fact, i) => (
                <motion.li
                  key={fact}
                  variants={reveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-12%" }}
                  className="grid grid-cols-[2.25rem_1fr] gap-3"
                >
                  <span className="font-display text-2xl italic leading-none text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="border-t border-white/10 pt-3 text-base leading-relaxed text-foreground sm:text-[1.05rem]">
                    {fact}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Campus tile ────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[rgba(3,4,10,0.94)] px-5 py-20 backdrop-blur-md sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
          >
            <TiltTile
              src={body.tileImage}
              alt={`${body.name} campus walk marker tile`}
              color={body.color}
            />
          </motion.div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
          >
            <h2 className="font-display text-4xl text-star sm:text-5xl">
              Find it <span className="italic text-accent-warm">on campus</span>
            </h2>
            <p className="mt-5 inline-flex items-center gap-2 text-lg text-star">
              <MapPin aria-hidden className="h-4 w-4 text-accent-warm" />
              {body.markerLocation}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
              {body.tileCaption}. Each stop on the walk is marked with a
              handmade tile like this one.
            </p>

            {next ? (
              <Link
                href={`/planet/${next.slug}`}
                className="group mt-10 flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-white/[0.03] p-5 transition-colors hover:border-accent/60 hover:bg-white/[0.06]"
              >
                <span>
                  <span className="block text-xs text-foreground-muted">
                    Next stop · {formatWalkDistance(next.feet).feetLabel} further
                  </span>
                  <span className="mt-1 block font-display text-3xl text-star">
                    {next.name}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            ) : (
              <p className="mt-10 rounded-xl border border-accent-warm/30 bg-accent-warm/[0.06] p-5 font-display text-2xl italic text-accent-warm">
                You&rsquo;ve reached the end of the walk.
              </p>
            )}

            <button
              type="button"
              onClick={onBack}
              disabled={exiting}
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-star disabled:cursor-wait disabled:opacity-60"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back to the solar system
            </button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
