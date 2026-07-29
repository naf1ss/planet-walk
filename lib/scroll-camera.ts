/** Shared camera state tweened by GSAP ScrollTrigger, consumed by R3F each frame. */
export type ScrollCameraState = {
  /** 0 = far galaxy view, 1 = deep in solar system */
  progress: number;
  posX: number;
  posY: number;
  posZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
  fov: number;
};

/** Far view: orbiting outside the Milky Way disk */
export const CAMERA_START: Omit<ScrollCameraState, "progress"> = {
  posX: 40,
  posY: 140,
  posZ: 420,
  lookX: 0,
  lookY: 0,
  lookZ: 0,
  fov: 55,
};

/** Close view: inside the core, solar system revealed */
export const CAMERA_END: Omit<ScrollCameraState, "progress"> = {
  posX: 2,
  posY: 9,
  posZ: 40,
  lookX: 0,
  lookY: 0,
  lookZ: 0,
  fov: 40,
};

/** Macro view — solar system appears as a speck within the Milky Way disk */
export const SOLAR_SYSTEM_MACRO_SCALE = 0.02;

/** GSAP-driven uniform scale for the solar-system group (macro → 1 at Explore) */
export const solarSystemScroll = {
  scale: SOLAR_SYSTEM_MACRO_SCALE,
};

export const scrollCamera: ScrollCameraState = {
  progress: 0,
  ...CAMERA_START,
};
