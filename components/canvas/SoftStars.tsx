"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { applyCircularPointDiscard } from "@/lib/circle-point-texture";

type SoftStarsProps = {
  radius?: number;
  depth?: number;
  count?: number;
  factor?: number;
  saturation?: number;
  fade?: boolean;
  speed?: number;
};

/**
 * Drop-in replacement for drei <Stars> that draws soft round points.
 * Uses /textures/particle.png + gl_PointCoord discard (no square GL_POINTS).
 */
export function SoftStars({
  radius = 100,
  depth = 50,
  count = 5000,
  factor = 4,
  saturation = 0,
  fade = false,
  speed = 1,
}: SoftStarsProps) {
  const groupRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const circleMap = useTexture("/textures/particle.png");

  useMemo(() => {
    circleMap.colorSpace = THREE.NoColorSpace;
    circleMap.magFilter = THREE.LinearFilter;
    circleMap.minFilter = THREE.LinearFilter;
    circleMap.generateMipmaps = false;
    circleMap.premultiplyAlpha = true;
    circleMap.needsUpdate = true;
  }, [circleMap]);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    const r = radius + depth;
    const half = depth * 0.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = THREE.MathUtils.randFloatSpread(r);
      positions[i3 + 1] = THREE.MathUtils.randFloatSpread(r);
      positions[i3 + 2] = THREE.MathUtils.randFloatSpread(r);

      const z = Math.abs(positions[i3 + 2]);
      const fadeFactor = fade
        ? 1 - THREE.MathUtils.clamp((z - half) / depth, 0, 1)
        : 1;
      color.setHSL(0, saturation, (0.55 + Math.random() * 0.35) * fadeFactor);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count, depth, fade, radius, saturation]);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    applyCircularPointDiscard(mat);
  }, [circleMap]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * speed * 0.02;
  });

  return (
    <points ref={groupRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        map={circleMap}
        alphaMap={circleMap}
        size={factor}
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
  );
}
