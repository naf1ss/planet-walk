"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Fixed site menu. Destinations live in lib/nav.ts — swap fonts via CSS vars.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-border bg-glass/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
        <Link
          href="/#hero"
          onClick={(e) =>
            onNavClick(
              NAV_ITEMS.find((i) => i.id === "planet-walk")!,
              e,
            )
          }
          className="pointer-events-auto font-display text-sm font-medium tracking-[0.08em] text-star transition-colors hover:text-accent sm:text-[0.95rem]"
        >
          {SITE.name}
        </Link>

        <nav
          className="pointer-events-auto hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => onNavClick(item, e)}
              className="pointer-events-auto rounded-sm px-3 py-2 font-nav text-[0.7rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-star"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="pointer-events-auto inline-flex items-center justify-center rounded-sm p-2 text-star md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="pointer-events-auto border-t border-border bg-background-elevated/95 px-5 py-4 backdrop-blur-md md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={(e) => onNavClick(item, e)}
                  className="block rounded-sm px-2 py-3 font-nav text-xs uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-star"
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
