"use client";

import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const AtmosphereGlowMaterial = shaderMaterial(
  {
    glowColor: new THREE.Color("#ffffff"),
    intensity: 0,
    fresnelPower: 2.8,
  },
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform vec3 glowColor;
    uniform float intensity;
    uniform float fresnelPower;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float facing = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
      float fresnel = pow(1.0 - facing, fresnelPower);
      float alpha = fresnel * intensity;
      gl_FragColor = vec4(glowColor * fresnel, alpha);
    }
  `,
);

extend({ AtmosphereGlowMaterial });

type AtmosphereGlowMaterialImpl = THREE.ShaderMaterial & {
  glowColor: THREE.Color;
  intensity: number;
  fresnelPower: number;
};

declare module "@react-three/fiber" {
  interface ThreeElements {
    atmosphereGlowMaterial: React.ComponentProps<"shaderMaterial"> & {
      ref?: React.Ref<AtmosphereGlowMaterialImpl>;
      glowColor?: THREE.Color | string;
      intensity?: number;
      fresnelPower?: number;
    };
  }
}

type AtmosphereGlowProps = {
  /** Visual planet radius — outer shell is rendered at radius × 1.05 */
  radius: number;
  /** Hex or CSS color matching the body */
  glowColor: string;
  /** Target intensity: 0 = off, 1 = full rim glow */
  targetIntensity: number;
};

/**
 * Fresnel atmospheric rim — transparent center, colored edge glow.
 * Intensity lerps smoothly via useFrame when targetIntensity changes.
 */
export function AtmosphereGlow({
  radius,
  glowColor,
  targetIntensity,
}: AtmosphereGlowProps) {
  const materialRef = useRef<AtmosphereGlowMaterialImpl>(null);
  const currentIntensity = useRef(0);

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    currentIntensity.current = THREE.MathUtils.lerp(
      currentIntensity.current,
      targetIntensity,
      Math.min(1, delta * 7),
    );
    mat.intensity = currentIntensity.current;
    mat.glowColor.set(glowColor);
  });

  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[radius * 1.05, 64, 64]} />
      <atmosphereGlowMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
