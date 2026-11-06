"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { AtmosphereGlow } from "@/components/canvas/AtmosphereGlow";
import { PLANET_VISUALS, SUN, type PlanetVisual } from "@/lib/planets";
import type { PlanetSlug } from "@/lib/constants";
import {
  orbitalSpeedRadPerSec,
  orbitPhase,
} from "@/lib/orbit-physics";
import { useDayNight } from "@/components/providers/DayNightProvider";
import { WALK_STOPS, WALK_TOTAL_FT, formatWalkDistance } from "@/lib/planetData";
import {
  registerBodySelect,
  setHoveredBody,
  useHoveredBody,
} from "@/lib/body-hover";

export type BodySelectPayload = {
  slug: string;
  name: string;
  size: number;
  position: THREE.Vector3;
};

const ORBIT_SEGMENTS = 512;
const ORBIT_OPACITY = 0.17;

const ORBIT_HOVER_OPACITY = 0.65;

function OrbitRing({
  radius,
  slug,
  emphasized = false,
}: {
  radius: number;
  slug: PlanetSlug;
  emphasized?: boolean;
}) {
  const lineRef = useRef<{ material: THREE.Material & { opacity: number; color: THREE.Color } } | null>(null);
  const active = useHoveredBody() === slug;
  const baseOpacity = emphasized ? 0.38 : ORBIT_OPACITY;
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const a = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);

  // Ease the ring's opacity toward bright while its planet is hovered
  useFrame((_, delta) => {
    const m = lineRef.current?.material;
    if (!m) return;
    const target = active ? ORBIT_HOVER_OPACITY : baseOpacity;
    m.opacity += (target - m.opacity) * (1 - Math.exp(-delta * 8));
  });

  return (
    <Line
      // drei's Line2 type isn't exported cleanly; we only touch .material
      ref={lineRef as never}
      points={points}
      color={emphasized ? "#c4b5a0" : "#8eb4d8"}
      transparent
      opacity={baseOpacity}
      depthWrite={false}
      lineWidth={active ? 1.6 : 1}
    />
  );
}

/** Name + walk distance, floating just above a hovered body. */
function BodyLabel({
  name,
  detail,
  height,
  visible,
}: {
  name: string;
  detail: string;
  height: number;
  visible: boolean;
}) {
  return (
    <Html
      position={[0, height, 0]}
      center
      zIndexRange={[30, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div className={`planet-label${visible ? " is-visible" : ""}`}>
        <span className="planet-label__name">{name}</span>
        <span className="planet-label__detail">{detail}</span>
      </div>
    </Html>
  );
}

function walkDetail(slug: string) {
  if (slug === "sun") {
    return `Start · ${formatWalkDistance(WALK_TOTAL_FT).feetLabel} to Pluto`;
  }
  const stop = WALK_STOPS.find((s) => s.slug === slug);
  return stop ? `${formatWalkDistance(stop.walkFt).feetLabel} from the Sun` : "";
}

/** Small / distant bodies — enlarged invisible hit target for raycasting */
const SMALL_HITBOX_SLUGS = new Set<PlanetSlug>(["ceres", "uranus", "neptune", "pluto"]);
const SMALL_MIN_HIT_RADIUS = 0.55;

function hitRadius(slug: PlanetSlug | "sun", visualSize: number) {
  if (slug === "sun") return visualSize * 1.05;
  if (SMALL_HITBOX_SLUGS.has(slug)) {
    return Math.max(visualSize * 2.0, SMALL_MIN_HIT_RADIUS);
  }
  return visualSize * 1.05;
}

function PlanetBody({
  planet,
  onSelect,
}: {
  planet: PlanetVisual;
  onSelect?: (payload: BodySelectPayload) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(orbitPhase(planet.slug));
  const omega = orbitalSpeedRadPerSec(planet.periodDays);
  const hovered = useHoveredBody() === planet.slug;
  const map = useTexture(planet.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current -= omega * delta;
    const a = angleRef.current;
    groupRef.current.position.x = Math.cos(a) * planet.orbit;
    groupRef.current.position.z = Math.sin(a) * planet.orbit;
    groupRef.current.rotation.y += delta * (0.15 + omega * 0.35);
  });

  const startDive = () => {
    if (!groupRef.current || !onSelect) return;
    const position = new THREE.Vector3();
    groupRef.current.getWorldPosition(position);
    onSelect({
      slug: planet.slug,
      name: planet.name,
      size: planet.size,
      position,
    });
  };
  const startDiveRef = useRef(startDive);
  startDiveRef.current = startDive;

  useEffect(
    () => registerBodySelect(planet.slug, () => startDiveRef.current()),
    [planet.slug],
  );

  const select = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    startDive();
  };

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredBody(planet.slug);
    document.body.style.cursor = "pointer";
  };

  const onPointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredBody(null);
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={groupRef}>
      <group>
        <mesh>
          <sphereGeometry args={[planet.size, 64, 64]} />
          <meshStandardMaterial
            map={map}
            color="#ffffff"
            roughness={0.72}
            metalness={0.05}
          />
        </mesh>

        <AtmosphereGlow
          radius={planet.size}
          glowColor={planet.color}
          targetIntensity={hovered ? 1 : 0}
        />

        <mesh
          visible={false}
          onClick={select}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <sphereGeometry args={[hitRadius(planet.slug, planet.size), 16, 16]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {planet.slug === "saturn" ? <SaturnRings size={planet.size} /> : null}

      <BodyLabel
        name={planet.name}
        detail={walkDetail(planet.slug)}
        height={planet.size + 0.55}
        visible={hovered}
      />
    </group>
  );
}

function SaturnRings({ size }: { size: number }) {
  const ringMap = useTexture("/textures/saturn-ring-alpha.png");
  ringMap.colorSpace = THREE.SRGBColorSpace;
  ringMap.anisotropy = 8;
  ringMap.wrapS = THREE.ClampToEdgeWrapping;
  ringMap.wrapT = THREE.ClampToEdgeWrapping;

  return (
    <mesh
      rotation={[Math.PI / 2, 0.18, 0.1]}
      renderOrder={2}
      raycast={() => null}
    >
      <ringGeometry args={[size * 1.28, size * 2.45, 128]} />
      <meshStandardMaterial
        map={ringMap}
        alphaMap={ringMap}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.88}
        metalness={0.04}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Soft radial glow sprite (additive) — no solid orange disc */
function useSunGlowTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(255, 252, 240, 1)");
    g.addColorStop(0.12, "rgba(255, 230, 160, 0.85)");
    g.addColorStop(0.28, "rgba(255, 180, 70, 0.35)");
    g.addColorStop(0.5, "rgba(255, 120, 30, 0.12)");
    g.addColorStop(0.75, "rgba(255, 80, 10, 0.03)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function SunBody({
  onSelect,
}: {
  onSelect?: (payload: BodySelectPayload) => void;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Group>(null);
  const hovered = useHoveredBody() === "sun";
  const map = useTexture(SUN.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const glowMap = useSunGlowTexture();
  const { sunLightBoost } = useDayNight();

  useFrame(({ clock }) => {
    if (!sunRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.012;
    sunRef.current.scale.setScalar(pulse);
    sunRef.current.rotation.y += 0.0015;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.9) * 0.02);
    }
  });

  const startDive = () => {
    onSelect?.({
      slug: "sun",
      name: "The Sun",
      size: SUN.size,
      position: new THREE.Vector3(0, 0, 0),
    });
  };
  const startDiveRef = useRef(startDive);
  startDiveRef.current = startDive;

  useEffect(() => registerBodySelect("sun", () => startDiveRef.current()), []);

  const select = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    startDive();
  };

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredBody("sun");
    document.body.style.cursor = "pointer";
  };

  const onPointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredBody(null);
    document.body.style.cursor = "auto";
  };

  return (
    <group>
      {glowMap ? (
        <group ref={glowRef}>
          {[4.2, 6.5, 9.5].map((scale, i) => (
            <sprite key={scale} scale={[SUN.size * scale, SUN.size * scale, 1]}>
              <spriteMaterial
                map={glowMap}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.32 - i * 0.08}
                toneMapped={false}
              />
            </sprite>
          ))}
        </group>
      ) : null}

      <group>
        <mesh ref={sunRef}>
          <sphereGeometry args={[SUN.size, 64, 64]} />
          <meshBasicMaterial map={map} color="#fff2cc" toneMapped={false} />
        </mesh>

        <AtmosphereGlow
          radius={SUN.size}
          glowColor={SUN.color}
          targetIntensity={hovered ? 1 : 0}
        />
      </group>

      <mesh
        visible={false}
        onClick={select}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[hitRadius("sun", SUN.size), 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      <BodyLabel
        name="The Sun"
        detail={walkDetail("sun")}
        height={SUN.size + 0.75}
        visible={hovered}
      />

      <pointLight
        color="#fff1d0"
        intensity={90 * sunLightBoost}
        distance={90}
        decay={2}
      />
      <pointLight
        color="#ffcc88"
        intensity={22 * sunLightBoost}
        distance={45}
        decay={2}
      />
    </group>
  );
}

/**
 * Sun (Planetarium) + planets on relative real-time orbits (sped up).
 */
export function SolarSystem({
  onSelectBody,
}: {
  onSelectBody?: (payload: BodySelectPayload) => void;
}) {
  return (
    <group>
      <SunBody onSelect={onSelectBody} />

      {PLANET_VISUALS.map((planet) => (
        <group key={planet.slug}>
          <OrbitRing
            radius={planet.orbit}
            slug={planet.slug}
            emphasized={planet.slug === "ceres"}
          />
          <PlanetBody planet={planet} onSelect={onSelectBody} />
        </group>
      ))}
    </group>
  );
}
