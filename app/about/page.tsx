import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Gettysburg Planet Walk — a campus-scale solar system, Observatory mural, and interactive site by multidisciplinary artist Md Nafisul Hasan Sami.",
};

/**
 * About — project story, artist practice, and credits.
 */
export default function AboutPage() {
  return (
    <main className="ui-layer relative mx-auto max-w-3xl px-4 pb-[max(6rem,calc(4rem+env(safe-area-inset-bottom)))] pt-[max(6.5rem,calc(5.5rem+env(safe-area-inset-top)))] sm:px-8 sm:pb-28 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(110,182,255,0.12),transparent_55%)]"
      />

      {/* Hero */}
      <header className="max-w-2xl">
        <p className="font-nav text-[0.65rem] uppercase tracking-[0.32em] text-accent">
          Gettysburg College · Kolbe
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-star sm:text-6xl">
          About
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
          {SITE.tagline} — a campus installation and digital companion that
          turns astronomical scale into footsteps, tiles, and a mural you can
          walk toward.
        </p>
      </header>

      {/* Project */}
      <section className="mt-16 border-t border-white/10 pt-10" aria-labelledby="project-heading">
        <p className="font-nav text-[0.6rem] uppercase tracking-[0.28em] text-accent-warm">
          The project
        </p>
        <h2
          id="project-heading"
          className="mt-2 font-display text-2xl tracking-tight text-star sm:text-3xl"
        >
          Planet Walk
        </h2>
        <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-foreground-muted sm:text-base">
          <p>
            Planet Walk is a walkable scale model of the solar system on the
            Gettysburg College campus. The route begins at Masters Hall — home of
            the Hatter Planetarium, standing in for the Sun — and ends at the
            College Observatory. Across roughly{" "}
            <span className="text-star/90">7,561 feet</span>, each stop marks a
            world at the same scale used for distance, so the emptiness between
            planets becomes something you can feel underfoot.
          </p>
          <p>
            Station markers use ceramic tiles designed for the walk. At the
            Observatory, a mural completes the journey as a public visual
            destination — a bold arrival point for Physics &amp; Astronomy
            outreach on campus.
          </p>
          <p>
            This website extends the installation online: explore a 3D solar
            system, follow the campus map stop by stop, and track your walk with
            a digital passport.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-nav text-[0.55rem] uppercase tracking-[0.22em] text-accent-warm/90">
          <span>Masters Hall</span>
          <span
            aria-hidden
            className="h-px w-10 bg-gradient-to-r from-accent-warm/70 to-accent/50"
          />
          <span className="text-accent">Observatory</span>
        </div>
      </section>

      {/* Artist */}
      <section className="mt-16 border-t border-white/10 pt-10" aria-labelledby="artist-heading">
        <p className="font-nav text-[0.6rem] uppercase tracking-[0.28em] text-accent-warm">
          The artist
        </p>
        <h2
          id="artist-heading"
          className="mt-2 font-display text-2xl tracking-tight text-star sm:text-3xl"
        >
          Md Nafisul Hasan Sami
        </h2>
        <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-foreground-muted sm:text-base">
          <p>
            Nafis is a multidisciplinary artist and student at Gettysburg
            College working across studio art, mathematics, and data science.
            His practice sits at the overlap of those fields — turning abstract
            systems into experiences you can see, walk, and interact with.
          </p>
          <p>
            Whether through ceramic markers, mural painting, or interactive web
            environments, he treats scientific ideas as material: proportion
            becomes a path, orbital data becomes design, and public space
            becomes a place where research and aesthetics meet.
          </p>
        </div>
      </section>

      {/* Credits */}
      <section className="mt-16 border-t border-white/10 pt-10" aria-labelledby="credits-heading">
        <p className="font-nav text-[0.6rem] uppercase tracking-[0.28em] text-accent-warm">
          Credits
        </p>
        <h2
          id="credits-heading"
          className="mt-2 font-display text-2xl tracking-tight text-star sm:text-3xl"
        >
          People &amp; support
        </h2>
        <dl className="mt-6 space-y-5">
          <div>
            <dt className="font-nav text-[0.6rem] uppercase tracking-[0.22em] text-star/45">
              Researcher &amp; artist
            </dt>
            <dd className="mt-1 text-star">Md Nafisul Hasan Sami</dd>
          </div>
          <div>
            <dt className="font-nav text-[0.6rem] uppercase tracking-[0.22em] text-star/45">
              Mentor
            </dt>
            <dd className="mt-1 text-star">
              Prof. Ryan Johnson
              <span className="mt-0.5 block text-sm text-foreground-muted">
                Physics &amp; Astronomy, Gettysburg College
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-nav text-[0.6rem] uppercase tracking-[0.22em] text-star/45">
              Support
            </dt>
            <dd className="mt-1 text-foreground-muted">
              Kolbe Summer Fellowship · Physics &amp; Astronomy outreach
            </dd>
          </div>
        </dl>
      </section>

      {/* CTAs */}
      <section className="mt-16 border-t border-white/10 pt-10" aria-label="Continue exploring">
        <p className="font-nav text-[0.6rem] uppercase tracking-[0.28em] text-accent">
          Continue
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/#explore"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 font-nav text-[0.65rem] uppercase tracking-[0.2em] text-star transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Explore
          </Link>
          <Link
            href="/map"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 font-nav text-[0.65rem] uppercase tracking-[0.2em] text-star transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Map
          </Link>
          <Link
            href="/tracker"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent-warm/40 bg-accent-warm/10 px-5 py-2.5 font-nav text-[0.65rem] uppercase tracking-[0.2em] text-accent-warm transition-colors hover:border-accent-warm/60 hover:bg-accent-warm/20"
          >
            Track
          </Link>
        </div>
      </section>
    </main>
  );
}
