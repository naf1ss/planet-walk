"use client";

import dynamic from "next/dynamic";

const CampusMap = dynamic(
  () => import("@/components/map/CampusMap").then((m) => m.CampusMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-sm border border-border bg-background-elevated text-foreground-muted">
        Loading campus map...
      </div>
    ),
  },
);

export function MapClientShell() {
  return <CampusMap />;
}

