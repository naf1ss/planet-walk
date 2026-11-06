"use client";

import { AnimatePresence, motion } from "framer-motion";

type PlanetTransitOverlayProps = {
  active: boolean;
  label: string | null;
};

/**
 * Full-screen cinematic wipe shown while the camera dives toward a planet.
 * Runs entirely in the browser — no hosting required.
 */
export function PlanetTransitOverlay({
  active,
  label,
}: PlanetTransitOverlayProps) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="planet-transit"
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-void"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.7] }}
            transition={{ duration: 1.5, times: [0, 0.45, 1], ease: "easeInOut" }}
          />

          {/* Expanding ring flash */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/40"
            initial={{ scale: 0.05, opacity: 0.9 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-warm/30"
            initial={{ scale: 0.02, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, transparent 22%, rgba(3,4,10,0.9) 68%)",
            }}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className="relative px-6 text-center"
            initial={{ opacity: 0, scale: 0.88, filter: "blur(12px)", y: 18 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-display text-xl italic text-accent sm:text-2xl">
              Entering orbit
            </p>
            <p className="font-display mt-1 text-6xl text-star sm:text-8xl md:text-9xl">
              {label}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
