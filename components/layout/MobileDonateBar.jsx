"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Heart, Share2, Check } from "lucide-react";

/** Sticky Donate + Share bar on phones. Slides away on pages where it would get in the way. */
export default function MobileDonateBar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(true);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setShow(y < 80 || y < prev);
  });

  const hideOn = ["/donate", "/admin", "/login", "/signup", "/forgot-password", "/reset-password"];
  if (hideOn.some((p) => pathname?.startsWith(p))) return null;

  const handleShare = async () => {
    const data = { title: "Helping Mechons", url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ y: show ? 0 : "110%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
    >
      <div className="flex items-center gap-2 rounded-full bg-ink/95 backdrop-blur-lg p-1.5 shadow-lift">
        <Link href="/donate" className="flex-1 btn-primary justify-center py-3.5 text-[16px]">
          <Heart className="w-4 h-4 fill-current" /> Donate
        </Link>
        <button onClick={handleShare} aria-label={copied ? "Link copied" : "Share this page"}
          className="w-12 h-12 grid place-items-center rounded-full text-white hover:bg-white/10 transition-colors flex-shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={copied ? "c" : "s"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
