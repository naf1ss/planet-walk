"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BODY_CONTENT } from "@/lib/planet-content";
import { WALK_STOPS } from "@/lib/planetData";
import { cn } from "@/lib/utils";

type WalkLineProps = {
  visited: readonly string[];
  className?: string;
};

const LAST = WALK_STOPS.length - 1;

/**
 * Sun → Pluto as a line of 11 dots. Stamped stops light up in their
 * planet's colour, the line fills to the farthest one, and the next stop
 * to find pulses.
 */
export function WalkLine({ visited, className }: WalkLineProps) {
  const reduce = useReducedMotion();
  const set = new Set(visited);
  let farthest = -1;
  WALK_STOPS.forEach((s, i) => {
    if (set.has(s.slug)) farthest = i;
  });
  const nextIdx = WALK_STOPS.findIndex((s) => !set.has(s.slug));
  const fill = farthest <= 0 ? 0 : (farthest / LAST) * 100;
  const next = nextIdx >= 0 ? WALK_STOPS[nextIdx] : null;

  return (
    <div className={cn("select-none", className)}>
      <div
        className="relative h-10"
        role="img"
        aria-label={`${set.size} of ${WALK_STOPS.length} stops stamped`}
      >
        {/* track — inset by half a dot so the ends line up with Sun & Pluto */}
        <div className="absolute inset-x-[9px] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#f0c06a] via-accent to-[#a78bfa] shadow-[0_0_12px_rgba(110,182,255,0.55)]"
            initial={false}
            animate={{ width: `${fill}%` }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <ol className="absolute inset-x-[9px] top-1/2 -translate-y-1/2">
          {WALK_STOPS.map((stop, i) => {
            const on = set.has(stop.slug);
            const isNext = i === nextIdx;
            const color = BODY_CONTENT[stop.slug].color;
            return (
              <li
                key={stop.slug}
                className="absolute top-0 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(i / LAST) * 100}%` }}
                title={stop.name}
              >
                {isNext && !reduce ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full border"
                    style={{ borderColor: color }}
                  />
                ) : null}
                <motion.span
                  className={cn(
                    "relative block h-[18px] w-[18px] rounded-full border-2 transition-colors duration-300",
                    on ? "border-white/80" : "border-white/25 bg-[#05070f]",
                  )}
                  style={
                    on
                      ? {
                          background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${color} 55%)`,
                          boxShadow: `0 0 14px ${color}`,
                        }
                      : isNext
                        ? { borderColor: color }
                        : undefined
                  }
                  initial={false}
                  animate={on && !reduce ? { scale: [1, 1.45, 1] } : { scale: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-1 flex items-baseline justify-between text-xs text-foreground-muted">
        <span>Sun</span>
        <span className="font-display text-sm italic text-foreground">
          {next ? (
            <>
              Next stop: <span className="text-accent-warm">{next.name}</span>
            </>
          ) : (
            <span className="text-accent-warm">Every world stamped</span>
          )}
        </span>
        <span>Pluto</span>
      </div>
    </div>
  );
}
