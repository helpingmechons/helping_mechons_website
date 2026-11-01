"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import AnimatedIcon from "@/components/motion/AnimatedIcon";
import HoverGroup from "@/components/motion/HoverGroup";

const STEPS = [
  { icon: "heart",   title: "You give",              desc: "By UPI, card or net banking. You can tag your gift to one campaign." },
  { icon: "receipt", title: "We confirm it",         desc: "Our team checks the payment and emails your receipt. It's saved to your donation history." },
  { icon: "truck",   title: "Volunteers deliver",    desc: "The money buys food, medicines, kits or groceries for the next drive." },
  { icon: "camera",  title: "We show you the proof", desc: "Every drive is photographed and logged on our Transparency page." },
];

/** How a donation travels. The line fills in as you scroll through the steps. */
export default function DonationJourney() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative grid md:grid-cols-4 gap-10 md:gap-6">
      {/* track + fill (horizontal on desktop, vertical on mobile) */}
      <span aria-hidden className="absolute hidden md:block left-7 right-7 top-7 h-[3px] bg-outline-variant rounded-full" />
      <motion.span aria-hidden style={{ scaleX: fill }}
        className="absolute hidden md:block left-7 right-7 top-7 h-[3px] bg-marigold rounded-full origin-left" />
      <span aria-hidden className="absolute md:hidden left-7 top-7 bottom-7 w-[3px] bg-outline-variant rounded-full" />
      <motion.span aria-hidden style={{ scaleY: fill }}
        className="absolute md:hidden left-7 top-7 bottom-7 w-[3px] bg-marigold rounded-full origin-top" />

      {STEPS.map((s, i) => (
        <Step key={s.title} step={s} index={i} progress={fill} />
      ))}
    </ol>
  );
}

function Step({ step, index, progress }) {
  const at = index / (STEPS.length - 1);
  const lit = useTransform(progress, [Math.max(0, at - 0.08), at], [0, 1]);
  const bg = useTransform(lit, [0, 1], ["#ffffff", "#f6a623"]);
  const border = useTransform(lit, [0, 1], ["#cfd8e3", "#f6a623"]);
  return (
    <HoverGroup as="li" className="relative flex md:block gap-5 cursor-default">
      <motion.span style={{ backgroundColor: bg, borderColor: border }}
        className="relative z-10 w-14 h-14 rounded-full border-2 grid place-items-center text-ink flex-shrink-0 shadow-soft">
        <AnimatedIcon name={step.icon} className="w-6 h-6" />
      </motion.span>
      <div className="md:mt-6">
        <p className="text-[14px] font-semibold text-saffron">Step {index + 1}</p>
        <h3 className="font-headline text-[26px] leading-tight font-bold text-ink mt-1">{step.title}</h3>
        <p className="mt-2 text-on-surface-variant text-[16px] leading-relaxed max-w-[28ch]">{step.desc}</p>
      </div>
    </HoverGroup>
  );
}
