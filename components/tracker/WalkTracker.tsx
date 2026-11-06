"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Check, Sparkles, RotateCcw, Play, Pause, AlertCircle } from "lucide-react";
import { BODY_CONTENT } from "@/lib/planet-content";
import {
  completionPercent,
  feetWalkedFromVisited,
  formatWalkDistance,
  WALK_STOPS,
  WALK_TOTAL_FT,
  WALK_TOTAL_LABEL,
  type WalkStop,
} from "@/lib/planetData";
import { formatElapsed, useWalkTracker } from "@/lib/tracker-storage";
import { cn } from "@/lib/utils";

/**
 * Digital passport for the physical Gettysburg Planet Walk.
 * Progress + timer persist in localStorage; full 11/11 freezes the clock.
 */
export function WalkTracker() {
  const {
    hydrated,
    state,
    elapsedMs,
    isWalkComplete,
    justCompleted,
    incompleteHint,
    startWalk,
    pauseWalk,
    resetWalk,
    toggleVisited,
    dismissCelebration,
    dismissIncompleteHint,
  } = useWalkTracker();

  const visitedCount = state.visited.length;
  const percent = completionPercent(visitedCount);
  const feet = feetWalkedFromVisited(state.visited);
  const distance = formatWalkDistance(feet);
  const hasStarted =
    state.running || state.accumulatedMs > 0 || state.startedAt != null;

  useEffect(() => {
    if (!isWalkComplete) return;
    const id = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [isWalkComplete]);

  if (!hydrated) {
    return (
      <main className="ui-layer mx-auto max-w-2xl px-4 pb-24 pt-[max(6.5rem,calc(5.5rem+env(safe-area-inset-top)))] sm:px-8 sm:pt-28">
        <p className="text-sm text-foreground-muted">Loading passport…</p>
      </main>
    );
  }

  return (
      <main className="ui-layer relative mx-auto max-w-2xl px-4 pb-[max(6rem,calc(4rem+env(safe-area-inset-bottom)))] pt-[max(6.5rem,calc(5.5rem+env(safe-area-inset-top)))] sm:px-8 sm:pb-28 sm:pt-28">
      <AnimatePresence>
        {justCompleted ? (
          <CompletionBurst key="burst" onDone={dismissCelebration} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {incompleteHint && incompleteHint.length > 0 ? (
          <IncompleteOrbitNudge
            key="incomplete"
            missing={incompleteHint}
            onDismiss={dismissIncompleteHint}
          />
        ) : null}
      </AnimatePresence>

      <p className="font-nav text-[0.7rem] uppercase tracking-[0.2em] text-accent">
        Passport
      </p>
      <h1 className="font-display mt-3 text-3xl text-star sm:text-5xl">
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
            <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
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
                mono
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
                  className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.14em] text-void transition-opacity hover:opacity-90"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden />
                  {hasStarted ? "Resume Walk" : "Start Walk"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseWalk}
                  className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-border bg-glass px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.14em] text-star transition-colors hover:border-accent"
                >
                  <Pause className="h-3.5 w-3.5" aria-hidden />
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={resetWalk}
                className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-border px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:text-star"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mt-12">
        <p className="font-nav text-[0.72rem] uppercase tracking-[0.16em] text-accent">
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
                      <span className="font-nav text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted">
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
                    className="self-center shrink-0 rounded-sm border border-transparent px-2 py-2 font-nav text-[0.68rem] uppercase tracking-[0.18em] text-accent transition-colors hover:border-accent/40 hover:text-star"
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
          className="inline-flex items-center gap-2 font-nav text-[0.72rem] uppercase tracking-[0.16em] text-accent-warm"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Journey complete
        </p>
        <h2
          data-reveal
          className="font-display mt-3 text-4xl text-star sm:text-5xl"
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
          <Stat label="Final time" value={formatElapsed(elapsedMs)} hint="Planet Walk" mono />
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

        <WalkMissionDebrief elapsedMs={elapsedMs} />

        <div data-reveal className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#explore"
            className="inline-flex min-h-12 items-center rounded-sm bg-accent px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.14em] text-void transition-opacity hover:opacity-90"
          >
            Back to Solar System
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-border px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:text-star"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Start a new walk
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function WalkMissionDebrief({ elapsedMs }: { elapsedMs: number }) {
  const hops = Math.max(1, WALK_STOPS.length - 1);
  const avgHopMs = elapsedMs / hops;
  /** Playful campus-walk benchmark (~42 min for the full 1.43 mi route). */
  const CAMPUS_AVG_MS = 42 * 60 * 1000;
  const deltaMs = elapsedMs - CAMPUS_AVG_MS;
  const faster = deltaMs < 0;
  const paceFtPerMin =
    elapsedMs > 0 ? WALK_TOTAL_FT / (elapsedMs / 60000) : 0;
  const yourMinutes = Math.max(1, elapsedMs / 60000);
  const lightHoursEquivalent = ((5.5 * 60) / yourMinutes).toFixed(1);

  const verdict = faster
    ? deltaMs > -3 * 60 * 1000
      ? "Neck-and-neck with the campus average — a measured cruise past every world."
      : "You outpaced the typical campus passerby. The outer planets never stood a chance."
    : deltaMs < 5 * 60 * 1000
      ? "A little slower than average — the scenic route through the solar system paid off."
      : "You took your time among the giants. Slow orbits still count as discovery.";

  const avgLabel =
    avgHopMs >= 60000
      ? formatElapsed(avgHopMs).replace(/\.\d+$/, "")
      : formatElapsed(avgHopMs);

  return (
    <div
      data-reveal
      className="mt-4 rounded-sm border border-accent/25 bg-accent/5 px-4 py-4"
    >
      <p className="font-nav text-[0.68rem] uppercase tracking-[0.16em] text-accent">
        Mission debrief
      </p>
      <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground-muted">
        <li>
          Average hop between stamps:{" "}
          <span className="text-star">{avgLabel}</span> per planet.
        </li>
        <li>
          Campus pace:{" "}
          <span className="text-star">{paceFtPerMin.toFixed(0)} ft/min</span>{" "}
          along the 7,561 ft scale model.
        </li>
        <li>
          Versus a typical 42:00 campus walk: you finished{" "}
          <span className="text-star">
            {formatElapsed(Math.abs(deltaMs)).replace(/\.\d+$/, "")}
          </span>{" "}
          {faster ? "faster" : "slower"}.
        </li>
        <li>
          Real sunlight needs ~5.5 hours for Sun → Pluto; your campus crossing
          ran about <span className="text-star">{lightHoursEquivalent}×</span>{" "}
          quicker than that photon commute.
        </li>
      </ul>
      <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-foreground">
        {verdict}
      </p>
    </div>
  );
}

function IncompleteOrbitNudge({
  missing,
  onDismiss,
}: {
  missing: WalkStop[];
  onDismiss: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="incomplete-orbit-title"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-[#08040a]/80 backdrop-blur-sm"
        onClick={onDismiss}
      />

      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-sm border border-[#f07178]/35 bg-background-elevated shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_48px_rgba(232,90,98,0.18)]"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,90,98,0.16),transparent_58%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f07178]/70 to-transparent"
        />

        <div className="relative px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#f07178]/45 bg-[#e85a62]/15 text-[#ff8a90]">
              <AlertCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-nav text-[0.68rem] uppercase tracking-[0.16em] text-[#ff8a90]">
                Incomplete orbit
              </p>
              <h2
                id="incomplete-orbit-title"
                className="font-display mt-2 text-3xl text-star"
              >
                Not so fast
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                Pluto is stamped, but your passport still has{" "}
                <span className="text-[#ffb0b4]">
                  {missing.length} unvisited{" "}
                  {missing.length === 1 ? "world" : "worlds"}
                </span>
                . Hit every stop before the walk can close.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-sm border border-[#f07178]/20 bg-black/30 px-3 py-3">
            <p className="font-nav text-[0.65rem] uppercase tracking-[0.14em] text-[#ff8a90]/90">
              Still missing
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {missing.map((stop) => (
                <li key={stop.slug}>
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#f07178]/30 bg-[#e85a62]/10 px-2.5 py-1.5 font-display text-sm text-star">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-[#ff8a90]"
                    />
                    {stop.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-sm border border-[#f07178]/50 bg-[#e85a62]/20 px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.14em] text-[#ffc4c7] transition-colors hover:border-[#f07178] hover:bg-[#e85a62]/30 hover:text-star"
          >
            Got it — keep walking
          </button>
        </div>
      </motion.div>
    </motion.div>
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
  mono = false,
}: {
  label: string;
  value: string;
  hint: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-background-elevated/80 px-2.5 py-3 sm:px-3 sm:py-4",
        className,
      )}
    >
      <p className="font-nav text-[0.65rem] uppercase tracking-[0.16em] text-accent sm:text-[0.68rem] sm:tracking-[0.14em]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 font-display text-star sm:mt-2",
          mono
            ? "text-[0.8rem] tabular-nums leading-tight sm:text-lg"
            : "text-lg sm:text-2xl",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[0.68rem] leading-snug text-foreground-muted sm:text-[0.72rem]">
        {hint}
      </p>
    </div>
  );
}
