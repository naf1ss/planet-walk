"use client";

import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Orbit geometry — keep in sync with the ring's inset/height classes below. */
const RX_PAD = 7;
const RY = 9;
const TILT = -0.12;

const BASE_SPEED = (Math.PI * 2) / 11;
const HOVER_SPEED = BASE_SPEED * 3.2;

/**
 * A tiny moon circling the wordmark. Passes behind the letters on the far
 * side of its orbit, and speeds up while the brand is hovered.
 */
export function BrandOrbit({
  hovered,
  light,
}: {
  hovered: boolean;
  light: boolean;
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement>(null);
  const moonRef = useRef<HTMLSpanElement>(null);
  const widthRef = useRef(0);
  const angleRef = useRef(Math.PI * 0.2);
  const speedRef = useRef(BASE_SPEED);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      widthRef.current = root.offsetWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const moon = moonRef.current;
    if (!moon || reduce || widthRef.current === 0) return;

    const dt = Math.min(delta, 64) / 1000;
    const target = hovered ? HOVER_SPEED : BASE_SPEED;
    speedRef.current += (target - speedRef.current) * Math.min(1, dt * 4);
    angleRef.current = (angleRef.current + speedRef.current * dt) % (Math.PI * 2);

    const a = angleRef.current;
    const rx = widthRef.current / 2 + RX_PAD;
    const ex = Math.cos(a) * rx;
    const ey = Math.sin(a) * RY;
    const x = ex * Math.cos(TILT) - ey * Math.sin(TILT);
    const y = ex * Math.sin(TILT) + ey * Math.cos(TILT);

    // sin(a) > 0 is the near side of the orbit (in front of the text).
    const near = (Math.sin(a) + 1) / 2;
    moon.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${(0.7 + near * 0.45).toFixed(3)})`;
    moon.style.opacity = (0.3 + near * 0.7).toFixed(3);
    moon.style.zIndex = Math.sin(a) > 0 ? "2" : "0";
  });

  if (reduce) return null;

  return (
    <span
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      <span
        className={cn(
          "absolute -left-[7px] -right-[7px] top-1/2 h-[18px] -translate-y-1/2 rotate-[-6.9deg] rounded-[50%] border opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          light ? "border-[#3b82c4]/25" : "border-accent/20",
        )}
      />
      <span
        ref={moonRef}
        className={cn(
          "absolute left-1/2 top-1/2 -ml-[2px] -mt-[2px] h-[4px] w-[4px] rounded-full opacity-0 will-change-transform",
          light
            ? "bg-[#3b82c4] shadow-[0_0_6px_rgba(59,130,196,0.7)]"
            : "bg-[#dcecff] shadow-[0_0_6px_1px_rgba(110,182,255,0.75)]",
        )}
      />
    </span>
  );
}
