"use client";
import { motion, useReducedMotion } from "motion/react";

/**
 * Headline whose words stretch from condensed to normal width as they arrive.
 * Uses Anek's variable width axis — the one orchestrated moment on page load.
 */
export default function HeroHeadline({ lines, className = "" }) {
  const reduce = useReducedMotion();
  let wordIndex = 0;
  return (
    <h1 className={className} aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((word) => {
            const i = wordIndex++;
            return (
              <motion.span
                key={i}
                className="inline-block mr-[0.22em] will-change-transform"
                initial={reduce ? false : { opacity: 0, y: "0.35em", fontVariationSettings: '"wdth" 75' }}
                animate={{ opacity: 1, y: 0, fontVariationSettings: '"wdth" 92' }}
                transition={{ duration: 1, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/** Fades a block in after the headline has landed. */
export function HeroFade({ children, delay = 0.6, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
