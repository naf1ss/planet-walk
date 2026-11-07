"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { MilkyWay, resetSolarSystemVisibility } from "@/components/canvas/MilkyWay";
import { SoftStars } from "@/components/canvas/SoftStars";
import {
  SolarSystem,
  type BodySelectPayload,
} from "@/components/canvas/SolarSystem";
import { ScrollCamera } from "@/components/canvas/ScrollCamera";
import { PlanetTransitOverlay } from "@/components/landing/PlanetTransitOverlay";
import { useDayNight } from "@/components/providers/DayNightProvider";
import { cn } from "@/lib/utils";
import {
  CAMERA_END,
  CAMERA_START,
  SOLAR_SYSTEM_MACRO_SCALE,
  scrollCamera,
  solarSystemScroll,
} from "@/lib/scroll-camera";
import {
  getDiveEndCamera,
  getTransitionCameraOffset,
  savePlanetTransition,
} from "@/lib/planet-transition";
import type { BodySlug } from "@/lib/planet-content";
import { setHoveredBody } from "@/lib/body-hover";

type SceneCanvasProps = {
  zoomTrackRef: React.RefObject<HTMLElement | null>;
  /** When true, canvas receives clicks (Explore) and forwards wheel to the page */
  interactive?: boolean;
  /** Skip Milky Way intro — mount camera at solar-system end pose */
  startAtSolarSystem?: boolean;
};

function Experience({
  onSelectBody,
  startAtSolarSystem = false,
}: {
  onSelectBody: (payload: BodySelectPayload) => void;
  startAtSolarSystem?: boolean;
}) {
  const { spaceColor, ambientIntensity, isDay } = useDayNight();
  const solarSystemGroupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const root = solarSystemGroupRef.current;
    if (!root) return;
    const scale = startAtSolarSystem ? 1 : SOLAR_SYSTEM_MACRO_SCALE;
    root.scale.setScalar(scale);
    solarSystemScroll.scale = scale;
  }, [startAtSolarSystem]);

  // Safety net: each time the view arrives at the full-size solar system,
  // restore any planet the entrance fade left transparent.
  const arrivedRef = useRef(false);
  useFrame(() => {
    const root = solarSystemGroupRef.current;
    if (!root) return;
    root.scale.setScalar(solarSystemScroll.scale);
    if (solarSystemScroll.scale > 0.97 && !arrivedRef.current) {
      arrivedRef.current = true;
      resetSolarSystemVisibility(root);
    } else if (solarSystemScroll.scale < 0.5) {
      arrivedRef.current = false;
    }
  });

  useLayoutEffect(() => {
    if (!startAtSolarSystem) return;
    const root = solarSystemGroupRef.current;
    if (root) resetSolarSystemVisibility(root);
  }, [startAtSolarSystem]);

  useEffect(() => {
    if (!startAtSolarSystem) return;
    const id = requestAnimationFrame(() => {
      const root = solarSystemGroupRef.current;
      if (root) resetSolarSystemVisibility(root);
    });
    return () => cancelAnimationFrame(id);
  }, [startAtSolarSystem]);

  return (
    <>
      <color attach="background" args={[spaceColor]} />
      <fog
        attach="fog"
        args={[spaceColor, isDay ? 180 : 160, isDay ? 760 : 720]}
      />
      <ambientLight intensity={ambientIntensity} />
      <ScrollCamera />
      <MilkyWay
        solarSystemRef={solarSystemGroupRef}
        playEntrance={!startAtSolarSystem}
      />
      <group ref={solarSystemGroupRef}>
        <SolarSystem onSelectBody={onSelectBody} />
      </group>
      <SoftStars
        radius={480}
        depth={90}
        count={1600}
        factor={isDay ? 1.55 : 2}
        opacity={isDay ? 0.85 : 1}
        saturation={0}
        fade
        speed={0.12}
      />
    </>
  );
}

/**
 * Fixed R3F canvas + polished click→planet dive transition.
 */
export function SceneCanvas({
  zoomTrackRef,
  interactive = false,
  startAtSolarSystem = false,
}: SceneCanvasProps) {
  const { spaceColor } = useDayNight();
  const router = useRouter();
  const scrubRef = useRef<gsap.core.Tween | null>(null);
  const scaleScrubRef = useRef<gsap.core.Tween | null>(null);
  const divingRef = useRef(false);
  const [transitLabel, setTransitLabel] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const track = zoomTrackRef.current;
    if (!track) return;

    Object.assign(
      scrollCamera,
      startAtSolarSystem
        ? { progress: 1, ...CAMERA_END }
        : { progress: 0, ...CAMERA_START },
    );
    solarSystemScroll.scale = startAtSolarSystem ? 1 : SOLAR_SYSTEM_MACRO_SCALE;

    const scrollTriggerConfig = {
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.85,
      invalidateOnRefresh: true,
    };

    const ctx = gsap.context(() => {
      scrubRef.current = gsap.fromTo(
        scrollCamera,
        startAtSolarSystem
          ? { progress: 1, ...CAMERA_END }
          : { progress: 0, ...CAMERA_START },
        {
          progress: 1,
          ...CAMERA_END,
          ease: "none",
          scrollTrigger: scrollTriggerConfig,
        },
      );

      scaleScrubRef.current = gsap.fromTo(
        solarSystemScroll,
        { scale: startAtSolarSystem ? 1 : SOLAR_SYSTEM_MACRO_SCALE },
        {
          scale: 1,
          ease: "power2.inOut",
          scrollTrigger: scrollTriggerConfig,
        },
      );
    }, track);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    const t2 = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);
    window.addEventListener("pageshow", refresh);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
      window.removeEventListener("pageshow", refresh);
      scrubRef.current = null;
      scaleScrubRef.current = null;
      ctx.revert();
      Object.assign(scrollCamera, { progress: 0, ...CAMERA_START });
      solarSystemScroll.scale = SOLAR_SYSTEM_MACRO_SCALE;
    };
  }, [zoomTrackRef, startAtSolarSystem]);

  const onSelectBody = useCallback(
    (payload: BodySelectPayload) => {
      if (divingRef.current) return;
      divingRef.current = true;
      setTransitLabel(payload.name);
      setHoveredBody(null);
      document.body.style.cursor = "auto";

      // Freeze scroll-scrub so it doesn't fight the dive
      scrubRef.current?.scrollTrigger?.disable(false);
      scrubRef.current?.kill();
      scrubRef.current = null;
      scaleScrubRef.current?.scrollTrigger?.disable(false);
      scaleScrubRef.current?.kill();
      scaleScrubRef.current = null;
      solarSystemScroll.scale = 1;

      const { position, size, slug } = payload;
      const bodySlug = slug as BodySlug;
      const radius = size;
      const end = getDiveEndCamera(
        position.x,
        position.y,
        position.z,
        radius,
      );
      const pageOffset = getTransitionCameraOffset(radius);

      gsap.to(scrollCamera, {
        ...end,
        duration: 1.7,
        ease: "power3.inOut",
        onComplete: () => {
          savePlanetTransition({
            slug: bodySlug,
            posX: pageOffset.x,
            posY: pageOffset.y,
            posZ: pageOffset.z,
            fov: end.fov,
            radius,
          });
          router.push(`/planet/${slug}`);
        },
      });
    },
    [router],
  );

  return (
    <>
      <PlanetTransitOverlay
        active={transitLabel !== null}
        label={transitLabel}
      />
      <div
        className={cn("canvas-root", interactive && "canvas-root--interactive")}
        aria-hidden={!interactive}
        onWheel={
          interactive && !divingRef.current
            ? (e) => {
                window.scrollBy(0, e.deltaY);
              }
            : undefined
        }
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{
            position: startAtSolarSystem
              ? [CAMERA_END.posX, CAMERA_END.posY, CAMERA_END.posZ]
              : [CAMERA_START.posX, CAMERA_START.posY, CAMERA_START.posZ],
            fov: startAtSolarSystem ? CAMERA_END.fov : CAMERA_START.fov,
            near: 0.1,
            far: 2500,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(spaceColor);
            const canvas = gl.domElement;
            const onLost = (e: Event) => {
              e.preventDefault();
            };
            const onRestored = () => {
              gl.setClearColor(spaceColor);
              ScrollTrigger.refresh();
            };
            canvas.addEventListener("webglcontextlost", onLost, false);
            canvas.addEventListener("webglcontextrestored", onRestored, false);
          }}
        >
          <Suspense fallback={null}>
            <Experience
              onSelectBody={onSelectBody}
              startAtSolarSystem={startAtSolarSystem}
            />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
