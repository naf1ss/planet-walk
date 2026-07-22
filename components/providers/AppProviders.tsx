"use client";

import { DayNightProvider } from "@/components/providers/DayNightProvider";

/** Client-only providers tree (day/night, future stores, etc.). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <DayNightProvider>{children}</DayNightProvider>;
}
