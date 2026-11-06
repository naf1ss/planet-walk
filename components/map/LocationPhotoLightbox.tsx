"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { CampusMapStop } from "@/lib/campus-map-stops";

type LocationPhotoLightboxProps = {
  stop: CampusMapStop | null;
  onClose: () => void;
};

/**
 * Shared-layout lightbox — expands the popup thumb, shrinks back on close.
 * Portaled to document.body so it sits above Leaflet's map stacking context.
 */
export function LocationPhotoLightbox({
  stop,
  onClose,
}: LocationPhotoLightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!stop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [stop, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {stop?.locationImage ? (
        <motion.div
          key={stop.slug}
          className="pointer-events-auto fixed inset-0 flex items-center justify-center p-[max(1rem,env(safe-area-inset-top))] px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8"
          style={{ zIndex: 10000 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${stop.name} location picture`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-[#0b1220]/72 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />

          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-4">
            <motion.div
              layoutId={`location-photo-${stop.slug}`}
              className="overflow-hidden rounded-2xl bg-[#121826] shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 34,
                mass: 0.85,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stop.locationImage}
                alt={`${stop.name} campus location`}
                className="max-h-[min(78vh,860px)] w-auto max-w-full object-contain"
                draggable={false}
              />
            </motion.div>

            <motion.div
              className="flex w-full max-w-4xl items-end justify-between gap-4 px-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.08, duration: 0.28 }}
            >
              <div>
                <p className="font-nav text-[0.72rem] uppercase tracking-[0.28em] text-white/55">
                  Location Picture · Stop {stop.index + 1}
                </p>
                <p className="mt-1 font-display text-xl text-white sm:text-2xl">
                  {stop.name}
                </p>
                <p className="mt-0.5 text-sm text-white/60">{stop.landmark}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
