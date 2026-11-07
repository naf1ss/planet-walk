import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { WALK_STOPS, WALK_TOTAL_LABEL } from "@/lib/planetData";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Gettysburg Planet Walk — a campus-scale solar system, Observatory mural, and interactive site by multidisciplinary artist Md Nafisul Hasan Sami.",
};

/** Section shell — stacked on phones, label/heading rail + body on desktop. */
const SECTION =
  "mt-16 border-t border-white/10 pt-10 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-14";
const SECTION_RAIL = "lg:col-span-4 lg:sticky lg:top-28 lg:self-start";
const SECTION_BODY = "lg:col-span-8";

/**
 * About — project story, artist practice, and credits.
 */
export default function AboutPage() {
  return (
    <main className="ui-layer relative mx-auto max-w-3xl px-4 pb-[max(6rem,calc(4rem+env(safe-area-inset-bottom)))] pt-[max(6.5rem,calc(5.5rem+env(safe-area-inset-top)))] sm:px-8 sm:pb-28 sm:pt-28 lg:max-w-6xl lg:px-10 lg:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(110,182,255,0.12),transparent_55%)]"
      />

      {/* Hero */}
      <header className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="max-w-2xl lg:col-span-7 lg:max-w-none">
          <p className="font-nav text-[0.72rem] uppercase tracking-[0.2em] text-accent">
            Gettysburg College · Kolbe
          </p>
          <h1 className="mt-3 font-display text-5xl text-star sm:text-7xl lg:text-8xl">
            About
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
            {SITE.tagline} — a campus installation and digital companion that
            turns astronomical scale into footsteps, tiles, and a mural you can
            walk toward.
          </p>
        </div>

        <dl className="hidden lg:col-span-5 lg:grid lg:grid-cols-2 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/10 lg:bg-white/[0.03] lg:backdrop-blur-md">
          <div className="border-b border-r border-white/10 px-6 py-5">
            <dt className="font-nav text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              Scale route
            </dt>
            <dd className="mt-2 font-display text-3xl text-star">
              {WALK_TOTAL_LABEL.feetLabel}
            </dd>
            <dd className="mt-1 text-xs text-foreground-muted">
              {WALK_TOTAL_LABEL.milesLabel} on foot
            </dd>
          </div>
          <div className="border-b border-white/10 px-6 py-5">
            <dt className="font-nav text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              Stops
            </dt>
            <dd className="mt-2 font-display text-3xl text-star">
              {WALK_STOPS.length}
            </dd>
            <dd className="mt-1 text-xs text-foreground-muted">Sun → Pluto</dd>
          </div>
          <div className="col-span-2 flex items-center gap-3 px-6 py-4 font-nav text-[0.65rem] uppercase tracking-[0.14em]">
            <span className="text-accent-warm/90">Masters Hall</span>
            <span
              aria-hidden
              className="h-px flex-1 bg-gradient-to-r from-accent-warm/70 to-accent/50"
            />
            <span className="text-accent">Observatory</span>
          </div>
        </dl>
      </header>

      {/* Project */}
      <section className={SECTION} aria-labelledby="project-heading">
        <div className={SECTION_RAIL}>
          <p className="font-nav text-[0.68rem] uppercase tracking-[0.16em] text-accent-warm">
            The project
          </p>
          <h2
            id="project-heading"
            className="mt-2 font-display text-3xl text-star sm:text-4xl lg:text-5xl"
          >
            Planet Walk
          </h2>
        </div>
        <div className={SECTION_BODY}>
          <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-foreground-muted sm:text-base lg:mt-0 lg:max-w-2xl lg:space-y-5 lg:text-[1.05rem]">
            <p>
              Planet Walk is a walkable scale model of the solar system on the
              Gettysburg College campus. The route begins at Masters Hall — home
              of the Hatter Planetarium, standing in for the Sun — and ends at
              the College Observatory. Across roughly{" "}
              <span className="text-star/90">7,561 feet</span>, each stop marks
              a world at the same scale used for distance, so the emptiness
              between planets becomes something you can feel underfoot.
            </p>
            <p>
              Station markers use ceramic tiles designed for the walk. At the
              Observatory, a mural completes the journey as a public visual
              destination — a bold arrival point for Physics &amp; Astronomy
              outreach on campus.
            </p>
            <p>
              This website extends the installation online: explore a 3D solar
              system, follow the campus map stop by stop, and track your walk
              with a digital passport.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-nav text-[0.65rem] uppercase tracking-[0.14em] text-accent-warm/90 lg:hidden">
            <span>Masters Hall</span>
            <span
              aria-hidden
              className="h-px w-10 bg-gradient-to-r from-accent-warm/70 to-accent/50"
            />
            <span className="text-accent">Observatory</span>
          </div>
        </div>
      </section>

      {/* Artist */}
      <section className={SECTION} aria-labelledby="artist-heading">
        <div className={SECTION_RAIL}>
          <p className="font-nav text-[0.68rem] uppercase tracking-[0.16em] text-accent-warm">
            The artist
          </p>
          <h2
            id="artist-heading"
            className="mt-2 font-display text-3xl text-star sm:text-4xl lg:text-5xl"
          >
            Md Nafisul Hasan Sami
          </h2>
        </div>
        <div className={SECTION_BODY}>
          <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-foreground-muted sm:text-base lg:mt-0 lg:max-w-2xl lg:space-y-5 lg:text-[1.05rem]">
            <p>
              Nafis is a multidisciplinary artist and student at Gettysburg
              College working across studio art, mathematics, and data science.
              His practice sits at the overlap of those fields — turning
              abstract systems into experiences you can see, walk, and interact
              with.
            </p>
            <p>
              Whether through ceramic markers, mural painting, or interactive
              web environments, he treats scientific ideas as material:
              proportion becomes a path, orbital data becomes design, and public
              space becomes a place where research and aesthetics meet.
            </p>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className={SECTION} aria-labelledby="credits-heading">
        <div className={SECTION_RAIL}>
          <p className="font-nav text-[0.68rem] uppercase tracking-[0.16em] text-accent-warm">
            Credits
          </p>
          <h2
            id="credits-heading"
            className="mt-2 font-display text-3xl text-star sm:text-4xl lg:text-5xl"
          >
            People &amp; support
          </h2>
        </div>
        <div className={SECTION_BODY}>
          <dl className="mt-6 space-y-5 lg:mt-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
            <div className="lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.03] lg:p-5">
              <dt className="font-nav text-[0.68rem] uppercase tracking-[0.14em] text-star/45">
                Researcher &amp; artist
              </dt>
              <dd className="mt-1 text-star lg:mt-2">Md Nafisul Hasan Sami</dd>
            </div>
            <div className="lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.03] lg:p-5">
              <dt className="font-nav text-[0.68rem] uppercase tracking-[0.14em] text-star/45">
                Mentor
              </dt>
              <dd className="mt-1 text-star lg:mt-2">
                Prof. Ryan Johnson
                <span className="mt-0.5 block text-sm text-foreground-muted">
                  Physics &amp; Astronomy, Gettysburg College
                </span>
              </dd>
            </div>
            <div className="lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.03] lg:p-5">
              <dt className="font-nav text-[0.68rem] uppercase tracking-[0.14em] text-star/45">
                Support
              </dt>
              <dd className="mt-1 text-foreground-muted lg:mt-2">
                Kolbe Summer Fellowship · Physics &amp; Astronomy outreach
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTAs */}
      <section className={SECTION} aria-label="Continue exploring">
        <div className={SECTION_RAIL}>
          <p className="font-nav text-[0.68rem] uppercase tracking-[0.16em] text-accent">
            Continue
          </p>
        </div>
        <div className={SECTION_BODY}>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-0">
            <Link
              href="/#explore"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 font-nav text-[0.72rem] uppercase tracking-[0.14em] text-star transition-colors hover:border-white/30 hover:bg-white/5"
            >
              Explore
            </Link>
            <Link
              href="/map"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 font-nav text-[0.72rem] uppercase tracking-[0.14em] text-star transition-colors hover:border-white/30 hover:bg-white/5"
            >
              Map
            </Link>
            <Link
              href="/tracker"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent-warm/40 bg-accent-warm/10 px-5 py-2.5 font-nav text-[0.72rem] uppercase tracking-[0.14em] text-accent-warm transition-colors hover:border-accent-warm/60 hover:bg-accent-warm/20"
            >
              Track
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
