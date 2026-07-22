"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { PLANET_VISUALS, SUN, type PlanetVisual } from "@/lib/planets";
import {
  orbitalSpeedRadPerSec,
  orbitPhase,
} from "@/lib/orbit-physics";
import { useDayNight } from "@/components/providers/DayNightProvider";

export type BodySelectPayload = {
  slug: string;
  name: string;
  size: number;
  position: THREE.Vector3;
};

function OrbitRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color="#9ec9ff"
      transparent
      opacity={0.14}
      lineWidth={1}
    />
  );
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
  const map = useTexture(planet.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current += omega * delta;
    const a = angleRef.current;
    groupRef.current.position.x = Math.cos(a) * planet.orbit;
    groupRef.current.position.z = Math.sin(a) * planet.orbit;
    groupRef.current.rotation.y += delta * (0.15 + omega * 0.35);
  });

  const select = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation();
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

  return (
    <group ref={groupRef}>
      <mesh
        onClick={select}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[planet.size, 64, 64]} />
        <meshStandardMaterial
          map={map}
          color="#ffffff"
          roughness={0.72}
          metalness={0.05}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>

      {/* Larger invisible hit target for easier clicking */}
      <mesh visible={false} onClick={select}>
        <sphereGeometry args={[planet.size * 1.85, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {planet.slug === "saturn" ? <SaturnRings size={planet.size} /> : null}
    </group>
  );
}

function SaturnRings({ size }: { size: number }) {
  const ringMap = useTexture("/textures/saturn-ring.png");
  ringMap.colorSpace = THREE.SRGBColorSpace;
  ringMap.anisotropy = 4;
  ringMap.wrapS = THREE.ClampToEdgeWrapping;
  ringMap.wrapT = THREE.ClampToEdgeWrapping;

  return (
    <mesh rotation={[Math.PI / 2.35, 0, 0]}>
      <ringGeometry args={[size * 1.35, size * 2.35, 96]} />
      <meshStandardMaterial
        map={ringMap}
        alphaMap={ringMap}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.85}
        metalness={0.1}
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

  const select = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onSelect?.({
      slug: "sun",
      name: "The Sun",
      size: SUN.size,
      position: new THREE.Vector3(0, 0, 0),
    });
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
                opacity={0.55 - i * 0.14}
                toneMapped={false}
              />
            </sprite>
          ))}
        </group>
      ) : null}

      <mesh
        ref={sunRef}
        onClick={select}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[SUN.size, 64, 64]} />
        <meshBasicMaterial map={map} color="#fff2cc" toneMapped={false} />
      </mesh>

      <mesh visible={false} onClick={select}>
        <sphereGeometry args={[SUN.size * 1.7, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

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
          <OrbitRing radius={planet.orbit} />
          <PlanetBody planet={planet} onSelect={onSelectBody} />
        </group>
      ))}
    </group>
  );
}
