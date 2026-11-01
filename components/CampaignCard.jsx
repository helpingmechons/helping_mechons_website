"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { Heart, MapPin, BadgeCheck, Calendar } from "lucide-react";
import { getPhoto } from "@/lib/images/drivePhotos";
import { CAUSES } from "@/lib/content/site";

const CAT_COLOR = Object.fromEntries(CAUSES.map((c) => [c.id, c.color]));
const CAT_LABEL = { medical: "Medical", food: "Food", grocery: "Groceries", education: "Education", orphanage: "Orphanage", general: "General" };

/**
 * Campaign card with a gentle 3D tilt toward the pointer and a photo that
 * slides on hover. Optional progress/meta for the campaigns page.
 */
export default function CampaignCard({ campaign: c, showMeta = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };

  const href = `/campaigns/${c.slug || c.id}`;
  const color = CAT_COLOR[c.category] || "#0f2b46";
  const pct = Math.min(100, Math.round(((c.current_amount || 0) / (c.goal_amount || 1)) * 100));
  const daysLeft = c.end_date ? Math.max(0, Math.ceil((new Date(c.end_date) - new Date()) / 86400000)) : null;
  const completed = c.is_completed || (c.goal_amount && pct >= 100);
  const showStats = showMeta && c.show_public_stats && !completed;

  return (
    <motion.article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="group relative h-full flex flex-col rounded-3xl bg-white border border-outline-variant/70 shadow-soft hover:shadow-lift transition-shadow duration-500 overflow-hidden"
    >
      <Link href={href} className="relative block h-56 overflow-hidden" tabIndex={-1} aria-hidden>
        <Image src={c.cover_image_url || getPhoto("food-distribution-1")} alt="" fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
        <motion.span aria-hidden style={{ left: glareX }}
          className="absolute top-0 bottom-0 w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[13px] font-semibold text-ink">
          <span className="cause-dot" style={{ background: color }} /> {CAT_LABEL[c.category] || c.category}
        </span>
        {showMeta && completed && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/85 text-white px-3 py-1 text-[13px] font-semibold">
            <BadgeCheck className="w-3.5 h-3.5" /> Completed
          </span>
        )}
      </Link>
      <span aria-hidden className="h-1 w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out-expo" style={{ background: color }} />

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-headline text-[25px] leading-[1.05] font-bold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] hover:text-saffron transition-colors">{c.title}</Link>
        </h3>
        <p className="mt-2.5 text-on-surface-variant text-[16px] leading-relaxed line-clamp-3 flex-1">{c.description}</p>

        {showMeta && (c.location || (!completed && daysLeft !== null)) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-on-surface-variant">
            {c.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.location}</span>}
            {!completed && daysLeft !== null && (
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {daysLeft > 0 ? `${daysLeft} days left` : "Closing soon"}</span>
            )}
          </div>
        )}

        {showStats && (
          <div className="mt-4">
            <div className="flex justify-between text-[14px] mb-1.5">
              <span className="font-semibold text-ink">₹{Number(c.current_amount || 0).toLocaleString("en-IN")} raised</span>
              <span className="text-on-surface-variant">{pct}% of ₹{Number(c.goal_amount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          </div>
        )}

        <Link href={`/donate?campaign=${c.slug || c.id}`}
          className="relative z-10 mt-6 btn-primary w-full justify-center py-3.5">
          <Heart className="w-4 h-4 fill-current" /> {showMeta && completed ? "Support similar work" : "Donate to this"}
        </Link>
      </div>
    </motion.article>
  );
}
