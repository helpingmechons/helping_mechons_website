"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

export default function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-outline-variant border-y border-outline-variant">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}
                className="w-full flex items-center justify-between gap-6 py-5 text-left group">
                <span className="font-headline text-[21px] md:text-[23px] font-semibold text-ink group-hover:text-saffron transition-colors">{it.q}</span>
                <motion.span animate={{ rotate: on ? 45 : 0, backgroundColor: on ? "#f6a623" : "#ffffff" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-10 h-10 rounded-full border border-outline-variant grid place-items-center text-ink flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div key="a"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden">
                  <p className="pb-6 pr-14 text-[17px] text-on-surface-variant leading-relaxed max-w-2xl">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
