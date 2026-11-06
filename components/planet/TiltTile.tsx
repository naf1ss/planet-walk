"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

type TiltTileProps = {
  src: string;
  alt: string;
  /** Planet colour, used for the glow behind the tile */
  color: string;
};

/** Campus tile on a dark stage: soft planet-coloured glow + 3D tilt on hover. */
export function TiltTile({ src, alt, color }: TiltTileProps) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), spring);
  const shineX = useTransform(px, [-0.5, 0.5], ["20%", "80%"]);
  const shineY = useTransform(py, [-0.5, 0.5], ["15%", "85%"]);
  const shine = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 55%)`,
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[26rem] [perspective:1100px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[18%] rounded-full opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${color}66 0%, ${color}22 40%, transparent 70%)`,
        }}
      />
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full"
      >
        <Image
          src={src}
          alt={alt}
          width={900}
          height={900}
          className="h-auto w-full rounded-[4px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)]"
          sizes="(max-width: 1024px) 85vw, 416px"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[4px] mix-blend-overlay"
          style={{ background: shine }}
        />
      </motion.div>
    </div>
  );
}
