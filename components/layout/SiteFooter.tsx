"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactIcon } from "@/components/layout/ContactIcon";
import { CONTACT_LINKS, isExternalContact } from "@/lib/contact";
import { SITE } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Site footer — compact brand row + path line, shown on every page except home.
 * Solid background so it covers the fixed 3D canvas on planet pages.
 */
export function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname === "/") return null;

  const destinations = NAV_ITEMS.filter((item) => item.id !== "planet-walk");

  return (
    <footer className="relative z-30 overflow-hidden border-t border-white/10 bg-[#03040a] text-star">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,rgba(110,182,255,0.1),transparent_50%),radial-gradient(ellipse_40%_50%_at_100%_100%,rgba(240,192,106,0.07),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(60%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-warm/45 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="font-nav text-[0.68rem] uppercase tracking-[0.22em] text-accent">
          Gettysburg College
        </p>

        {/* Title + blurb side by side */}
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <h2 className="shrink-0 font-display text-[clamp(3rem,8vw,5rem)] leading-none">
            <span className="text-star">Planet</span>{" "}
            <span className="italic text-accent-warm drop-shadow-[0_0_32px_rgba(240,192,106,0.28)]">
              Walk
            </span>
          </h2>

          <p className="max-w-sm pb-1 text-sm leading-relaxed text-foreground-muted md:text-right md:text-[0.95rem]">
            {SITE.tagline}. A walkable scale model from the Planetarium to the
            Observatory — on campus and online.
          </p>
        </div>

        {/* Compact path */}
        <div className="mt-8 flex items-center gap-3 sm:gap-5">
          <p className="shrink-0 font-nav text-[0.65rem] uppercase tracking-[0.16em] text-accent-warm">
            Masters Hall
          </p>
          <div
            aria-hidden
            className="relative h-px flex-1 bg-gradient-to-r from-accent-warm/60 via-white/15 to-accent/60"
          >
            <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-warm" />
            <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
          </div>
          <p className="shrink-0 font-nav text-[0.65rem] uppercase tracking-[0.16em] text-accent">
            Observatory
          </p>
        </div>

        {/* Nav + colophon on one denser band */}
        <div className="mt-8 flex flex-col gap-5 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {destinations.map((item, i) => (
              <span key={item.id} className="flex items-center">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="mx-2 h-1 w-1 rounded-full bg-white/20 sm:mx-2.5"
                  />
                ) : null}
                <Link
                  href={item.href}
                  className="font-nav text-[0.72rem] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:text-star"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ul aria-label="Contact" className="flex items-center gap-1.5">
              {CONTACT_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    {...(isExternalContact(link)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    aria-label={link.label}
                    title={link.display}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground-muted transition-colors hover:border-accent/40 hover:text-star"
                  >
                    <ContactIcon id={link.id} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-foreground-muted">
              © {year} {SITE.author}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
