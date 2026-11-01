"use client";
import { useState } from "react";
import { motion } from "motion/react";

/**
 * Wraps a card or link so any <AnimatedIcon> inside plays its motion when the
 * WHOLE element is hovered, focused (keyboard), or tapped (touch).
 */
export default function HoverGroup({ as = "div", className = "", children, ...rest }) {
  const Tag = motion[as] ?? motion.div;
  const [focus, setFocus] = useState(false);
  return (
    <Tag
      className={className}
      initial="off"
      animate={focus ? "on" : "off"}
      whileHover="on"
      whileTap="on"
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
