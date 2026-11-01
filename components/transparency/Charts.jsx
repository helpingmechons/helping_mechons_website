"use client";
import { motion, useReducedMotion } from "motion/react";

/** One stacked bar that fills segment by segment when scrolled into view. */
export function AllocationBar({ items }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="flex h-14 rounded-2xl overflow-hidden bg-surface-container" role="img"
        aria-label={items.map((i) => `${i.label} ${i.pct}%`).join(", ")}>
        {items.map((it, i) => (
          <motion.div key={it.label} className="h-full relative"
            style={{ background: it.color }}
            initial={reduce ? false : { width: 0 }}
            whileInView={{ width: `${it.pct}%` }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {it.pct >= 10 && (
              <span className="absolute inset-0 grid place-items-center font-headline text-[20px] font-bold text-white">{it.pct}%</span>
            )}
          </motion.div>
        ))}
      </div>
      <ul className="mt-6 space-y-3">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-4 text-[16px]">
            <span className="inline-flex items-center gap-3 text-on-surface">
              <span className="w-3 h-3 rounded-sm" style={{ background: it.color }} /> {it.label}
            </span>
            <span className="font-semibold text-ink tabular-nums">{it.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Column chart whose bars rise in sequence. */
export function GrowthChart({ data }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-end gap-3 h-56 border-b-2 border-outline-variant" role="img"
      aria-label={data.map((d) => `${d.year}: ${d.value}`).join(", ")}>
      {data.map((d, i) => {
        const last = i === data.length - 1;
        return (
          <div key={d.year} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
            <motion.span className={`text-[14px] font-bold tabular-nums ${last ? "text-saffron" : "text-on-surface-variant"}`}
              initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.12 }}>
              {d.value}
            </motion.span>
            <motion.div className={`w-full rounded-t-xl ${last ? "bg-marigold" : "bg-ink/80"}`}
              initial={reduce ? false : { height: 0 }}
              whileInView={{ height: `${d.pct}%` }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        );
      })}
    </div>
  );
}
