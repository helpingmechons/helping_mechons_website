"use client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { X, ChevronLeft, ChevronRight, Heart, Expand } from "lucide-react";
import { CAUSES, STATS } from "@/lib/content/site";
import AnimatedIcon from "@/components/motion/AnimatedIcon";
import CountUp from "@/components/motion/CountUp";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const ALL_PHOTOS = [
  { id: "p1", src: getPhoto("food-distribution-1", 1200), alt: "Nightly food distribution",   cat: "food"      },
  { id: "p2", src: getPhoto("education-support", 1200),   alt: "School kits handed out",      cat: "education" },
  { id: "p3", src: getPhoto("food-distribution-2", 1200), alt: "Street food relief drive",    cat: "food"      },
  { id: "p4", src: getPhoto("orphanage-care", 1200),      alt: "Orphanage visit",             cat: "orphanage" },
  { id: "p5", src: getPhoto("food-distribution-3", 1200), alt: "Grocery distribution",        cat: "grocery"   },
  { id: "p6", src: getPhoto("old-age-care", 1200),        alt: "Old age home visit",          cat: "elderly"   },
  { id: "p7", src: getPhoto("grocery-support", 1200),     alt: "Monthly grocery kits",        cat: "grocery"   },
  { id: "p8", src: getPhoto("medical-support", 1200),     alt: "Medical and relief supplies", cat: "medical"   },
];

const COLOR = Object.fromEntries(CAUSES.map((c) => [c.id, c.color]));
const FILTERS = [{ id: "all", title: "Everything" }, ...CAUSES];

export default function OurWorkPage() {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const photos = filter === "all" ? ALL_PHOTOS : ALL_PHOTOS.filter((p) => p.cat === filter);
  const index = photos.findIndex((p) => p.id === openId);
  const open = index >= 0 ? photos[index] : null;

  const step = useCallback((d) => {
    if (index < 0) return;
    setOpenId(photos[(index + d + photos.length) % photos.length].id);
  }, [index, photos]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => { window.removeEventListener("keydown", onKey); window.__lenis?.start(); };
  }, [open, step]);

  return (
    <>
      <Navbar />
      <main id="main">

        {/* ── Hero ── */}
        <section className="bg-white pt-12 pb-14 md:pt-20 md:pb-20">
          <div className="section-container">
            <p className="text-[15px] font-medium text-saffron">Our work</p>
            <h1 className="mt-3 font-headline text-display text-ink max-w-4xl">Six programmes. All of them on the ground.</h1>
            <p className="mt-6 text-[19px] leading-relaxed text-on-surface-variant max-w-2xl">
              Each programme has its own colour across the site, so you can follow a cause from this page to its campaigns and its entries in the transparency log.
            </p>
          </div>
        </section>

        {/* ── Programmes ── */}
        <section className="bg-white pb-20 md:pb-28">
          <RevealGroup className="section-container grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAUSES.map((c) => (
              <RevealItem key={c.id} className="h-full">
                <motion.article initial="off" whileHover="on" whileTap="on" className="group h-full rounded-3xl bg-white border border-outline-variant/70 overflow-hidden flex flex-col shadow-soft hover:shadow-lift transition-shadow duration-500">
                  <div className="relative">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={c.img} alt={c.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
                    </div>
                    <span className="absolute left-5 -bottom-7 w-14 h-14 rounded-2xl grid place-items-center text-white shadow-lift ring-4 ring-white" style={{ background: c.color }}>
                      <AnimatedIcon name={c.icon} className="w-7 h-7" />
                    </span>
                  </div>
                  <div className="pt-10 px-6 pb-6 flex flex-col flex-1">
                    <h2 className="font-headline text-[28px] font-bold text-ink leading-none">{c.title}</h2>
                    <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant flex-1">{c.desc}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <Link href={c.id === "elderly" ? "/campaigns" : `/campaigns?cat=${c.id}`} className="link-underline text-[15px]">Campaigns</Link>
                      <Link href="/donate" className="btn-primary py-2.5 px-5 text-[15px]">
                        <Heart className="w-4 h-4 fill-current" /> Donate
                      </Link>
                    </div>
                  </div>
                  <span aria-hidden className="h-1.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out-expo" style={{ background: c.color }} />
                </motion.article>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* ── Gallery with filters ── */}
        <section className="bg-mist py-20 md:py-28">
          <div className="section-container">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="h-section">From our drives</h2>
                <p className="mt-3 text-on-surface-variant text-[17px] max-w-md">Unfiltered photos from the field. Tap one to see it full size.</p>
              </div>
              <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-5 px-5 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter photos by programme">
                {FILTERS.map((f) => {
                  const on = filter === f.id;
                  return (
                    <button key={f.id} role="tab" aria-selected={on} onClick={() => setFilter(f.id)}
                      className={`relative flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold transition-colors ${on ? "text-white" : "text-on-surface-variant hover:text-ink"}`}>
                      {on && <motion.span layoutId="work-filter" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                      {f.color && <span className="relative cause-dot" style={{ background: f.color }} />}
                      <span className="relative whitespace-nowrap">{f.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <LayoutGroup>
              <motion.ul layout className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[220px] gap-3 md:gap-4">
                <AnimatePresence mode="popLayout">
                  {photos.map((p, i) => (
                    <motion.li key={p.id} layout
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className={i % 5 === 0 ? "col-span-2 row-span-2" : ""}>
                      <motion.button layoutId={`photo-${p.id}`} onClick={() => setOpenId(p.id)}
                        className="group relative w-full h-full rounded-2xl overflow-hidden block text-left"
                        aria-label={`Open photo: ${p.alt}`}>
                        <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                        <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="absolute left-3 bottom-3 right-12 inline-flex items-center gap-2 text-white text-[14px] font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span className="cause-dot" style={{ background: COLOR[p.cat] }} /> {p.alt}
                        </span>
                        <span className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-white/90 grid place-items-center text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Expand className="w-4 h-4" />
                        </span>
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>

              {/* Lightbox grows out of the clicked photo */}
              <AnimatePresence>
                {open && (
                  <motion.div className="lightbox-overlay" onClick={() => setOpenId(null)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    role="dialog" aria-modal="true" aria-label={open.alt}>
                    <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                      <motion.div layoutId={`photo-${open.id}`} className="relative w-full h-[min(72vh,640px)] rounded-2xl overflow-hidden bg-ink">
                        <Image src={open.src} alt={open.alt} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-contain" />
                      </motion.div>
                      <div className="mt-4 flex items-center justify-between text-white">
                        <p className="inline-flex items-center gap-2 text-[16px] font-semibold">
                          <span className="cause-dot" style={{ background: COLOR[open.cat] }} /> {open.alt}
                          <span className="text-white/50 font-normal ml-2">{index + 1} / {photos.length}</span>
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => step(-1)} aria-label="Previous photo" className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center"><ChevronLeft className="w-5 h-5" /></button>
                          <button onClick={() => step(1)} aria-label="Next photo" className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center"><ChevronRight className="w-5 h-5" /></button>
                          <button onClick={() => setOpenId(null)} aria-label="Close" className="w-11 h-11 rounded-full bg-marigold text-ink grid place-items-center"><X className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </LayoutGroup>
          </div>
        </section>

        {/* ── Totals ── */}
        <section className="bg-ink text-white py-16 md:py-20">
          <div className="section-container grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="border-l-2 border-marigold pl-5">
                <p className="font-headline text-[56px] md:text-[72px] leading-none font-bold text-marigold">
                  <CountUp to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-[17px] text-on-primary-container">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-marigold py-16 md:py-20">
          <div className="section-container flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-headline text-[34px] md:text-[46px] leading-none font-bold text-ink">Fund the next drive.</h2>
              <p className="mt-3 text-[18px] text-ink/80">Every rupee is logged against the programmes above.</p>
            </div>
            <Link href="/donate" className="btn-ink px-8 py-4 text-[17px] self-start md:self-auto">
              <Heart className="w-5 h-5 fill-current" /> Donate now
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
