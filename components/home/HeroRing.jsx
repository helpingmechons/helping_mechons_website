"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RingFigures, Gear } from "./RingSVG";
import { PHOTO_R, VIEW } from "./ringGeometry";

const PHOTO_PCT = `${(PHOTO_R / VIEW) * 100}%`;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

/**
 * The logo's ring of hands around a real photo from a drive.
 * Desktop: three.js figures assemble, then turn slowly and tilt toward the pointer.
 * Mobile / reduced motion / no WebGL: the SVG version (slow CSS spin, or static).
 */
export default function HeroRing({ src, alt }) {
  const canvasRef = useRef(null);
  // "pending" until we know whether the 3D version will run.
  const [mode, setMode] = useState("pending");
  const three = mode === "three";

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || reduce || !webglAvailable()) { setMode("svg"); return; }
    let cleanup, cancelled = false;
    const fallback = setTimeout(() => setMode((m) => (m === "pending" ? "svg" : m)), 3000);
    import("./RingScene").then(({ createRingScene }) => {
      if (cancelled || !canvasRef.current) return;
      cleanup = createRingScene(canvasRef.current, { onReady: () => setMode("three") });
    }).catch(() => setMode("svg"));
    return () => { cancelled = true; clearTimeout(fallback); cleanup?.(); };
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-[560px] mx-auto select-none">
      <Gear className="absolute inset-0 w-full h-full motion-safe:animate-[spin_60s_linear_infinite_reverse]" />
      <div
        className="absolute rounded-full overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lift ring-4 ring-white"
        style={{ width: PHOTO_PCT, height: PHOTO_PCT }}
      >
        <Image src={src} alt={alt} fill priority sizes="(min-width: 768px) 260px, 50vw" className="object-cover" />
      </div>
      <RingFigures
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 motion-safe:animate-[spin_90s_linear_infinite] ${mode === "svg" ? "opacity-100" : mode === "three" ? "opacity-0" : "opacity-100 md:opacity-0"}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${three ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
