"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Real, recently approved donations from /api/donate/recent, cycling one at a
 * time. Renders nothing when there's no data — never shows made-up donors.
 */
export default function LiveDonations({ className = "" }) {
  const [donors, setDonors] = useState([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/donate/recent")
      .then((r) => r.json())
      .then((d) => { if (alive && d.donors?.length) setDonors(d.donors); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (donors.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % donors.length), 3800);
    return () => clearInterval(t);
  }, [donors.length]);

  if (!donors.length) return null;
  const d = donors[i];

  return (
    <div className={`inline-flex items-center gap-3 rounded-full bg-white border border-outline-variant/70 pl-2 pr-4 py-1.5 shadow-soft ${className}`}
      aria-live="polite">
      <span className="relative flex w-2.5 h-2.5 ml-1">
        <span className="absolute inline-flex h-full w-full rounded-full bg-ring-green opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-ring-green" />
      </span>
      <div className="h-6 overflow-hidden text-[15px] text-on-surface-variant">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={i}
            initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <span className="font-semibold text-ink">{d.name}</span> gave {d.amt}
            <span className="text-outline"> {d.t.toLowerCase()}</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
