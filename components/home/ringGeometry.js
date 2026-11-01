// Shared geometry for the "ring of hands" (from the logo), used by both the
// SVG fallback and the three.js scene. Units: ring radius ≈ 1.

// Clockwise from the top, matching the logo.
export const RING_COLORS = [
  "#fbc02d", // yellow
  "#f59e0b", // amber
  "#e53935", // red
  "#9e1b4f", // maroon
  "#d81b60", // magenta
  "#7b1fa2", // violet
  "#283593", // blue
  "#1e88e5", // sky
  "#43a047", // green
  "#7cb342", // lime
];

export const N = RING_COLORS.length;
export const STEP = (Math.PI * 2) / N;
export const R_HEAD = 0.8;
export const R_HEAD_SIZE = 0.078;
export const R_BODY_IN = 0.885;
export const R_BODY_OUT = 1.06;
export const R_ARMS = 0.93;
export const R_FEET = 1.24;
export const LEG_SPLAY = 0.06; // radians each side
export const PHOTO_R = 0.66;
export const VIEW = 1.5; // half-extent of the square view
