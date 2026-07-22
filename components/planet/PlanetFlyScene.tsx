"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { MilkyWay } from "@/components/canvas/MilkyWay";
import { SoftStars } from "@/components/canvas/SoftStars";
import type { BodyContent } from "@/lib/planet-content";
import { useDayNight } from "@/components/providers/DayNightProvider";
import { CAMERA_END } from "@/lib/scroll-camera";
import {
  getBodyRadius,
  getPlanetPageCamera,
  getPlanetZoomOutTargetZ,
  readPlanetTransition,
} from "@/lib/planet-transition";

type CameraAnim = {
  x: number;
  y: number;
  z: number;
  fov: number;
};

function HeroCamera({ anim }: { anim: React.RefObject<CameraAnim> }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const state = anim.current;
    if (!state) return;
    camera.position.set(state.x, state.y, state.z);
    camera.lookAt(lookTarget.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - state.fov) > 0.01) {
        persp.fov = state.fov;
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

type PlanetFlySceneProps = {
  body: BodyContent;
  exiting?: boolean;
  onExitComplete?: () => void;
};

/** Fixed hero backdrop — body centered at origin, camera at radius × VIEWING_RATIO. */
export function PlanetFlyScene({
  body,
  exiting = false,
  onExitComplete,
}: PlanetFlySceneProps) {
  const { spaceColor, ambientIntensity, isDay } = useDayNight();

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

  const cameraAnim = useRef<CameraAnim>({
    x: cameraPosition[0],
    y: cameraPosition[1],
    z: cameraPosition[2],
    fov: cameraFov,
  });

  useEffect(() => {
    if (!exiting) return;

    const targetZ = getPlanetZoomOutTargetZ(cameraAnim.current.z, meshRadius);

    gsap.to(cameraAnim.current, {
      z: targetZ,
      y: cameraAnim.current.y * 1.6,
      fov: CAMERA_END.fov,
      duration: 1.65,
      ease: "power3.inOut",
      onComplete: () => onExitComplete?.(),
    });
  }, [exiting, meshRadius, onExitComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex w-full items-center justify-center">
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.5]}
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.1,
          far: 2500,
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(spaceColor)}
      >
        <HeroCamera anim={cameraAnim} />
        <color attach="background" args={[spaceColor]} />
        <fog
          attach="fog"
          args={[spaceColor, isDay ? 180 : 160, isDay ? 760 : 720]}
        />
        <ambientLight intensity={ambientIntensity + 0.1} />
        <Suspense fallback={null}>
          <MilkyWay playEntrance={false} />
          <SoftStars
            radius={480}
            depth={90}
            count={isDay ? 1400 : 1800}
            factor={isDay ? 1.6 : 2}
            saturation={0}
            fade
            speed={0.12}
          />
        </Suspense>
        <Suspense fallback={null}>
          <BodyMesh body={body} radius={meshRadius} />
        </Suspense>
      </Canvas>
    </div>
  );
}
