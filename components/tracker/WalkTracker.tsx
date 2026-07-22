"use client";

import Link from "next/link";
import {
  completionPercent,
  milesWalkedFromVisited,
  WALK_STOPS,
  WALK_TOTAL_MI,
} from "@/lib/planetData";
import { formatElapsed, useWalkTracker } from "@/lib/tracker-storage";
import { cn } from "@/lib/utils";

/**
 * Digital passport for the physical Gettysburg Planet Walk.
 * Progress + timer persist in localStorage on the user's phone.
 */
export function WalkTracker() {
  const {
    hydrated,
    state,
    elapsedMs,
    startWalk,
    pauseWalk,
    resetWalk,
    toggleVisited,
  } = useWalkTracker();

  const visitedCount = state.visited.length;
  const percent = completionPercent(visitedCount);
  const miles = milesWalkedFromVisited(state.visited);
  const hasStarted = state.running || state.accumulatedMs > 0 || state.startedAt != null;

  if (!hydrated) {
    return (
      <main className="ui-layer mx-auto max-w-2xl px-5 pb-24 pt-28 sm:px-8">
        <p className="text-sm text-foreground-muted">Loading passport…</p>
      </main>
    );
  }

  return (
    <main className="ui-layer mx-auto max-w-2xl px-5 pb-28 pt-28 sm:px-8">
      <p className="font-nav text-[0.7rem] uppercase tracking-[0.32em] text-accent">
        Passport
      </p>
      <h1 className="font-display mt-3 text-4xl text-star sm:text-5xl">
        Walk Tracker
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">
        Check off each tile as you find it on campus. Your progress and timer
        stay on this phone.
      </p>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-3 gap-3">
        <Stat
          label="Elapsed"
          value={formatElapsed(elapsedMs)}
          hint={state.running ? "Running" : hasStarted ? "Paused" : "Not started"}
        />
        <Stat
          label="Distance"
          value={`${miles.toFixed(miles < 0.1 ? 3 : 2)} mi`}
          hint={`of ${WALK_TOTAL_MI.toFixed(2)} mi`}
        />
        <Stat
          label="Complete"
          value={`${percent}%`}
          hint={`${visitedCount}/${WALK_STOPS.length} stops`}
        />
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap gap-3">
        {!state.running ? (
          <button
            type="button"
            onClick={startWalk}
            className="rounded-sm bg-accent px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-void transition-opacity hover:opacity-90"
          >
            {hasStarted ? "Resume Walk" : "Start Walk"}
          </button>
        ) : (
          <button
            type="button"
            onClick={pauseWalk}
            className="rounded-sm border border-border bg-glass px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-star transition-colors hover:border-accent"
          >
            Pause
          </button>
        )}
        <button
          type="button"
          onClick={resetWalk}
          className="rounded-sm border border-border px-5 py-3 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-star"
        >
          Reset
        </button>
      </div>

      {/* Checklist */}
      <section className="mt-12">
        <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
          Planetary stops
        </p>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {WALK_STOPS.map((stop) => {
            const checked = state.visited.includes(stop.slug);
            return (
              <li key={stop.slug}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-4 py-4 transition-colors",
                    checked ? "text-star" : "text-foreground-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleVisited(stop.slug)}
                    className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg leading-tight text-star">
                      {stop.name}
                    </span>
                    <span className="mt-0.5 block text-xs tracking-wide text-foreground-muted">
                      {stop.walkFt < 1
                        ? "Start · Planetarium"
                        : `${stop.walkFt.toFixed(1)} ft from Sun · ${stop.walkMi.toFixed(3)} mi`}
                    </span>
                  </span>
                  <Link
                    href={`/planet/${stop.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 font-nav text-[0.6rem] uppercase tracking-[0.18em] text-accent hover:text-star"
                  >
                    View
                  </Link>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-foreground-muted/80">
        Distances use the campus scale model (Sun → Pluto = {WALK_TOTAL_MI.toFixed(3)}{" "}
        mi). Distance walked is measured to your farthest checked stop from the
        Sun.
      </p>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-sm border border-border bg-background-elevated/80 px-3 py-4">
      <p className="font-nav text-[0.6rem] uppercase tracking-[0.2em] text-accent">
        {label}
      </p>
      <p className="mt-2 font-display text-xl text-star sm:text-2xl">{value}</p>
      <p className="mt-1 text-[0.65rem] text-foreground-muted">{hint}</p>
    </div>
  );
}
