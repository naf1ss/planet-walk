"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Check, Sparkles, RotateCcw, Play, Pause } from "lucide-react";
import { BODY_CONTENT } from "@/lib/planet-content";
import {
  completionPercent,
  feetWalkedFromVisited,
  formatWalkDistance,
  WALK_STOPS,
  WALK_TOTAL_FT,
  WALK_TOTAL_LABEL,
} from "@/lib/planetData";
import { formatElapsed, useWalkTracker } from "@/lib/tracker-storage";
import { cn } from "@/lib/utils";

/**
 * Digital passport for the physical Gettysburg Planet Walk.
 * Progress + timer persist in localStorage; Pluto check freezes the clock.
 */
export function WalkTracker() {
  const {
    hydrated,
    state,
    elapsedMs,
    isWalkComplete,
    justCompleted,
    startWalk,
    pauseWalk,
    resetWalk,
    toggleVisited,
    dismissCelebration,
  } = useWalkTracker();

  const visitedCount = state.visited.length;
  const percent = completionPercent(visitedCount);
  const feet = feetWalkedFromVisited(state.visited);
  const distance = formatWalkDistance(feet);
  const hasStarted =
    state.running || state.accumulatedMs > 0 || state.startedAt != null;

  if (!hydrated) {
    return (
      <main className="ui-layer mx-auto max-w-2xl px-5 pb-24 pt-28 sm:px-8">
        <p className="text-sm text-foreground-muted">Loading passport…</p>
      </main>
    );
  }

  return (
    <main className="ui-layer relative mx-auto max-w-2xl px-5 pb-28 pt-28 sm:px-8">
      <AnimatePresence>
        {justCompleted ? (
          <CompletionBurst key="burst" onDone={dismissCelebration} />
        ) : null}
      </AnimatePresence>

      <p className="font-nav text-[0.7rem] uppercase tracking-[0.32em] text-accent">
        Passport
      </p>
      <h1 className="font-display mt-3 text-4xl text-star sm:text-5xl">
        Walk Tracker
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">
        Check off each tile as you find it on campus. Your progress and timer
        stay on this phone — and freeze the moment you reach Pluto.
      </p>

      <AnimatePresence mode="wait">
        {isWalkComplete ? (
          <CompletionSummary
            key="complete"
            elapsedMs={elapsedMs}
            visitedCount={visitedCount}
            onReset={resetWalk}
          />
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mt-10 grid grid-cols-3 gap-3">
              <Stat
                label="Elapsed"
                value={formatElapsed(elapsedMs)}
                hint={
                  state.running
                    ? "Running"
                    : hasStarted
                      ? "Paused"
                      : "Not started"
                }
              />
              <Stat
                label="Distance"
                value={distance.feetLabel}
                hint={distance.milesLabel}
              />
              <Stat
                label="Complete"
                value={`${percent}%`}
                hint={`${visitedCount}/${WALK_STOPS.length} stops`}
              />
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-warm"
                initial={false}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {!state.running ? (
                <button
                  type="button"
                  onClick={startWalk}
                  className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-void transition-opacity hover:opacity-90"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden />
                  {hasStarted ? "Resume Walk" : "Start Walk"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseWalk}
                  className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-border bg-glass px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-star transition-colors hover:border-accent"
                >
                  <Pause className="h-3.5 w-3.5" aria-hidden />
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={resetWalk}
                className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-border px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-star"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mt-12">
        <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
          Planetary stops
        </p>
        <ul className="mt-5 space-y-3">
          {WALK_STOPS.map((stop, index) => {
            const checked = state.visited.includes(stop.slug);
            const landmark =
              BODY_CONTENT[stop.slug]?.campus.landmark ?? stop.name;
            const stopDistance = formatWalkDistance(stop.walkFt);

            return (
              <li key={stop.slug}>
                <div
                  className={cn(
                    "group flex items-stretch gap-3 rounded-sm border px-3 py-3 transition-all sm:gap-4 sm:px-4 sm:py-3.5",
                    checked
                      ? "border-accent/40 bg-accent/10 shadow-[0_0_24px_rgba(110,182,255,0.12)]"
                      : "border-border bg-background-elevated/60 hover:border-white/20",
                  )}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={`Mark ${stop.name} as ${checked ? "not visited" : "visited"}`}
                    onClick={() => {
                      toggleVisited(stop.slug);
                      if (
                        typeof navigator !== "undefined" &&
                        "vibrate" in navigator &&
                        !checked
                      ) {
                        navigator.vibrate?.(stop.slug === "pluto" ? [40, 30, 60] : 18);
                      }
                    }}
                    className={cn(
                      "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 transition-all active:scale-95 sm:h-12 sm:w-12",
                      checked
                        ? "border-accent bg-accent text-void shadow-[0_0_18px_rgba(110,182,255,0.45)]"
                        : "border-white/25 bg-black/20 text-transparent hover:border-accent/70",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-6 w-6 transition-opacity",
                        checked ? "opacity-100" : "opacity-0",
                      )}
                      strokeWidth={3}
                      aria-hidden
                    />
                  </button>

                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-nav text-[0.55rem] uppercase tracking-[0.2em] text-foreground-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-display text-lg leading-tight text-star sm:text-xl">
                        {stop.name}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-snug text-foreground-muted">
                      {landmark}
                    </p>
                    <p className="mt-1 text-[0.7rem] tracking-wide text-foreground-muted/80">
                      {stop.walkFt < 0.5
                        ? "Start · Planetarium"
                        : `${stopDistance.combined} from Sun`}
                    </p>
                  </div>

                  <Link
                    href={`/planet/${stop.slug}`}
                    className="self-center shrink-0 rounded-sm border border-transparent px-2 py-2 font-nav text-[0.6rem] uppercase tracking-[0.18em] text-accent transition-colors hover:border-accent/40 hover:text-star"
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-foreground-muted/80">
        Campus scale: Sun → Pluto = {WALK_TOTAL_LABEL.combined} (
        {WALK_TOTAL_FT.toLocaleString("en-US")} ft). Distance walked is measured
        to your farthest checked stop from the Planetarium.
      </p>
    </main>
  );
}

function CompletionSummary({
  elapsedMs,
  visitedCount,
  onReset,
}: {
  elapsedMs: number;
  visitedCount: number;
  onReset: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll("[data-reveal]"),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <motion.section
      ref={rootRef}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-10 overflow-hidden rounded-sm border border-accent/35 bg-glass p-6 shadow-[0_0_60px_rgba(110,182,255,0.18)] backdrop-blur-md sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(110,182,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-warm/20 blur-3xl" />

      <div className="relative">
        <p
          data-reveal
          className="inline-flex items-center gap-2 font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent-warm"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Journey complete
        </p>
        <h2
          data-reveal
          className="font-display mt-3 text-3xl tracking-tight text-star sm:text-4xl"
        >
          Congratulations
        </h2>
        <p
          data-reveal
          className="mt-4 max-w-lg text-sm leading-relaxed text-foreground-muted sm:text-base"
        >
          You have successfully traversed the scale of the entire solar system,
          bridging the physical campus from Masters Hall to your final
          destination at the College Observatory!
        </p>

        <div
          data-reveal
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <Stat label="Final time" value={formatElapsed(elapsedMs)} hint="Planet Walk" />
          <Stat
            label="Distance"
            value={WALK_TOTAL_LABEL.feetLabel}
            hint={WALK_TOTAL_LABEL.milesLabel}
          />
          <Stat
            label="Stops"
            value={`${visitedCount}/${WALK_STOPS.length}`}
            hint="Passport stamps"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        <p
          data-reveal
          className="mt-6 rounded-sm border border-white/10 bg-black/25 px-4 py-3 text-sm leading-relaxed text-foreground"
        >
          Fun fact: at this campus scale, every foot you walked stands in for
          roughly 485,000 real miles of interplanetary space — about two trips
          from Earth to the Moon.
        </p>

        <div data-reveal className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#explore"
            className="inline-flex min-h-12 items-center rounded-sm bg-accent px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-void transition-opacity hover:opacity-90"
          >
            Back to Solar System
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-border px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-star"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Start a new walk
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function CompletionBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="absolute inset-0 bg-void/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative flex h-40 w-40 items-center justify-center rounded-full border border-accent/50 bg-accent/15 shadow-[0_0_80px_rgba(110,182,255,0.55)] backdrop-blur-md"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.08, 1], opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Sparkles className="h-12 w-12 text-accent-warm" aria-hidden />
        <motion.div
          className="absolute inset-0 rounded-full border border-accent-warm/40"
          animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
          transition={{ duration: 1.2, repeat: 1, ease: "easeOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-background-elevated/80 px-3 py-4",
        className,
      )}
    >
      <p className="font-nav text-[0.6rem] uppercase tracking-[0.2em] text-accent">
        {label}
      </p>
      <p className="mt-2 font-display text-xl text-star sm:text-2xl">{value}</p>
      <p className="mt-1 text-[0.65rem] text-foreground-muted">{hint}</p>
    </div>
  );
}
