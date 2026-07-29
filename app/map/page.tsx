import type { Metadata } from "next";
import { MapClientShell } from "@/components/map/MapClientShell";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Campus map of Gettysburg Planet Walk stops from the Planetarium to the Observatory.",
};

export default function MapPage() {
  return (
    <main className="map-page-light ui-layer min-h-screen pt-[4.75rem] sm:pt-[5.25rem]">
      <div className="mx-auto w-full max-w-[90rem] px-4 pb-6 sm:px-6 lg:px-0 lg:pb-0">
        <MapClientShell />
      </div>
    </main>
  );
}
