"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Site footer — brand-forward closing frame; hidden on landing and planet pages.
 */
export function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname === "/" || pathname.startsWith("/planet")) return null;

  const destinations = NAV_ITEMS.filter((item) => item.id !== "planet-walk");

  return (
    <footer className="relative z-30 overflow-hidden border-t border-white/10">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_0%,rgba(110,182,255,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(240,192,106,0.08),transparent_50%),linear-gradient(180deg,rgba(3,4,10,0)_0%,#03040a_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(72%,40rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 sm:pt-20">
        {/* Brand block */}
        <div className="max-w-2xl">
          <p className="font-nav text-[0.65rem] uppercase tracking-[0.42em] text-accent">
            Gettysburg College
          </p>
          <p className="font-display mt-4 text-[clamp(2.5rem,8vw,4.75rem)] leading-[0.92] tracking-tight text-star">
            Planet
            <span className="block text-[#c084fc] drop-shadow-[0_0_28px_rgba(192,132,252,0.35)]">
              Walk
            </span>
          </p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground-muted sm:text-lg">
            {SITE.tagline}. A walkable scale model from the Planetarium to the
            Observatory — experienced on campus and here online.
          </p>
        </div>

        {/* Orbit rule with destination labels */}
        <div className="mt-14 flex items-center gap-4 sm:gap-6">
          <p className="shrink-0 font-nav text-[0.6rem] uppercase tracking-[0.28em] text-accent-warm">
            Masters Hall
          </p>
          <div
            aria-hidden
            className="relative h-px flex-1 bg-gradient-to-r from-accent-warm/70 via-white/20 to-accent/70"
          >
            <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-warm" />
            <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
          </div>
          <p className="shrink-0 font-nav text-[0.6rem] uppercase tracking-[0.28em] text-accent">
            Observatory
          </p>
        </div>

        {/* Nav row */}
        <nav
          aria-label="Footer"
          className="mt-12 flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-white/8 py-5"
        >
          {destinations.map((item, i) => (
            <span key={item.id} className="flex items-center">
              {i > 0 ? (
                <span
                  aria-hidden
                  className="mx-2 h-1 w-1 rounded-full bg-white/25 sm:mx-3"
                />
              ) : null}
              <Link
                href={item.href}
                className="font-nav text-[0.7rem] uppercase tracking-[0.24em] text-foreground-muted transition-colors hover:text-star"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        {/* Colophon */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-sm tracking-tight text-star/90">
              {SITE.campus}
            </p>
            <p className="mt-1 font-nav text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
              Gettysburg, Pennsylvania
            </p>
          </div>
          <p className="font-nav text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted/70">
            © {year} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
