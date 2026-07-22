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

/**
 * Fixed frosted-glass site menu — home pill left, links center, Track CTA right.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Honor hash links on home (e.g. /#explore from another page)
  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const t = window.setTimeout(() => scrollToId(hash), 80);
    return () => window.clearTimeout(t);
  }, [pathname]);

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
      return;
    }

    router.push(`/#${item.scrollTarget}`);
  };

  return (
    <header className="pointer-events-none fixed top-0 z-50 w-full border-b border-white/10 bg-black/5 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-6 py-4">
        {/* Left — Home pill */}
        <Link
          href={HOME_ITEM.href}
          onClick={(e) => onNavClick(HOME_ITEM, e)}
          className="pointer-events-auto rounded-full border border-white/20 px-5 py-2 font-display text-sm font-medium tracking-[0.08em] text-star transition-colors hover:bg-white/10"
        >
          {SITE.name}
        </Link>

        {/* Center — primary links (Planet Walk + Tracker removed) */}
        <nav
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {CENTER_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => onNavClick(item, e)}
              className="rounded-full px-4 py-2 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:bg-white/10 hover:text-star"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right — Track CTA + mobile menu */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href={TRACKER_ITEM.href}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-full bg-white px-6 py-2 font-nav text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-black transition-all hover:bg-gray-200",
            )}
          >
            {TRACKER_ITEM.label}
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/20 p-2 text-star transition-colors hover:bg-white/10 md:hidden"
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

      {open ? (
        <nav
          id="mobile-nav"
          className="pointer-events-auto border-t border-white/10 bg-black/5 px-6 py-4 backdrop-blur-md md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {CENTER_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={(e) => onNavClick(item, e)}
                  className="block rounded-full px-4 py-3 text-center font-nav text-xs uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:bg-white/10 hover:text-star"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
