import Link from "next/link";
import { SITE } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Standard site footer — mirrors primary nav; extend content later as needed.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-30 border-t border-border bg-background-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg tracking-tight text-star">
            {SITE.name}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            {SITE.tagline}. A physical + digital walk across {SITE.campus}.
          </p>
        </div>

        <div>
          <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
            Navigate
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="text-sm text-foreground-muted transition-colors hover:text-star"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-nav text-[0.65rem] uppercase tracking-[0.28em] text-accent">
            Campus
          </p>
          <p className="mt-4 text-sm text-foreground-muted">{SITE.campus}</p>
          <p className="mt-1 text-sm text-foreground-muted">Gettysburg, PA</p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-foreground-muted/80 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {year} {SITE.name}
          </p>
          <p className="tracking-wide">Built for the campus solar system walk</p>
        </div>
      </div>
    </footer>
  );
}
