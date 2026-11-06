import type { Metadata } from "next";
import { MapClientShell } from "@/components/map/MapClientShell";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Campus map of Gettysburg Planet Walk stops from the Planetarium to the Observatory.",
};

export default function MapPage() {
  return (
    <main className="map-page-light ui-layer min-h-[100dvh] pt-[max(4.25rem,calc(3.25rem+env(safe-area-inset-top)))] sm:pt-[5.25rem]">
      <div className="mx-auto w-full max-w-[90rem] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 lg:px-0 lg:pb-0">
        <MapClientShell />
      </div>
    </main>
  );
}
