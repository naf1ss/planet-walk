"use client";

import { useCallback, useEffect, useState } from "react";
import type { BodySlug } from "@/lib/planet-content";
import { WALK_STOPS } from "@/lib/planetData";

const STORAGE_KEY = "planet-walk-tracker-v1";

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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    const visited = Array.isArray(parsed.visited)
      ? parsed.visited.filter((s): s is BodySlug => typeof s === "string" && isBodySlug(s))
      : [];
    return {
      visited,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      running: Boolean(parsed.running),
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

export function useWalkTracker() {
  const [state, setState] = useState<TrackerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [state.running]);

  const elapsedMs =
    (state.running && state.startedAt
      ? state.accumulatedMs + (now - state.startedAt)
      : state.accumulatedMs) || 0;

  const startWalk = useCallback(() => {
    setState((prev) => {
      if (prev.running) return prev;
      return {
        ...prev,
        running: true,
        startedAt: Date.now(),
      };
    });
  }, []);

  const pauseWalk = useCallback(() => {
    setState((prev) => {
      if (!prev.running || prev.startedAt == null) return prev;
      return {
        ...prev,
        running: false,
        accumulatedMs: prev.accumulatedMs + (Date.now() - prev.startedAt),
        startedAt: null,
      };
    });
  }, []);

  const resetWalk = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const toggleVisited = useCallback((slug: BodySlug) => {
    setState((prev) => {
      const has = prev.visited.includes(slug);
      const visited = has
        ? prev.visited.filter((s) => s !== slug)
        : [...prev.visited, slug];
      return { ...prev, visited };
    });
  }, []);

  return {
    hydrated,
    state,
    elapsedMs,
    startWalk,
    pauseWalk,
    resetWalk,
    toggleVisited,
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
