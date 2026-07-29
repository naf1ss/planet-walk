"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BodySlug } from "@/lib/planet-content";
import { WALK_STOPS, type WalkStop } from "@/lib/planetData";

const STORAGE_KEY = "planet-walk-tracker-v2";

export type TrackerState = {
  visited: BodySlug[];
  /** Epoch ms when the current run started; null if never started / reset */
  startedAt: number | null;
  /** True while the walk timer is actively counting */
  running: boolean;
  /** Accumulated ms from previous run segments (after pause) */
  accumulatedMs: number;
};

const DEFAULT_STATE: TrackerState = {
  visited: [],
  startedAt: null,
  running: false,
  accumulatedMs: 0,
};

function isBodySlug(v: string): v is BodySlug {
  return WALK_STOPS.some((s) => s.slug === v);
}

function allStopsVisited(visited: BodySlug[]): boolean {
  return WALK_STOPS.every((stop) => visited.includes(stop.slug));
}

export function getMissingStops(visited: Iterable<string>): WalkStop[] {
  const set = new Set(visited);
  return WALK_STOPS.filter((stop) => !set.has(stop.slug));
}

function loadState(): TrackerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("planet-walk-tracker-v1");
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    const visited = Array.isArray(parsed.visited)
      ? parsed.visited.filter(
          (s): s is BodySlug => typeof s === "string" && isBodySlug(s),
        )
      : [];
    const complete = allStopsVisited(visited);
    return {
      visited,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      running: Boolean(parsed.running) && !complete,
      accumulatedMs:
        typeof parsed.accumulatedMs === "number" ? parsed.accumulatedMs : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: TrackerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function freezeRunning(prev: TrackerState): TrackerState {
  if (!prev.running || prev.startedAt == null) {
    return { ...prev, running: false, startedAt: null };
  }
  return {
    ...prev,
    running: false,
    accumulatedMs: prev.accumulatedMs + (Date.now() - prev.startedAt),
    startedAt: null,
  };
}

export function useWalkTracker() {
  const [state, setState] = useState<TrackerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [justCompleted, setJustCompleted] = useState(false);
  const [incompleteHint, setIncompleteHint] = useState<WalkStop[] | null>(null);

  const isWalkComplete = allStopsVisited(state.visited);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  // Freeze timer only when every stop is checked.
  useEffect(() => {
    if (!hydrated || !isWalkComplete) return;
    setState((prev) => {
      if (!prev.running) return prev;
      return freezeRunning(prev);
    });
  }, [hydrated, isWalkComplete]);

  useEffect(() => {
    if (!state.running || isWalkComplete) return;
    const id = window.setInterval(() => setNow(Date.now()), 32);
    return () => window.clearInterval(id);
  }, [state.running, isWalkComplete]);

  const elapsedMs = useMemo(() => {
    if (isWalkComplete || !state.running || state.startedAt == null) {
      return state.accumulatedMs || 0;
    }
    return state.accumulatedMs + (now - state.startedAt);
  }, [isWalkComplete, state.running, state.startedAt, state.accumulatedMs, now]);

  const startWalk = useCallback(() => {
    setState((prev) => {
      if (prev.running || allStopsVisited(prev.visited)) return prev;
      const visited = prev.visited.includes("sun")
        ? prev.visited
        : (["sun", ...prev.visited] as BodySlug[]);
      return {
        ...prev,
        visited,
        running: true,
        startedAt: Date.now(),
      };
    });
  }, []);

  const pauseWalk = useCallback(() => {
    setState((prev) => {
      if (!prev.running || prev.startedAt == null) return prev;
      return freezeRunning(prev);
    });
  }, []);

  const resetWalk = useCallback(() => {
    setJustCompleted(false);
    setIncompleteHint(null);
    setState(DEFAULT_STATE);
  }, []);

  const toggleVisited = useCallback((slug: BodySlug) => {
    setState((prev) => {
      const has = prev.visited.includes(slug);
      const visited = has
        ? prev.visited.filter((s) => s !== slug)
        : [...prev.visited, slug];
      const complete = allStopsVisited(visited);
      const checkingPluto = slug === "pluto" && !has;

      queueMicrotask(() => {
        if (complete) {
          setJustCompleted(true);
          setIncompleteHint(null);
          return;
        }

        setJustCompleted(false);

        if (checkingPluto) {
          const missing = getMissingStops(visited);
          setIncompleteHint(missing.length > 0 ? missing : null);
          return;
        }

        // Hide the nudge once remaining gaps are filled (or Pluto unchecked).
        if (!visited.includes("pluto") || getMissingStops(visited).length === 0) {
          setIncompleteHint(null);
        }
      });

      if (complete) {
        return { ...freezeRunning(prev), visited };
      }

      return { ...prev, visited };
    });
  }, []);

  const dismissCelebration = useCallback(() => {
    setJustCompleted(false);
  }, []);

  const dismissIncompleteHint = useCallback(() => {
    setIncompleteHint(null);
  }, []);

  return {
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
  };
}

export function formatElapsed(ms: number): string {
  const totalMs = Math.max(0, Math.floor(ms));
  const totalSec = Math.floor(totalMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const milli = totalMs % 1000;
  const milliStr = String(milli).padStart(3, "0");
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${milliStr}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${milliStr}`;
}
