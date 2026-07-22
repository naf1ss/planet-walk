import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

/** Stub — project story lands in a later phase. */
export default function AboutPage() {
  return (
    <main className="ui-layer flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
      <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent">
        Coming soon
      </p>
      <h1 className="font-display text-4xl text-star sm:text-6xl">About</h1>
      <p className="mt-4 max-w-sm text-foreground-muted">
        Project background and credits will live here. Menu destination reserved
        for a later phase.
      </p>
    </main>
  );
}
