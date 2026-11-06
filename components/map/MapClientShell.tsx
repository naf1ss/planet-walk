"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CAMPUS_MAP_STOPS, type CampusMapStop } from "@/lib/campus-map-stops";
import type { BodySlug } from "@/lib/planet-content";
import { cn } from "@/lib/utils";
import { LocationPhotoLightbox } from "@/components/map/LocationPhotoLightbox";

const CampusMap = dynamic(
  () => import("@/components/map/CampusMap").then((m) => m.CampusMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#e8edf3] text-sm text-[#5b6577]">
        Loading campus map…
      </div>
    ),
  },
);

/**
 * Light map experience — stop list + interactive campus map.
 * Phone: compact intro, tall map, snap-scrolling stop chips.
 */
export function MapClientShell() {
  const [selectedSlug, setSelectedSlug] = useState<BodySlug | null>(null);
  const [previewStop, setPreviewStop] = useState<CampusMapStop | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("map-light");
    return () => document.documentElement.classList.remove("map-light");
  }, []);

  const closePreview = useCallback(() => setPreviewStop(null), []);

  return (
    <>
      <div className="map-page-shell flex min-h-[calc(100dvh-4.75rem)] flex-col gap-3 sm:gap-5 lg:h-[calc(100dvh-5.25rem)] lg:min-h-0 lg:flex-row lg:gap-0">
        <aside className="flex w-full shrink-0 flex-col lg:w-[22rem] lg:border-r lg:border-[#d5dde8]">
          <div className="border-b border-[#d5dde8] px-4 py-3 sm:px-6 sm:py-5">
            <p className="font-nav text-[0.68rem] uppercase tracking-[0.32em] text-[#3b82c4] sm:text-[0.72rem]">
              Campus route
            </p>
            <h1 className="mt-1.5 font-display text-2xl tracking-tight text-[#121826] sm:mt-2 sm:text-4xl">
              Planet Walk Map
            </h1>
            <p className="mt-1.5 hidden text-sm leading-relaxed text-[#5b6577] sm:mt-2 sm:block">
              Follow the path from the Planetarium to the Observatory. Select a
              stop to focus the map.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5b6577] sm:hidden">
              Tap a stop, then tap a marker for its location photo.
            </p>
          </div>

          <ol className="map-stop-rail flex gap-2 overflow-x-auto px-3 py-2.5 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-y-auto lg:overflow-x-visible lg:px-3 lg:py-3">
            {CAMPUS_MAP_STOPS.map((stop) => {
              const active = selectedSlug === stop.slug;
              return (
                <li key={stop.slug} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(stop.slug)}
                    className={cn(
                      "flex w-full min-h-11 min-w-[9.75rem] items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors sm:min-w-[10.5rem] sm:gap-3 lg:min-w-0",
                      active
                        ? "bg-[#121826] text-white"
                        : "bg-white/70 text-[#121826] hover:bg-white lg:bg-transparent lg:hover:bg-[#e8edf3]",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                        active
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-transparent text-[#121826]",
                      )}
                      style={
                        active
                          ? undefined
                          : {
                              backgroundColor: `${stop.color}33`,
                              boxShadow: `inset 0 0 0 2px ${stop.color}`,
                            }
                      }
                    >
                      {stop.index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-medium">
                        {stop.name}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-[0.7rem]",
                          active ? "text-white/65" : "text-[#5b6577]",
                        )}
                      >
                        {stop.landmark}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto hidden border-t border-[#d5dde8] px-5 py-4 lg:block">
            <p className="text-xs text-[#5b6577]">
              {CAMPUS_MAP_STOPS.length} stops · Sun → Pluto
            </p>
            <Link
              href="/tracker"
              className="mt-2 inline-flex font-nav text-[0.72rem] uppercase tracking-[0.22em] text-[#1d4ed8] transition-colors hover:text-[#1e3a8a]"
            >
              Track your walk →
            </Link>
          </div>
        </aside>

        <div className="relative min-h-[58dvh] flex-1 overflow-hidden rounded-2xl border border-[#d5dde8] bg-[#e8edf3] shadow-[0_20px_50px_rgba(18,24,38,0.08)] sm:min-h-[55vh] lg:min-h-0 lg:rounded-none lg:border-0 lg:shadow-none">
          <CampusMap
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            previewSlug={previewStop?.slug ?? null}
            onPreviewPhoto={setPreviewStop}
          />
        </div>

        <div className="flex items-center justify-between px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden">
          <p className="text-[0.7rem] text-[#5b6577]">
            {CAMPUS_MAP_STOPS.length} stops · Sun → Pluto
          </p>
          <Link
            href="/tracker"
            className="inline-flex min-h-10 items-center font-nav text-[0.72rem] uppercase tracking-[0.22em] text-[#1d4ed8]"
          >
            Track →
          </Link>
        </div>
      </div>

      <LocationPhotoLightbox stop={previewStop} onClose={closePreview} />
    </>
  );
}
