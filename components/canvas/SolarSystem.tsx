"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { PLANET_VISUALS, SUN, type PlanetVisual } from "@/lib/planets";

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
  speed,
  phase,
}: {
  planet: PlanetVisual;
  speed: number;
  phase: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const map = useTexture(planet.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * speed + phase;
    groupRef.current.position.x = Math.cos(t) * planet.orbit;
    groupRef.current.position.z = Math.sin(t) * planet.orbit;
    // Slow axial spin
    groupRef.current.rotation.y += 0.004;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[planet.size, 64, 64]} />
        <meshStandardMaterial
          map={map}
          color="#ffffff"
          roughness={0.72}
          metalness={0.05}
          // No self-glow — lit only by the Sun so day/night reads clearly
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>

      {planet.slug === "saturn" ? <SaturnRings size={planet.size} /> : null}
    </group>
  );
}

function SaturnRings({ size }: { size: number }) {
  const ringMap = useTexture("/textures/saturn-ring.png");
  ringMap.colorSpace = THREE.SRGBColorSpace;
  ringMap.anisotropy = 4;
  // Strip texture → radial ring UVs expect a different layout; use alpha from map
  ringMap.wrapS = THREE.ClampToEdgeWrapping;
  ringMap.wrapT = THREE.ClampToEdgeWrapping;

  return (
    <mesh rotation={[Math.PI / 2.35, 0, 0]} receiveShadow>
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

function SunBody() {
  const sunRef = useRef<THREE.Mesh>(null);
  const map = useTexture(SUN.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  useFrame(({ clock }) => {
    if (!sunRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.015;
    sunRef.current.scale.setScalar(pulse);
    sunRef.current.rotation.y += 0.0015;
  });

  return (
    <group>
      {/* Soft corona */}
      <mesh>
        <sphereGeometry args={[SUN.size * 1.55, 32, 32]} />
        <meshBasicMaterial
          color="#ffb347"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN.size, 64, 64]} />
        <meshBasicMaterial map={map} color="#fff2cc" />
      </mesh>

      {/* Primary star light — planets react to this (lit / shadowed hemispheres) */}
      <pointLight color="#fff1d0" intensity={90} distance={90} decay={2} />
      <pointLight color="#ffcc88" intensity={22} distance={45} decay={2} />
    </group>
  );
}

/**
 * Sun + textured planets. Planets use meshStandardMaterial so the Sun's
 * point lights create day/night shading (real-time lighting, not path tracing).
 */
export function SolarSystem() {
  return (
    <group>
      <SunBody />

      {PLANET_VISUALS.map((planet, i) => (
        <group key={planet.slug}>
          <OrbitRing radius={planet.orbit} />
          <PlanetBody
            planet={planet}
            speed={0.06 + (PLANET_VISUALS.length - i) * 0.01}
            phase={i * 0.75}
          />
        </group>
      ))}
    </group>
  );
}
