"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import AnimatedIcon from "@/components/motion/AnimatedIcon";

/**
 * Programmes as a list of rows. On desktop, hovering a row floats that
 * programme's photo next to the cursor. On mobile each row shows a thumbnail.
 */
export default function CauseList({ causes }) {
  const wrap = useRef(null);
  const [active, setActive] = useState(null);
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30, mass: 0.5 });

  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };
  const current = causes.find((c) => c.id === active);

  return (
    <div ref={wrap} className="relative" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      <ul className="border-t border-outline-variant">
        {causes.map((c) => {
          const on = active === c.id;
          return (
            <li key={c.id} className="border-b border-outline-variant">
              <Link
                href={c.id === "elderly" ? "/campaigns" : `/campaigns?cat=${c.id}`}
                onPointerEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
                onBlur={() => setActive(null)}
                className="group relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1.4fr)_48px] items-center gap-4 md:gap-8 py-5 md:py-7 outline-none"
              >
                {/* coloured wash that slides in from the left */}
                <span aria-hidden className="absolute inset-0 -mx-4 rounded-xl origin-left scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 transition-transform duration-500 ease-out-expo"
                  style={{ background: `${c.color}12` }} />
                <span className="relative w-12 h-12 md:w-14 md:h-14 rounded-full grid place-items-center text-white flex-shrink-0 transition-transform duration-500 ease-out-expo group-hover:scale-110"
                  style={{ background: c.color }}>
                  <AnimatedIcon name={c.icon} active={on} className="w-6 h-6" />
                </span>
                <span className="relative">
                  <span className="block font-headline text-[26px] md:text-[34px] leading-none font-bold text-ink transition-[font-variation-settings] duration-500 [font-variation-settings:'wdth'_88] group-hover:[font-variation-settings:'wdth'_105]">
                    {c.title}
                  </span>
                  <span className="md:hidden block mt-1.5 text-[15px] text-on-surface-variant leading-snug">{c.desc}</span>
                </span>
                <span className="relative hidden md:block text-on-surface-variant text-[17px] leading-snug max-w-md">{c.desc}</span>
                <span className="relative hidden md:grid w-12 h-12 rounded-full border border-outline-variant place-items-center text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-white group-hover:border-ink">
                  <AnimatedIcon name="arrow-up-right" active={on} className="w-5 h-5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Floating photo that follows the cursor (desktop pointer only) */}
      <motion.div aria-hidden style={{ x, y }}
        className="pointer-events-none absolute left-0 top-0 z-20 hidden [@media(hover:hover)]:md:block">
        <AnimatePresence>
          {current && (
            <motion.div key={current.id}
              style={{ x: "-50%", y: "-115%" }}
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-64 h-44 rounded-2xl overflow-hidden shadow-lift border-4 border-white">
              <Image src={current.img} alt="" fill sizes="256px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
