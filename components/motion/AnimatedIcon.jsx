"use client";
import { motion } from "motion/react";
import {
  Heart, Utensils, Stethoscope, ShoppingBasket, BookOpen, Home, HandHeart,
  ArrowRight, ArrowUpRight, HandCoins, Users, Package, ShieldCheck, Camera, ReceiptText, Truck,
} from "lucide-react";

const ICONS = {
  heart: Heart, utensils: Utensils, stethoscope: Stethoscope, basket: ShoppingBasket,
  book: BookOpen, home: Home, hand: HandHeart, arrow: ArrowRight, "arrow-up-right": ArrowUpRight,
  coins: HandCoins, users: Users, package: Package, shield: ShieldCheck, camera: Camera,
  receipt: ReceiptText, truck: Truck,
};

// Each icon gets a motion that fits what it depicts (in the spirit of itshover.com).
const MOTIONS = {
  heart:       { scale: [1, 1.25, 0.95, 1.12, 1], transition: { duration: 0.7 } },
  utensils:    { rotate: [0, -14, 10, -6, 0],     transition: { duration: 0.6 } },
  stethoscope: { rotate: [0, 8, -8, 4, 0], y: [0, -2, 0], transition: { duration: 0.6 } },
  basket:      { y: [0, -5, 0, -2, 0],            transition: { duration: 0.6 } },
  book:        { rotateY: [0, 25, 0],             transition: { duration: 0.6 } },
  home:        { y: [0, -4, 0], scale: [1, 1.08, 1], transition: { duration: 0.5 } },
  hand:        { rotate: [0, -10, 6, 0], y: [0, -3, 0], transition: { duration: 0.6 } },
  arrow:       { x: [0, 5, 0],                    transition: { duration: 0.5 } },
  "arrow-up-right": { x: [0, 3, 0], y: [0, -3, 0], transition: { duration: 0.5 } },
  coins:       { y: [0, -4, 0], rotate: [0, -6, 0], transition: { duration: 0.55 } },
  users:       { scale: [1, 1.1, 1],              transition: { duration: 0.5 } },
  package:     { y: [0, -4, 0], rotate: [0, 4, -4, 0], transition: { duration: 0.6 } },
  shield:      { scale: [1, 1.12, 1], rotate: [0, -6, 0], transition: { duration: 0.5 } },
  camera:      { scale: [1, 0.9, 1.08, 1],        transition: { duration: 0.45 } },
  receipt:     { y: [0, 3, -2, 0],                transition: { duration: 0.5 } },
  truck:       { x: [0, 6, -2, 0],                transition: { duration: 0.6 } },
};

const NEUTRAL = { rotate: 0, rotateY: 0, scale: 1, x: 0, y: 0 };

/**
 * Lucide icon with a small motion that fits what it depicts.
 * - Uncontrolled: animates when the icon itself is hovered, or when a parent
 *   motion element with whileHover="on" / animate="on" propagates the variant.
 * - Controlled: pass `active` to drive it from a parent's hover/focus state.
 */
export default function AnimatedIcon({ name, className = "w-5 h-5", active, strokeWidth = 1.8, ...rest }) {
  const Icon = ICONS[name] ?? Heart;
  const { transition, ...keyframes } = MOTIONS[name] ?? MOTIONS.heart;
  const variants = {
    on:  { ...keyframes, transition: { ease: "easeInOut", ...transition } },
    off: { ...NEUTRAL, transition: { duration: 0.2 } },
  };
  const controlled = active !== undefined;
  return (
    <motion.span
      className="inline-flex"
      style={{ transformPerspective: 400 }}
      variants={variants}
      initial={false}
      animate={controlled ? (active ? "on" : "off") : undefined}
      whileHover={controlled ? undefined : "on"}
      aria-hidden
    >
      <Icon className={className} strokeWidth={strokeWidth} {...rest} />
    </motion.span>
  );
}
