"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

const HOME_ITEM = NAV_ITEMS.find((i) => i.id === "planet-walk")!;
const TRACKER_ITEM = NAV_ITEMS.find((i) => i.id === "tracker")!;
const CENTER_ITEMS = NAV_ITEMS.filter(
  (i) => i.id !== "planet-walk" && i.id !== "tracker",
);

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.scrollTarget) {
    if (pathname !== "/") return false;
    if (typeof window === "undefined") return item.scrollTarget === "hero";
    const hash = window.location.hash.replace("#", "");
    if (!hash && item.scrollTarget === "hero") return true;
    return hash === item.scrollTarget;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Floating premium nav — same routes & scroll behavior, refined chrome.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const hashId = window.location.hash.replace("#", "");
    if (!hashId) return;
    const t = window.setTimeout(() => scrollToId(hashId), 80);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash.replace("#", ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (!item.scrollTarget) {
      setOpen(false);
      return;
    }

    e.preventDefault();
    setOpen(false);

    if (pathname === "/") {
      scrollToId(item.scrollTarget);
      window.history.replaceState(null, "", `/#${item.scrollTarget}`);
      setHash(item.scrollTarget);
      return;
    }

    router.push(`/#${item.scrollTarget}`);
  };

  const activeFor = (item: NavItem) => {
    if (item.scrollTarget) {
      if (pathname !== "/") return false;
      if (!hash && item.scrollTarget === "hero") return true;
      return hash === item.scrollTarget;
    }
    return isItemActive(item, pathname);
  };

  const light = pathname === "/map";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4 transition-all duration-500 sm:px-6 sm:pt-5",
          scrolled && "pt-3 sm:pt-3",
          light && "max-w-[90rem]",
        )}
      >
        {/* Brand — cool blue wordmark, distinct from gold Track CTA */}
        <Link
          href={HOME_ITEM.href}
          onClick={(e) => onNavClick(HOME_ITEM, e)}
          className={cn(
            "pointer-events-auto group relative flex items-center gap-2.5 pl-3 pr-1 transition-opacity duration-300",
            scrolled ? "opacity-95" : "opacity-100",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-8 w-[2px] rounded-full bg-gradient-to-b transition-all",
              light
                ? "from-[#3b82c4] via-[#3b82c4]/70 to-[#3b82c4]/20 shadow-[0_0_12px_rgba(59,130,196,0.35)] group-hover:shadow-[0_0_18px_rgba(59,130,196,0.5)]"
                : "from-accent via-accent/70 to-accent/20 shadow-[0_0_12px_rgba(110,182,255,0.45)] group-hover:shadow-[0_0_18px_rgba(110,182,255,0.65)]",
            )}
          />
          <span className="flex flex-col gap-0.5">
            <span
              className={cn(
                "font-nav text-[0.55rem] uppercase tracking-[0.32em] transition-colors",
                light
                  ? "text-[#3b82c4] group-hover:text-[#1d4ed8]"
                  : "text-accent/80 group-hover:text-accent",
              )}
            >
              Home
            </span>
            <span
              className={cn(
                "font-display text-[0.95rem] font-medium tracking-tight transition-colors sm:text-base",
                light
                  ? "text-[#121826] group-hover:text-[#1d4ed8]"
                  : "text-star group-hover:text-accent",
              )}
            >
              Planet Walk
            </span>
          </span>
        </Link>

        {/* Desktop island */}
        <nav
          className={cn(
            "pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border px-1.5 py-1.5 transition-all duration-300 md:flex",
            light
              ? scrolled
                ? "border-[#c9d3e2] bg-white/90 shadow-[0_12px_40px_rgba(18,24,38,0.1)] backdrop-blur-xl"
                : "border-[#d5dde8] bg-white/75 backdrop-blur-lg"
              : scrolled
                ? "border-white/12 bg-black/50 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                : "border-white/10 bg-white/[0.05] backdrop-blur-lg",
          )}
          aria-label="Primary"
        >
          {CENTER_ITEMS.map((item) => {
            const active = activeFor(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => onNavClick(item, e)}
                className={cn(
                  "relative rounded-full px-4 py-2 font-nav text-[0.65rem] uppercase tracking-[0.22em] transition-colors",
                  light
                    ? active
                      ? "text-[#121826]"
                      : "text-[#5b6577] hover:text-[#121826]"
                    : active
                      ? "text-star"
                      : "text-foreground-muted hover:text-star",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 rounded-full",
                      light ? "bg-[#e8edf3]" : "bg-white/10",
                    )}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Track + mobile */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href={TRACKER_ITEM.href}
            onClick={() => setOpen(false)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-nav text-[0.65rem] font-medium uppercase tracking-[0.2em] transition-all sm:px-5",
              light
                ? activeFor(TRACKER_ITEM)
                  ? "bg-[#1d4ed8] text-white shadow-[0_0_24px_rgba(29,78,216,0.25)]"
                  : "border border-[#1d4ed8]/30 bg-[#1d4ed8]/8 text-[#1d4ed8] hover:border-[#1d4ed8]/50 hover:bg-[#1d4ed8]/14"
                : activeFor(TRACKER_ITEM)
                  ? "bg-accent-warm text-void shadow-[0_0_24px_rgba(240,192,106,0.35)]"
                  : "border border-accent-warm/35 bg-accent-warm/10 text-accent-warm hover:border-accent-warm/60 hover:bg-accent-warm/20",
            )}
          >
            <span
              aria-hidden
              className="h-1 w-1 rounded-full bg-current opacity-80"
            />
            {TRACKER_ITEM.label}
          </Link>

          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors md:hidden",
              light
                ? "border-[#c9d3e2] bg-white/85 text-[#121826] hover:bg-white"
                : "border-white/15 bg-black/40 text-star hover:border-white/30 hover:bg-white/10",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={18} strokeWidth={1.5} />
            ) : (
              <Menu size={18} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open ? (
        <div
          id="mobile-nav"
          className="pointer-events-auto fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            aria-label="Close menu"
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              light ? "bg-[#121826]/35" : "bg-void/75",
            )}
            onClick={() => setOpen(false)}
          />
          <nav
            className={cn(
              "absolute inset-x-4 top-20 overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl",
              light
                ? "border-[#d5dde8] bg-white/95"
                : "border-white/12 bg-[#070912]/92 shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
            )}
            aria-label="Mobile"
          >
            <div
              className={cn(
                "border-b px-5 py-4",
                light ? "border-[#e8edf3]" : "border-white/8",
              )}
            >
              <p
                className={cn(
                  "font-mono text-[0.55rem] uppercase tracking-[0.4em]",
                  light ? "text-[#5b6577]" : "text-star/45",
                )}
              >
                Navigate
              </p>
              <p
                className={cn(
                  "font-display mt-1 text-lg",
                  light ? "text-[#121826]" : "text-star",
                )}
              >
                {SITE.name}
              </p>
            </div>
            <ul className="flex flex-col p-2">
              {[HOME_ITEM, ...CENTER_ITEMS, TRACKER_ITEM].map((item) => {
                const active = activeFor(item);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={(e) => onNavClick(item, e)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors",
                        light
                          ? active
                            ? "bg-[#e8edf3] text-[#121826]"
                            : "text-[#5b6577] hover:bg-[#f3f6fa] hover:text-[#121826]"
                          : active
                            ? "bg-white/8 text-star"
                            : "text-foreground-muted hover:bg-white/5 hover:text-star",
                      )}
                    >
                      <span className="font-nav text-[0.7rem] uppercase tracking-[0.22em]">
                        {item.label}
                      </span>
                      {active ? (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            light ? "bg-[#1d4ed8]" : "bg-accent-warm",
                          )}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
