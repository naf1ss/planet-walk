"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MilkyWay } from "@/components/canvas/MilkyWay";
import { SolarSystem } from "@/components/canvas/SolarSystem";
import { ScrollCamera } from "@/components/canvas/ScrollCamera";
import {
  CAMERA_END,
  CAMERA_START,
  scrollCamera,
} from "@/lib/scroll-camera";

type SceneCanvasProps = {
  scrollTrackRef: React.RefObject<HTMLElement | null>;
};

function Experience() {
  return (
    <>
      <color attach="background" args={["#020308"]} />
      <fog attach="fog" args={["#020308", 160, 720]} />
      {/* Dim ambient so sun-lit / night sides read clearly on planets */}
      <ambientLight intensity={0.06} />
      <ScrollCamera />
      <MilkyWay />
      <SolarSystem />
      <Stars
        radius={480}
        depth={90}
        count={1800}
        factor={2}
        saturation={0}
        fade
        speed={0.12}
      />
    </>
  );
}

/**
 * Fixed full-viewport R3F canvas + GSAP ScrollTrigger camera dive.
 */
export function SceneCanvas({ scrollTrackRef }: SceneCanvasProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const track = scrollTrackRef.current;
    if (!track) return;

    Object.assign(scrollCamera, { progress: 0, ...CAMERA_START });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        scrollCamera,
        { progress: 0, ...CAMERA_START },
        {
          progress: 1,
          ...CAMERA_END,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      );
    }, track);

    // Defer refresh until layout settles (avoids broken first paint)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
      Object.assign(scrollCamera, { progress: 0, ...CAMERA_START });
    };
  }, [scrollTrackRef]);

  return (
    <div className="canvas-root" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{
          position: [CAMERA_START.posX, CAMERA_START.posY, CAMERA_START.posZ],
          fov: CAMERA_START.fov,
          near: 0.1,
          far: 2500,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#020308");
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </div>
  );
}
