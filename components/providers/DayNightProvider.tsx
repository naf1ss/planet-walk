"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DayNightMode = "day" | "night";

export type DayNightValue = {
  mode: DayNightMode;
  isDay: boolean;
  /** 3D clear / fog */
  spaceColor: string;
  ambientIntensity: number;
  sunLightBoost: number;
};

const DayNightContext = createContext<DayNightValue | null>(null);

/** Local daytime window — tweak here if you want sunrise/sunset later */
export function getModeFromLocalTime(date = new Date()): DayNightMode {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

function themeFor(mode: DayNightMode): Omit<DayNightValue, "mode" | "isDay"> {
  if (mode === "day") {
    return {
      spaceColor: "#0a0d14",
      ambientIntensity: 0.14,
      sunLightBoost: 1.12,
    };
  }
  return {
    spaceColor: "#010208",
    ambientIntensity: 0.045,
    sunLightBoost: 1,
  };
}

/**
 * Global day/night from the user's local clock.
 * Sets `data-theme` on <html> so CSS overlays pick up warm vs cool tokens.
 */
export function DayNightProvider({ children }: { children: React.ReactNode }) {
  // Stable SSR/hydrate default — reading `window` in useState caused day-mode
  // hydration mismatches that remounted the landing canvas intermittently.
  const [mode, setMode] = useState<DayNightMode>("night");

  const refresh = useCallback(() => {
    setMode((prev) => {
      const next = getModeFromLocalTime();
      return prev === next ? prev : next;
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo<DayNightValue>(() => {
    const t = themeFor(mode);
    return {
      mode,
      isDay: mode === "day",
      ...t,
    };
  }, [mode]);

  return (
    <DayNightContext.Provider value={value}>{children}</DayNightContext.Provider>
  );
}

export function useDayNight(): DayNightValue {
  const ctx = useContext(DayNightContext);
  if (!ctx) {
    return {
      mode: "night",
      isDay: false,
      ...themeFor("night"),
    };
  }
  return ctx;
}
