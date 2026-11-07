"use client";

import { useCallback, useState } from "react";
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
      <div className="absolute inset-0 flex items-center justify-center bg-[#05070f] text-sm text-foreground-muted">
        Loading campus map…
      </div>
    ),
  },
);

/**
 * Map experience — stop list + interactive campus map.
 * Phone: compact intro, tall map, snap-scrolling stop chips.
 */
export function MapClientShell() {
  const [selectedSlug, setSelectedSlug] = useState<BodySlug | null>(null);
  const [previewStop, setPreviewStop] = useState<CampusMapStop | null>(null);

  const closePreview = useCallback(() => setPreviewStop(null), []);

  return (
    <>
      <div className="map-page-shell flex min-h-[calc(100dvh-4.75rem)] flex-col gap-3 sm:gap-5 lg:h-[calc(100dvh-5.25rem)] lg:min-h-0 lg:flex-row lg:gap-0">
        <aside className="flex w-full shrink-0 flex-col lg:w-[22rem] lg:border-r lg:border-white/10 lg:bg-[#05070f]/60 lg:backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3 sm:px-6 sm:py-5">
            <p className="font-nav text-[0.68rem] uppercase tracking-[0.2em] text-accent sm:text-[0.72rem]">
              Campus route
            </p>
            <h1 className="mt-1.5 font-display text-3xl text-star sm:mt-2 sm:text-5xl">
              Planet Walk Map
            </h1>
            <p className="mt-1.5 hidden text-sm leading-relaxed text-foreground-muted sm:mt-2 sm:block">
              Follow the path from the Planetarium to the Observatory. Select a
              stop to focus the map.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-foreground-muted sm:hidden">
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
                      "flex w-full min-h-11 min-w-[9.75rem] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors sm:min-w-[10.5rem] sm:gap-3 lg:min-w-0",
                      active
                        ? "border-white/15 bg-white/[0.08] text-star"
                        : "border-white/[0.06] bg-white/[0.03] text-star/90 hover:bg-white/[0.06] lg:border-transparent lg:bg-transparent lg:hover:bg-white/[0.05]",
                    )}
                    style={
                      active
                        ? { boxShadow: `inset 3px 0 0 ${stop.color}` }
                        : undefined
                    }
                  >
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor: `${stop.color}${active ? "55" : "26"}`,
                        boxShadow: active
                          ? `inset 0 0 0 2px ${stop.color}, 0 0 14px ${stop.color}66`
                          : `inset 0 0 0 2px ${stop.color}`,
                      }}
                    >
                      {stop.index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-base">
                        {stop.name}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-[0.7rem]",
                          active ? "text-star/70" : "text-foreground-muted",
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

          <div className="mt-auto hidden border-t border-white/10 px-5 py-4 lg:block">
            <p className="text-xs text-foreground-muted">
              {CAMPUS_MAP_STOPS.length} stops · Sun → Pluto
            </p>
            <Link
              href="/tracker"
              className="mt-2 inline-flex font-nav text-[0.72rem] uppercase tracking-[0.14em] text-accent-warm transition-colors hover:text-star"
            >
              Track your walk →
            </Link>
          </div>
        </aside>

        <div className="relative min-h-[58dvh] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#05070f] shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:min-h-[55vh] lg:min-h-0 lg:rounded-none lg:border-0 lg:shadow-none">
          <CampusMap
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            previewSlug={previewStop?.slug ?? null}
            onPreviewPhoto={setPreviewStop}
          />
        </div>

        <div className="flex items-center justify-between px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden">
          <p className="text-[0.7rem] text-foreground-muted">
            {CAMPUS_MAP_STOPS.length} stops · Sun → Pluto
          </p>
          <Link
            href="/tracker"
            className="inline-flex min-h-10 items-center font-nav text-[0.72rem] uppercase tracking-[0.14em] text-accent-warm"
          >
            Track →
          </Link>
        </div>
      </div>

      <LocationPhotoLightbox stop={previewStop} onClose={closePreview} />
    </>
  );
}
