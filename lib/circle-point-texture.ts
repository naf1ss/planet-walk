"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Soft circular sprite so Points render as discs, not squares.
 * Generated in-memory (no public URL) so production never depends on a missing PNG.
 */
export function createCirclePointTexture() {
  if (typeof document === "undefined") return null;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(0.7, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.premultiplyAlpha = true;
  tex.needsUpdate = true;
  return tex;
}

/** Soft circular sprite used so Points render as discs, not squares. */
export function useCirclePointTexture() {
  return useMemo(() => createCirclePointTexture(), []);
}

/**
 * Force round points via gl_PointCoord even if the sprite map fails to bind
 * (common cause of harsh squares in some production WebGL paths).
 */
export function applyCircularPointDiscard(material: THREE.PointsMaterial) {
  if (material.userData.circularDiscardApplied) return;

  material.transparent = true;
  material.depthWrite = false;
  material.alphaTest = 0.01;
  material.userData.circularDiscardApplied = true;

  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    prev?.(shader, renderer);
    if (shader.fragmentShader.includes("gl_PointCoord soft-disc")) return;
    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      /* glsl */ `
      vec4 diffuseColor = vec4( diffuse, opacity );
      // gl_PointCoord soft-disc
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r = length(cxy);
      if (r > 1.0) discard;
      diffuseColor.a *= (1.0 - smoothstep(0.35, 1.0, r));
      `,
    );
  };
  material.needsUpdate = true;
}
