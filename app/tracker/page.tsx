/**
 * Tracker / digital passport — Phase 1 stub.
 * Later: localStorage progress, elapsed time, miles walked.
 */
export default function TrackerPage() {
  return (
    <main className="ui-layer flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent">
        Passport
      </p>
      <h1 className="font-display text-4xl text-star sm:text-6xl">Tracker</h1>
      <p className="mt-4 max-w-sm text-foreground-muted">
        Route stub for <code className="text-accent">/tracker</code>. Progress
        persistence lands in a later phase.
      </p>
    </main>
  );
}
