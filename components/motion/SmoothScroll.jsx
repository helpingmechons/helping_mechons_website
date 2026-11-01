"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis smooth scrolling for desktop pointer users.
 * Skipped for touch devices (native momentum is better there), for
 * prefers-reduced-motion, and for /admin where dense tables need native scroll.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const enabled = !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let lenis, raf;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
      window.__lenis = lenis;
      const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, [enabled]);

  // New page: start at the top without a smooth scroll back up.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
