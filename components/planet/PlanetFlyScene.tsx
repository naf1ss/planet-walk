"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { BodyContent } from "@/lib/planet-content";
import { useDayNight } from "@/components/providers/DayNightProvider";

function BodyMesh({ body }: { body: BodyContent }) {
  const group = useRef<THREE.Group>(null);
  const map = useTexture(body.texture);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const isSun = body.slug === "sun";

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={group} position={[0.4, -0.15, 0]}>
      <mesh>
        <sphereGeometry args={[body.size, 64, 64]} />
        {isSun ? (
          <meshBasicMaterial map={map} color="#fff2cc" toneMapped={false} />
        ) : (
          <meshStandardMaterial
            map={map}
            roughness={0.7}
            metalness={0.05}
            color="#ffffff"
          />
        )}
      </mesh>

      {body.slug === "saturn" ? (
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <ringGeometry args={[body.size * 1.35, body.size * 2.2, 64]} />
          <meshStandardMaterial
            color="#e6d5a8"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {isSun ? (
        <pointLight color="#fff1d0" intensity={70} distance={40} decay={2} />
      ) : (
        <pointLight
          position={[5, 2.5, 7]}
          color="#fff1d0"
          intensity={50}
          distance={45}
          decay={2}
        />
      )}
    </group>
  );
}

/** Fixed hero backdrop — planet slowly spins behind the centered title. */
export function PlanetFlyScene({ body }: { body: BodyContent }) {
  const { spaceColor, ambientIntensity } = useDayNight();
  const z = Math.max(4.2, body.size * 3.6);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.4, z], fov: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(spaceColor)}
      >
        <color attach="background" args={[spaceColor]} />
        <ambientLight intensity={ambientIntensity + 0.1} />
        <Suspense fallback={null}>
          <BodyMesh body={body} />
        </Suspense>
      </Canvas>
    </div>
  );
}
