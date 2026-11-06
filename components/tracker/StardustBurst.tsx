"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BODY_CONTENT, BODY_SLUGS } from "@/lib/planet-content";

const DURATION_MS = 3200;
const COLORS = [...BODY_SLUGS.map((s) => BODY_CONTENT[s].color), "#ffffff", "#ffffff"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  twinkle: number;
  life: number;
};

/**
 * Full-screen celebration when the walk is complete: stardust in every
 * planet's colour bursts out from the centre and drifts away, behind a
 * "You made it to Pluto" message.
 */
export function StardustBurst({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 1800 : DURATION_MS);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const reach = Math.max(w, h);
    const particles: Particle[] = [];
    const spawn = (count: number, speed: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.35 + Math.random() * 0.9);
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          size: 0.8 + Math.random() * 2.6,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          twinkle: Math.random() * Math.PI * 2,
          life: 0.75 + Math.random() * 0.25,
        });
      }
    };
    spawn(170, reach * 0.9);
    const second = window.setTimeout(() => spawn(90, reach * 0.55), 260);

    let raf = 0;
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / DURATION_MS;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const drag = Math.exp(-dt * 2.4);
        p.vx *= drag;
        p.vy = p.vy * drag + 30 * dt; // gentle fall
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.twinkle += dt * 9;
        const fade = Math.max(0, 1 - t / p.life);
        const alpha = fade * (0.65 + 0.35 * Math.sin(p.twinkle));
        if (alpha <= 0) continue;
        const r = p.size * (1 + 1.6 * (1 - fade));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
        g.addColorStop(0, p.color);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = g;
        ctx.fillRect(p.x - r * 3.2, p.y - r * 3.2, r * 6.4, r * 6.4);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(second);
    };
  }, [reduce]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,4,10,0.86),rgba(3,4,10,0.97))] backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <motion.div
        className="relative px-6 text-center"
        initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-display text-2xl italic text-accent sm:text-3xl">
          Journey complete
        </p>
        <p className="mt-1 font-display text-6xl leading-none text-star drop-shadow-[0_0_40px_rgba(240,192,106,0.35)] sm:text-8xl">
          You made it
          <br />
          <span className="italic text-accent-warm">to Pluto</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
