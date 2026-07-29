"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BodySlug } from "@/lib/planet-content";
import { WALK_STOPS } from "@/lib/planetData";

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
    return {
      visited,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      running: Boolean(parsed.running) && !visited.includes("pluto"),
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

  const isWalkComplete = state.visited.includes("pluto");

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  // Freeze timer the moment Pluto is checked.
  useEffect(() => {
    if (!hydrated || !isWalkComplete) return;
    setState((prev) => {
      if (!prev.running) return prev;
      return freezeRunning(prev);
    });
  }, [hydrated, isWalkComplete]);

  useEffect(() => {
    if (!state.running || isWalkComplete) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
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
      if (prev.running || prev.visited.includes("pluto")) return prev;
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
    setState(DEFAULT_STATE);
  }, []);

  const toggleVisited = useCallback((slug: BodySlug) => {
    setState((prev) => {
      const has = prev.visited.includes(slug);
      const visited = has
        ? prev.visited.filter((s) => s !== slug)
        : [...prev.visited, slug];

      const checkingPluto = slug === "pluto" && !has;
      if (checkingPluto) {
        return { ...freezeRunning(prev), visited };
      }

      return { ...prev, visited };
    });

    setJustCompleted((prevJust) => {
      if (slug === "pluto") {
        const willCheck = !state.visited.includes("pluto");
        return willCheck ? true : false;
      }
      return prevJust;
    });
  }, [state.visited]);

  const dismissCelebration = useCallback(() => {
    setJustCompleted(false);
  }, []);

  return {
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
  };
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
