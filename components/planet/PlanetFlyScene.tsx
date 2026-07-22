"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { BodyContent } from "@/lib/planet-content";
import { useDayNight } from "@/components/providers/DayNightProvider";
import {
  getBodyRadius,
  getPlanetPageCamera,
  readPlanetTransition,
} from "@/lib/planet-transition";

function HeroCamera({
  position,
  fov,
}: {
  position: [number, number, number];
  fov: number;
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookTarget.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - fov) > 0.01) {
        persp.fov = fov;
        persp.updateProjectionMatrix();
      }
    }
  });

  return null;
}

function BodyMesh({ body, radius }: { body: BodyContent; radius: number }) {
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
    <group ref={group} position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
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
        <mesh rotation={[Math.PI / 2, 0.18, 0.1]} raycast={() => null}>
          <ringGeometry args={[radius * 1.28, radius * 2.45, 128]} />
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

/** Fixed hero backdrop — body centered at origin, camera at radius × VIEWING_RATIO. */
export function PlanetFlyScene({ body }: { body: BodyContent }) {
  const { spaceColor, ambientIntensity } = useDayNight();

  const { cameraPosition, cameraFov, meshRadius } = useMemo(() => {
    const saved = readPlanetTransition(body.slug);
    const fallback = getPlanetPageCamera(body.slug);

    if (saved) {
      return {
        cameraPosition: [saved.posX, saved.posY, saved.posZ] as [
          number,
          number,
          number,
        ],
        cameraFov: saved.fov,
        meshRadius: saved.radius,
      };
    }

    return {
      cameraPosition: fallback.position,
      cameraFov: fallback.fov,
      meshRadius: getBodyRadius(body.slug),
    };
  }, [body.slug]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex w-full items-center justify-center">
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.5]}
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(spaceColor)}
      >
        <HeroCamera position={cameraPosition} fov={cameraFov} />
        <color attach="background" args={[spaceColor]} />
        <ambientLight intensity={ambientIntensity + 0.1} />
        <Suspense fallback={null}>
          <BodyMesh body={body} radius={meshRadius} />
        </Suspense>
      </Canvas>
    </div>
  );
}
