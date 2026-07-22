"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { applyCircularPointDiscard } from "@/lib/circle-point-texture";

const STAR_COUNT = 9000;
const ARM_COUNT = 4;
const GALAXY_RADIUS = 220;

/**
 * Milky Way sky dome + spiral star disk.
 * Star points use /textures/particle.png + gl_PointCoord discard so they stay round in production.
 */
export function MilkyWay() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const [skyMap, circleMap] = useTexture([
    "/textures/milky-way.jpg",
    "/textures/particle.png",
  ]);
  skyMap.colorSpace = THREE.SRGBColorSpace;
  skyMap.anisotropy = 8;

  circleMap.colorSpace = THREE.NoColorSpace;
  circleMap.magFilter = THREE.LinearFilter;
  circleMap.minFilter = THREE.LinearFilter;
  circleMap.generateMipmaps = false;
  circleMap.premultiplyAlpha = true;
  circleMap.needsUpdate = true;

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);

    const core = new THREE.Color("#fff1d6");
    const arm = new THREE.Color("#9eb8ff");
    const outer = new THREE.Color("#6a7fd4");
    const dust = new THREE.Color("#ff9b6b");
    const mix = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      const t = i / STAR_COUNT;

      if (t < 0.1) {
        const r = GALAXY_RADIUS * (0.7 + Math.random() * 1.2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
        positions[i3 + 2] = r * Math.cos(phi);
        mix.copy(outer);
      } else {
        const armIndex = i % ARM_COUNT;
        const armOffset = (armIndex / ARM_COUNT) * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.55) * GALAXY_RADIUS;
        const spin = radius * 0.022;
        const angle = armOffset + spin + (Math.random() - 0.5) * 0.32;
        const spread = (Math.random() - 0.5) * (5 + radius * 0.035);

        positions[i3] =
          Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * spread;
        positions[i3 + 1] = (Math.random() - 0.5) * (1.8 + radius * 0.016);
        positions[i3 + 2] =
          Math.sin(angle) * radius + Math.sin(angle + Math.PI / 2) * spread;

        const coreFactor = 1 - Math.min(radius / GALAXY_RADIUS, 1);
        if (Math.random() > 0.85) mix.copy(dust);
        else {
          mix.copy(arm).lerp(core, coreFactor * coreFactor);
          mix.lerp(outer, (1 - coreFactor) * 0.4);
        }
      }

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = mix.r * brightness;
      colors[i3 + 1] = mix.g * brightness;
      colors[i3 + 2] = mix.b * brightness;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    applyCircularPointDiscard(mat);
  }, [circleMap]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.008;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[520, 64, 64]} />
        <meshBasicMaterial
          map={skyMap}
          color="#ffffff"
          opacity={1}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <circleGeometry args={[200, 64]} />
        <meshBasicMaterial
          map={skyMap}
          color="#ffffff"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          fog={false}
          toneMapped={false}
        />
      </mesh>

      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={materialRef}
          map={circleMap}
          alphaMap={circleMap}
          size={1.2}
          sizeAttenuation
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
          fog={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
