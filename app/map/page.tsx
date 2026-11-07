import type { Metadata } from "next";
import { MapClientShell } from "@/components/map/MapClientShell";
import { pageSeo } from "@/lib/seo";

const MAP_DESCRIPTION =
  "Interactive campus map of all 11 Gettysburg Planet Walk stops — follow the solar system scale model across Gettysburg College from the Hatter Planetarium to the College Observatory.";

export const metadata: Metadata = {
  title: "Campus Map",
  description: MAP_DESCRIPTION,
  ...pageSeo({
    path: "/map",
    title: "Campus Map · Gettysburg Planet Walk",
    description: MAP_DESCRIPTION,
  }),
};

export default function MapPage() {
  return (
    <main className="ui-layer min-h-[100dvh] pt-[max(4.25rem,calc(3.25rem+env(safe-area-inset-top)))] sm:pt-[5.25rem]">
      <div className="mx-auto w-full max-w-[90rem] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 lg:px-0 lg:pb-0">
        <MapClientShell />
      </div>
    </main>
  );
}
