"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Magnetic from "@/components/motion/Magnetic";
import { Heart } from "lucide-react";

const fmt = (n) => n.toLocaleString("en-IN");

/** Pick an amount, see what it pays for. Hands the amount to /donate. */
export default function ImpactCalculator({ units, presets }) {
  const [amount, setAmount] = useState(presets[1]);
  const rows = useMemo(
    () => units.map((u) => ({ ...u, qty: Math.floor(amount / u.cost) })).filter((u) => u.qty > 0),
    [amount, units]
  );

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-start">
      <div>
        <h2 className="h-section text-white">What your gift pays for</h2>
        <p className="mt-4 text-[18px] text-on-primary-container max-w-md">
          Pick an amount to see what it covers. Every rupee is logged against a drive you can look up later.
        </p>

        <div className="mt-8 grid grid-cols-4 sm:flex sm:flex-wrap gap-1 sm:gap-2" role="radiogroup" aria-label="Donation amount">
          {presets.map((p) => {
            const on = p === amount;
            return (
              <button key={p} role="radio" aria-checked={on} onClick={() => setAmount(p)}
                className={`relative px-2 sm:px-5 py-2.5 rounded-full text-[15px] sm:text-[16px] font-semibold transition-colors duration-200 ${on ? "text-ink" : "text-white hover:bg-white/10"}`}>
                {on && (
                  <motion.span layoutId="preset-pill" className="absolute inset-0 rounded-full bg-marigold"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">₹{fmt(p)}</span>
              </button>
            );
          })}
        </div>

        <label className="block mt-8">
          <span className="sr-only">Custom amount</span>
          <input type="range" min={100} max={10000} step={100} value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-marigold h-2 cursor-pointer" />
          <span className="mt-2 flex justify-between text-[14px] text-on-primary-container">
            <span>₹100</span><span>₹10,000</span>
          </span>
        </label>
      </div>

      <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 md:p-9">
        <p className="text-on-primary-container text-[16px]">A gift of</p>
        <p className="font-headline text-white text-[64px] md:text-[84px] leading-none font-bold tabular-nums mt-1">
          ₹<motion.span key={amount} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{fmt(amount)}</motion.span>
        </p>
        <p className="text-on-primary-container text-[16px] mt-5 mb-3">could cover any one of these:</p>
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {rows.map((u) => (
              <motion.li key={u.id} layout
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-baseline gap-3 py-2 border-b border-white/10 last:border-0">
                <span className="cause-dot translate-y-[-2px]" style={{ background: u.color }} />
                <span className="font-headline text-marigold text-[28px] font-bold tabular-nums leading-none min-w-[3ch]">{fmt(u.qty)}</span>
                <span className="text-white text-[17px]">{u.qty === 1 ? u.one : u.many}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Magnetic>
            <Link href={`/donate?amount=${amount}`} className="btn-primary text-[16px] px-8 py-4">
              <Heart className="w-5 h-5 fill-current" /> Give ₹{fmt(amount)}
            </Link>
          </Magnetic>
          <p className="text-[13px] text-on-primary-container">Estimates. Costs vary by drive.</p>
        </div>
      </div>
    </div>
  );
}
