type PlanetPageProps = {
  params: Promise<{ name: string }>;
};

/**
 * Dynamic planet route — Phase 1 stub.
 * Later: camera fly-to, artwork, facts, campus tile map.
 */
export default async function PlanetPage({ params }: PlanetPageProps) {
  const { name } = await params;

  return (
    <main className="ui-layer flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent">
        Planet
      </p>
      <h1 className="font-display text-4xl capitalize text-star sm:text-6xl">
        {name}
      </h1>
      <p className="mt-4 max-w-sm text-foreground-muted">
        Route stub for <code className="text-accent">/planet/{name}</code>. Content
        and 3D fly-through land in a later phase.
      </p>
    </main>
  );
}
