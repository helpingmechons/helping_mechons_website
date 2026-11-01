"use client";
import { motion, useReducedMotion } from "motion/react";

/** Uncovers an image with a clip-path wipe, then settles a slight zoom. */
export default function ImageReveal({ children, className = "", direction = "left", delay = 0 }) {
  const reduce = useReducedMotion();
  const from = {
    left: "inset(0 100% 0 0 round 28px)",
    up:   "inset(100% 0 0 0 round 28px)",
  }[direction];
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ clipPath: from }}
      whileInView={{ clipPath: "inset(0 0% 0 0 round 28px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
