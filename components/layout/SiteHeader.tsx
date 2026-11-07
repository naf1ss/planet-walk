"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandOrbit } from "@/components/layout/BrandOrbit";
import { SITE } from "@/lib/constants";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { markReturnToSolarSystem } from "@/lib/planet-transition";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Header pieces drop out of "hyperspace" once per page load. */
function warpIn(delay: number) {
  return {
    initial: { opacity: 0, y: -10, scale: 0.96, filter: "blur(8px)" },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      // Leaving a filter on would break the nav pill's backdrop blur.
      transitionEnd: { filter: "none" },
    },
    transition: { duration: 0.9, ease: EASE, delay },
  };
}

const ORB_SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

const menuList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const menuItem = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE },
  },
};

/** Fired on the home page when "Planet Walk" is clicked; the landing page may
 * cancel it to restart the intro itself (e.g. when it opened at Explore). */
export const RESTART_INTRO_EVENT = "planetwalk:restart-intro";

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
  const [brandHover, setBrandHover] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const hashId = window.location.hash.replace("#", "");
    // The landing page positions itself for #hero / #explore on load.
    if (!hashId || hashId === "hero" || hashId === "explore") return;
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
    // A page (e.g. a planet's zoom-out exit) already took over this click.
    if (e.defaultPrevented) {
      setOpen(false);
      return;
    }
    if (!item.scrollTarget) {
      setOpen(false);
      return;
    }

    e.preventDefault();
    setOpen(false);

    if (pathname === "/") {
      window.history.replaceState(null, "", `/#${item.scrollTarget}`);
      setHash(item.scrollTarget);
      if (item.scrollTarget === "hero") {
        const notCancelled = window.dispatchEvent(
          new Event(RESTART_INTRO_EVENT, { cancelable: true }),
        );
        if (!notCancelled) return;
      }
      scrollToId(item.scrollTarget);
      return;
    }

    // Coming from another page: open Explore directly at the solar system
    // instead of scrolling through the whole galaxy intro.
    if (item.scrollTarget === "explore") markReturnToSolarSystem();
    setHash(item.scrollTarget);
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
    <MotionConfig reducedMotion="user">
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Frosted band behind the header once the page scrolls, so text
          underneath never collides with the brand or nav. Hidden on the
          home page, where the 3D scene is the backdrop. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-[calc(100%+0.75rem)] backdrop-blur-xl transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,black_65%,transparent)]",
          light ? "bg-[#eef2f6]/80" : "bg-[#03040a]/70",
          scrolled && pathname !== "/" ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] transition-all duration-500 sm:gap-3 sm:px-6 sm:pt-5",
          scrolled && "sm:pt-3",
          light && "max-w-[90rem]",
        )}
      >
        {/* Brand — cool blue wordmark, distinct from gold Track CTA */}
        <motion.div {...warpIn(0.05)} className="min-w-0">
        <Link
          href={HOME_ITEM.href}
          onClick={(e) => onNavClick(HOME_ITEM, e)}
          onMouseEnter={() => setBrandHover(true)}
          onMouseLeave={() => setBrandHover(false)}
          onFocus={() => setBrandHover(true)}
          onBlur={() => setBrandHover(false)}
          className={cn(
            "pointer-events-auto group relative flex min-w-0 items-center gap-2 pl-2 pr-1 transition-opacity duration-300 sm:gap-2.5 sm:pl-3",
            scrolled ? "opacity-95" : "opacity-100",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-7 w-[2px] shrink-0 rounded-full bg-gradient-to-b transition-all sm:h-8",
              light
                ? "from-[#3b82c4] via-[#3b82c4]/70 to-[#3b82c4]/20 shadow-[0_0_12px_rgba(59,130,196,0.35)] group-hover:shadow-[0_0_18px_rgba(59,130,196,0.5)]"
                : "from-accent via-accent/70 to-accent/20 shadow-[0_0_12px_rgba(110,182,255,0.45)] group-hover:shadow-[0_0_18px_rgba(110,182,255,0.65)]",
            )}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                "hidden font-nav text-[0.65rem] uppercase tracking-[0.2em] transition-colors sm:block",
                light
                  ? "text-[#3b82c4] group-hover:text-[#1d4ed8]"
                  : "text-accent/80 group-hover:text-accent",
              )}
            >
              Home
            </span>
            <span className="relative flex min-w-0">
              <span
                className={cn(
                  "relative z-[1] truncate font-display text-[1.15rem] leading-none transition-colors sm:text-[1.3rem]",
                  light
                    ? "text-[#121826] group-hover:text-[#1d4ed8]"
                    : "text-star group-hover:text-accent",
                )}
              >
                Planet Walk
              </span>
              <BrandOrbit hovered={brandHover} light={light} />
            </span>
          </span>
        </Link>
        </motion.div>

        {/* Desktop island */}
        <motion.nav
          {...warpIn(0.15)}
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
                  "relative rounded-full px-4 py-2 font-nav text-[0.72rem] uppercase tracking-[0.14em] transition-colors",
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
                  <>
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={ORB_SPRING}
                      aria-hidden
                      className={cn(
                        "absolute inset-0 rounded-full",
                        light ? "bg-[#e8edf3]" : "bg-white/10",
                      )}
                    />
                    {/* Glowing planet riding the pill's border */}
                    <motion.span
                      layoutId="nav-active-orb"
                      transition={ORB_SPRING}
                      aria-hidden
                      className={cn(
                        "absolute -bottom-[9px] left-[calc(50%-2.5px)] h-[5px] w-[5px] rounded-full",
                        light
                          ? "bg-[#3b82c4] shadow-[0_0_8px_rgba(59,130,196,0.8)]"
                          : "bg-[#dcecff] shadow-[0_0_10px_2px_rgba(110,182,255,0.7)]",
                      )}
                    />
                  </>
                ) : null}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </motion.nav>

        {/* Track + mobile */}
        <motion.div
          {...warpIn(0.25)}
          className="pointer-events-auto relative z-[60] flex items-center gap-2"
        >
          <Link
            href={TRACKER_ITEM.href}
            onClick={() => setOpen(false)}
            className={cn(
              "track-cta inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 font-nav text-[0.68rem] font-medium uppercase tracking-[0.18em] transition-all sm:px-5 sm:py-2.5 sm:text-[0.72rem] sm:tracking-[0.14em]",
              light
                ? activeFor(TRACKER_ITEM)
                  ? "bg-[#1d4ed8] text-white shadow-[0_0_24px_rgba(29,78,216,0.25)] [--flare:#ffffff]"
                  : "border border-[#1d4ed8]/30 bg-[#1d4ed8]/8 text-[#1d4ed8] hover:border-[#1d4ed8]/50 hover:bg-[#1d4ed8]/14 [--flare:#1d4ed8]"
                : activeFor(TRACKER_ITEM)
                  ? "bg-accent-warm text-void shadow-[0_0_24px_rgba(240,192,106,0.35)] [--flare:#ffffff]"
                  : "border border-accent-warm/35 bg-accent-warm/10 text-accent-warm hover:border-accent-warm/60 hover:bg-accent-warm/20 [--flare:var(--accent-warm)]",
            )}
          >
            <span aria-hidden className="track-cta__flare" />
            <span aria-hidden className="relative hidden items-center sm:inline-flex">
              <span className="track-cta__core h-1 w-1 rounded-full bg-current opacity-80" />
              <span className="track-cta__spark" />
              <span className="track-cta__spark" />
              <span className="track-cta__spark" />
            </span>
            <span className="relative">{TRACKER_ITEM.label}</span>
          </Link>

          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-colors md:hidden",
              light
                ? "border-[#c9d3e2] bg-white/85 text-[#121826] hover:bg-white"
                : "border-white/15 bg-black/40 text-star hover:border-white/30 hover:bg-white/10",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="inline-flex"
              >
                {open ? (
                  <X size={18} strokeWidth={1.5} />
                ) : (
                  <Menu size={18} strokeWidth={1.5} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-nav"
          id="mobile-nav"
          className="pointer-events-auto fixed inset-0 z-50 md:hidden"
        >
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              light ? "bg-[#121826]/35" : "bg-void/75",
            )}
            onClick={() => setOpen(false)}
          />
          <motion.nav
            initial={{ opacity: 0, y: -12, scale: 0.97, filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transitionEnd: { filter: "none" },
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
              transition: { duration: 0.18, ease: EASE },
            }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ transformOrigin: "top right" }}
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
                  "font-mono text-[0.65rem] uppercase tracking-[0.22em]",
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
            <motion.ul
              variants={menuList}
              initial="hidden"
              animate="show"
              className="flex flex-col p-2"
            >
              {[HOME_ITEM, ...CENTER_ITEMS, TRACKER_ITEM].map((item) => {
                const active = activeFor(item);
                return (
                  <motion.li key={item.id} variants={menuItem}>
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
                      <span className="font-nav text-[0.7rem] uppercase tracking-[0.14em]">
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
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.nav>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </header>
    </MotionConfig>
  );
}
