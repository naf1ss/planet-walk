"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { BodyContent } from "@/lib/planet-content";
import { markReturnToSolarSystem, RETURN_PARAM } from "@/lib/planet-transition";
import { PlanetFlyScene } from "@/components/planet/PlanetFlyScene";
import { PlanetDetailOverlay } from "@/components/planet/PlanetDetailOverlay";

type PlanetExperienceProps = {
  body: BodyContent;
};

type ExitIntent =
  | { type: "push-home" }
  | { type: "history-back" };

const SCROLL_TOP_TIMEOUT_MS = 1400;

/**
 * Guided planet page: spinning hero backdrop + sparse center copy,
 * details and vinyl tile further down the page.
 */
export function PlanetExperience({ body }: PlanetExperienceProps) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const exitIntentRef = useRef<ExitIntent | null>(null);
  const hasBackGuardRef = useRef(false);
  const skipNextPopRef = useRef(false);

  const waitForScrollTop = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (window.scrollY <= 2) {
        resolve();
        return;
      }

      let done = false;
      const complete = () => {
        if (done) return;
        done = true;
        window.removeEventListener("scroll", onScrollCheck);
        clearTimeout(timer);
        resolve();
      };
      const onScrollCheck = () => {
        if (window.scrollY <= 2) complete();
      };
      const timer = window.setTimeout(complete, SCROLL_TOP_TIMEOUT_MS);

      window.addEventListener("scroll", onScrollCheck, { passive: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const triggerExitTransition = useCallback(
    async (intent: ExitIntent) => {
      if (exiting) return;
      exitIntentRef.current = intent;
      await waitForScrollTop();
      setExiting(true);
    },
    [exiting, waitForScrollTop],
  );

  const onBack = useCallback(() => {
    void triggerExitTransition({ type: "push-home" });
  }, [triggerExitTransition]);

  useEffect(() => {
    // Back-button guard: first native back stays on this route and lets us animate.
    if (!hasBackGuardRef.current) {
      window.history.pushState({ planetExitGuard: true }, "", window.location.href);
      hasBackGuardRef.current = true;
    }

    const onPopState = () => {
      if (skipNextPopRef.current || exiting) return;
      void triggerExitTransition({ type: "history-back" });
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (exiting) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Intercept home/explore style links while on a planet route.
      if (href === "/" || href === "/#hero" || href === "/#explore") {
        event.preventDefault();
        void triggerExitTransition({ type: "push-home" });
      }
    };

    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onDocumentClick, true);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [exiting, triggerExitTransition]);

  const onExitComplete = useCallback(() => {
    const intent = exitIntentRef.current;
    exitIntentRef.current = null;

    markReturnToSolarSystem();

    if (intent?.type === "history-back") {
      skipNextPopRef.current = true;
      window.history.go(-1);
      return;
    }

    router.push(`/?${RETURN_PARAM}=true`);
  }, [router]);

  return (
    <main className="relative min-h-[100dvh] w-full bg-void">
      <PlanetFlyScene
        key={body.slug}
        body={body}
        exiting={exiting}
        onExitComplete={onExitComplete}
      />
      <PlanetDetailOverlay body={body} onBack={onBack} exiting={exiting} />

      <AnimatePresence>
        {exiting ? (
          <motion.div
            key="planet-exit-scrim"
            className="pointer-events-none fixed inset-0 z-[15] bg-void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
