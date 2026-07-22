"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollCamera } from "@/lib/scroll-camera";

/**
 * Applies GSAP-driven scrollCamera state to the real Three.js camera each frame.
 */
export function ScrollCamera() {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    camera.position.set(
      scrollCamera.posX,
      scrollCamera.posY,
      scrollCamera.posZ,
    );
    lookTarget.current.set(
      scrollCamera.lookX,
      scrollCamera.lookY,
      scrollCamera.lookZ,
    );
    camera.lookAt(lookTarget.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - scrollCamera.fov) > 0.01) {
        persp.fov = scrollCamera.fov;
        persp.updateProjectionMatrix();
      }
    }
  });

  return null;
}
