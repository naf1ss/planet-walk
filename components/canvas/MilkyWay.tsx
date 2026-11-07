"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import {
  applyCircularPointDiscard,
  applyPerParticleScale,
  useCirclePointTexture,
} from "@/lib/circle-point-texture";

const STAR_COUNT = 9000;
const ARM_COUNT = 4;
const GALAXY_RADIUS = 220;
/** Fully random 360° scatter well beyond the frustum. */
const CHAOS_RADIUS_MIN = 700;
const CHAOS_RADIUS_RANGE = 1100;
const STAGE1_DURATION = 1.5;
const STAGE2_DURATION = 2.5;
const SOLAR_FADE_AT = 3.0;
const SOLAR_FADE_DURATION = 1.0;
const ROTATION_BASE = 0.008;
const ROTATION_PEAK = 0.04;

type MilkyWayProps = {
  /** Group wrapping the solar system — faded in when the convoy is nearly coiled. */
  solarSystemRef?: React.RefObject<THREE.Group | null>;
  /** When false (e.g. return-from-planet), skip entrance and settle immediately. */
  playEntrance?: boolean;
};

function setGroupOpacity(root: THREE.Object3D, opacity: number, init = false) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat || !("opacity" in mat)) continue;
      const m = mat as THREE.Material & { opacity: number; transparent: boolean };
      if (init || m.userData._entranceBaseOpacity === undefined) {
        m.userData._entranceBaseOpacity = m.opacity;
        m.userData._entranceWasTransparent = m.transparent;
      }
      m.transparent = true;
      m.opacity = (m.userData._entranceBaseOpacity as number) * opacity;
      m.needsUpdate = true;
    }
  });
}

/** Restore materials faded by the Milky Way entrance — does not touch hit proxies or layout. */
export function resetSolarSystemVisibility(root: THREE.Object3D) {
  root.visible = true;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!mat || !("opacity" in mat)) continue;
      const m = mat as THREE.Material & {
        opacity: number;
        transparent?: boolean;
        map?: THREE.Texture | null;
      };

      const base = m.userData._entranceBaseOpacity as number | undefined;
      if (base !== undefined) {
        m.opacity = base;
        const wasTransparent = m.userData._entranceWasTransparent as
          | boolean
          | undefined;
        m.transparent = wasTransparent ?? base < 1;
        delete m.userData._entranceBaseOpacity;
        delete m.userData._entranceWasTransparent;
        m.needsUpdate = true;
        continue;
      }

      // Textured body stuck at 0 after interrupted fade — skip invisible hit proxies.
      if (m.map && m.opacity < 0.01) {
        m.opacity = 1;
        m.transparent = false;
        m.needsUpdate = true;
      }
    }
  });
}

/**
 * Milky Way sky dome + spiral star disk.
 * Sharp points + preceding chaos→lane→spiral entrance; spiral math & rotation preserved.
 */
export function MilkyWay({
  solarSystemRef,
  playEntrance = true,
}: MilkyWayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const rotationMulRef = useRef(1);
  const skyMap = useTexture("/textures/milky-way.jpg");
  // Generated disc — avoids intermittent square/missing stars when particle.png
  // fails to bind or Suspense remounts mid-entrance.
  const circleMap = useCirclePointTexture();
  skyMap.colorSpace = THREE.SRGBColorSpace;
  skyMap.anisotropy = 8;

  const { geometry, startPositions, targetPositions } = useMemo(() => {
    const targetPositions = new Float32Array(STAR_COUNT * 3);
    const lanePositions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const armOffsetArr = new Float32Array(STAR_COUNT);
    const finalRadiusArr = new Float32Array(STAR_COUNT);
    const spinNoiseArr = new Float32Array(STAR_COUNT);
    const spreadAmtArr = new Float32Array(STAR_COUNT);
    const finalYArr = new Float32Array(STAR_COUNT);
    const isHaloArr = new Uint8Array(STAR_COUNT);
    const stage1Delay = new Float32Array(STAR_COUNT);
    const stage2Delay = new Float32Array(STAR_COUNT);

    const core = new THREE.Color("#fff1d6");
    const arm = new THREE.Color("#9eb8ff");
    const outer = new THREE.Color("#6a7fd4");
    const dust = new THREE.Color("#ff9b6b");
    const violet = new THREE.Color("#5b21b6");
    const magenta = new THREE.Color("#d946ef");
    const electric = new THREE.Color("#a855f7");
    const mix = new THREE.Color();
    const purpleMix = new THREE.Color();

    // ——— Existing spiral / halo coordinate math (unchanged) ———
    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      const t = i / STAR_COUNT;

      if (t < 0.1) {
        const r = GALAXY_RADIUS * (0.7 + Math.random() * 1.2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
        targetPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
        targetPositions[i3 + 2] = r * Math.cos(phi);
        // Halo: retain cool blue outer, lightly tinted with violet
        mix.copy(outer).lerp(violet, 0.12 + Math.random() * 0.18);

        isHaloArr[i] = 1;
        armOffsetArr[i] = theta;
        finalRadiusArr[i] = r;
        spinNoiseArr[i] = 0;
        spreadAmtArr[i] = 0;
        finalYArr[i] = targetPositions[i3 + 1];
      } else {
        const armIndex = i % ARM_COUNT;
        const offset = (armIndex / ARM_COUNT) * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.55) * GALAXY_RADIUS;
        const spin = radius * 0.022;
        const noise = (Math.random() - 0.5) * 0.32;
        const angle = offset + spin + noise;
        const spread = (Math.random() - 0.5) * (5 + radius * 0.035);

        targetPositions[i3] =
          Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * spread;
        targetPositions[i3 + 1] = (Math.random() - 0.5) * (1.8 + radius * 0.016);
        targetPositions[i3 + 2] =
          Math.sin(angle) * radius + Math.sin(angle + Math.PI / 2) * spread;

        const coreFactor = 1 - Math.min(radius / GALAXY_RADIUS, 1);
        // Mid-arm density peaks — stronger purple nebula glow there
        const radialNorm = Math.min(radius / GALAXY_RADIUS, 1);
        const armDensity = Math.pow(Math.sin(radialNorm * Math.PI), 1.35);
        const colorRoll = Math.random();

        if (colorRoll > 0.88) {
          // Retain original warm orange dust
          mix.copy(dust);
          mix.lerp(magenta, 0.08 + Math.random() * 0.12);
        } else if (colorRoll > 0.7 && armDensity > 0.35) {
          // Distinct purple nebula pockets in denser arm bands
          purpleMix.copy(violet).lerp(electric, Math.random());
          purpleMix.lerp(magenta, Math.random() * 0.5);
          mix.copy(arm).lerp(purpleMix, 0.55 + armDensity * 0.35);
          mix.lerp(dust, 0.06);
        } else {
          // Original blue↔core↔outer mapping, with purple bias in dense arms
          mix.copy(arm).lerp(core, coreFactor * coreFactor);
          mix.lerp(outer, (1 - coreFactor) * 0.4);
          const purpleBias = armDensity * (0.22 + Math.random() * 0.38);
          mix.lerp(electric, purpleBias * 0.55);
          mix.lerp(violet, purpleBias * 0.4);
          if (Math.random() > 0.82) mix.lerp(magenta, 0.18);
        }

        isHaloArr[i] = 0;
        armOffsetArr[i] = offset;
        finalRadiusArr[i] = radius;
        spinNoiseArr[i] = noise;
        spreadAmtArr[i] = spread;
        finalYArr[i] = targetPositions[i3 + 1];
      }

      // Lane gathering point = outer tip of this particle's spiral arm (rivers of light).
      const rLane = GALAXY_RADIUS;
      if (isHaloArr[i]) {
        const theta = armOffsetArr[i];
        lanePositions[i3] = Math.cos(theta) * rLane;
        lanePositions[i3 + 1] = finalYArr[i] * 0.2;
        lanePositions[i3 + 2] = Math.sin(theta) * rLane;
      } else {
        const angle = armOffsetArr[i] + rLane * 0.022 + spinNoiseArr[i];
        const spr = spreadAmtArr[i];
        lanePositions[i3] =
          Math.cos(angle) * rLane + Math.cos(angle + Math.PI / 2) * spr;
        lanePositions[i3 + 1] = finalYArr[i] * 0.15;
        lanePositions[i3 + 2] =
          Math.sin(angle) * rLane + Math.sin(angle + Math.PI / 2) * spr;
      }

      // Tiny random stagger only — start state itself stays unordered.
      stage1Delay[i] = Math.random() * 0.35;
      stage2Delay[i] =
        (isHaloArr[i] ? 0.2 : (i % ARM_COUNT) * 0.06) +
        (finalRadiusArr[i] / GALAXY_RADIUS) * 0.25 +
        Math.random() * 0.08;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = mix.r * brightness;
      colors[i3 + 1] = mix.g * brightness;
      colors[i3 + 2] = mix.b * brightness;
    }

    // Chaotic 360° start — fully random, no lanes / edges / order.
    const startPositions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      const r = CHAOS_RADIUS_MIN + Math.random() * CHAOS_RADIUS_RANGE;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      startPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      startPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      startPositions[i3 + 2] = r * Math.cos(phi);
    }

    const livePositions = new Float32Array(startPositions);
    const scales = new Float32Array(STAR_COUNT);
    scales.fill(1);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(livePositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aParticleScale", new THREE.BufferAttribute(scales, 1));

    return {
      geometry: geo,
      startPositions,
      lanePositions,
      targetPositions,
      armOffset: armOffsetArr,
      finalRadius: finalRadiusArr,
      spinNoise: spinNoiseArr,
      spreadAmt: spreadAmtArr,
      finalY: finalYArr,
      isHalo: isHaloArr,
      stage1Delay,
      stage2Delay,
    };
  }, []);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat || !circleMap) return;
    mat.map = circleMap;
    mat.alphaMap = circleMap;
    applyCircularPointDiscard(mat);
    applyPerParticleScale(mat);
    mat.needsUpdate = true;
  }, [circleMap]);

  // Orbital decay: polar (r, theta, y) → Cartesian; spirals inward to final seats.
  useLayoutEffect(() => {
    const positionAttr = geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const scaleAttr = geometry.getAttribute(
      "aParticleScale",
    ) as THREE.BufferAttribute;
    const live = positionAttr.array as Float32Array;
    const scales = scaleAttr.array as Float32Array;

    const startR = new Float32Array(STAR_COUNT);
    const startTheta = new Float32Array(STAR_COUNT);
    const startY = new Float32Array(STAR_COUNT);
    const endR = new Float32Array(STAR_COUNT);
    const endTheta = new Float32Array(STAR_COUNT);
    const endY = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      startR[i] = Math.hypot(startPositions[i3], startPositions[i3 + 2]);
      startTheta[i] = Math.atan2(startPositions[i3 + 2], startPositions[i3]);
      startY[i] = startPositions[i3 + 1];
      endR[i] = Math.hypot(targetPositions[i3], targetPositions[i3 + 2]);
      endTheta[i] = Math.atan2(targetPositions[i3 + 2], targetPositions[i3]);
      endY[i] = targetPositions[i3 + 1];
    }

    const settleFinal = () => {
      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        live[i3] = targetPositions[i3];
        live[i3 + 1] = targetPositions[i3 + 1];
        live[i3 + 2] = targetPositions[i3 + 2];
        scales[i] = 1;
      }
      positionAttr.needsUpdate = true;
      scaleAttr.needsUpdate = true;
    };

    const applyOrbitalDecay = (t: number) => {
      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        // Radius collapses; angle completes multiple orbits into final spiral theta.
        const r = THREE.MathUtils.lerp(startR[i], endR[i], t);
        const theta = THREE.MathUtils.lerp(
          startTheta[i],
          endTheta[i] + Math.PI * 8,
          t,
        );
        const y = THREE.MathUtils.lerp(startY[i], endY[i], t);

        live[i3] = Math.cos(theta) * r;
        live[i3 + 1] = y;
        live[i3 + 2] = Math.sin(theta) * r;
        scales[i] = THREE.MathUtils.lerp(3.2, 1, t);
      }
      positionAttr.needsUpdate = true;
      scaleAttr.needsUpdate = true;
    };

    // Mount as chaotic scatter (preceding state).
    for (let i = 0; i < STAR_COUNT * 3; i++) live[i] = startPositions[i];
    scales.fill(3.2);
    positionAttr.needsUpdate = true;
    scaleAttr.needsUpdate = true;

    if (!playEntrance) {
      settleFinal();
      rotationMulRef.current = 1;
      const root = solarSystemRef?.current;
      if (root) resetSolarSystemVisibility(root);
      return;
    }

    // Always read .current — the group may attach a frame after this effect.
    const solarRootNow = solarSystemRef?.current;
    if (solarRootNow) setGroupOpacity(solarRootNow, 0, true);
    rotationMulRef.current = ROTATION_PEAK / ROTATION_BASE;

    const anim = { progress: 0 };
    const solar = { opacity: 0 };
    const spin = { mul: ROTATION_PEAK / ROTATION_BASE };
    const tl = gsap.timeline();

    // Electron-like orbital decay into the final spiral seats.
    tl.to(
      anim,
      {
        progress: 1,
        duration: STAGE1_DURATION + STAGE2_DURATION,
        ease: "power3.out",
        onUpdate: () => applyOrbitalDecay(anim.progress),
        onComplete: settleFinal,
      },
      0,
    );

    // Fast entrance spin → regular revolution once coiled
    tl.to(
      spin,
      {
        mul: 1,
        duration: STAGE1_DURATION + STAGE2_DURATION,
        ease: "expo.out",
        onUpdate: () => {
          rotationMulRef.current = spin.mul;
        },
      },
      0,
    );

    // 3s — existing central solar system fade-in (1s)
    tl.to(
      solar,
      {
        opacity: 1,
        duration: SOLAR_FADE_DURATION,
        ease: "power2.out",
        onUpdate: () => {
          const root = solarSystemRef?.current;
          if (root) setGroupOpacity(root, solar.opacity);
        },
        onStart: () => {
          const root = solarSystemRef?.current;
          if (root) setGroupOpacity(root, 0, true);
        },
        onComplete: () => {
          const root = solarSystemRef?.current;
          if (root) resetSolarSystemVisibility(root);
        },
      },
      SOLAR_FADE_AT,
    );

    return () => {
      tl.kill();
      rotationMulRef.current = 1;
    };
  }, [
    geometry,
    playEntrance,
    solarSystemRef,
    startPositions,
    targetPositions,
  ]);

  // Return-from-planet: solar ref may attach after MilkyWay layout — retry reset.
  useEffect(() => {
    if (playEntrance) return;
    const root = solarSystemRef?.current;
    if (root) resetSolarSystemVisibility(root);
  }, [playEntrance, solarSystemRef]);

  // Continuous galaxy rotation — always active (base speed × entrance mul).
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y +=
      delta * ROTATION_BASE * rotationMulRef.current;
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

      {circleMap ? (
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
      ) : null}
    </group>
  );
}
