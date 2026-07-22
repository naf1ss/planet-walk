"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BodyContent } from "@/lib/planet-content";
import { PlanetFlyScene } from "@/components/planet/PlanetFlyScene";
import { PlanetDetailOverlay } from "@/components/planet/PlanetDetailOverlay";

type PlanetExperienceProps = {
  body: BodyContent;
};

/**
 * Guided planet page: spinning hero backdrop + sparse center copy,
 * details and vinyl tile further down the page.
 */
export function PlanetExperience({ body }: PlanetExperienceProps) {
  const router = useRouter();

  const onBack = useCallback(() => {
    router.push("/#explore");
  }, [router]);

  return (
    <main className="relative min-h-[100dvh] w-full bg-void">
      <PlanetFlyScene key={body.slug} body={body} />
      <PlanetDetailOverlay body={body} onBack={onBack} />
    </main>
  );
}
