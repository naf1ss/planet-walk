import type { Metadata } from "next";
import { MapClientShell } from "@/components/map/MapClientShell";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Interactive dark campus map of Gettysburg Planet Walk stops with direct links to each world.",
};

export default function MapPage() {
  return (
    <main className="ui-layer mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-8">
      <p className="font-nav text-[0.7rem] uppercase tracking-[0.32em] text-accent">
        Campus Navigation
      </p>
      <h1 className="mt-3 font-display text-4xl text-star sm:text-6xl">
        Planet Walk Map
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-foreground-muted sm:text-base">
        Tap any marker to open a stop popup, then jump straight to its guided
        planet page.
      </p>

      <div className="mt-8">
        <MapClientShell />
      </div>
    </main>
  );
}
