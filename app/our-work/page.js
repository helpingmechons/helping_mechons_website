"use client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { X, ZoomIn, Heart } from "lucide-react";

// Causes — amounts/percentages removed for production
const CAUSES = [
  { id: "medical",   icon: "🏥", label: "Medical Support",      badge: "bg-blue-50 text-blue-700",   img: getPhoto("medical-support"),      cat: "Medical Aid",     desc: "Providing free medical camps and life-saving surgeries to underserved communities across Visakhapatnam and beyond." },
  { id: "food",      icon: "🍛", label: "Food Distribution",    badge: "bg-orange-50 text-orange-700",img: getPhoto("food-distribution-1"),   cat: "Food Security",   desc: "Distributing hot meals and food packets to 500+ homeless families nightly across the city." },
  { id: "grocery",   icon: "🛒", label: "Grocery Kits",         badge: "bg-green-50 text-green-700",  img: getPhoto("grocery-support"),      cat: "Grocery Support", desc: "Custom-packed grocery kits with rice, dal, oil, and essentials to sustain a family for a month." },
  { id: "education", icon: "📚", label: "Education Support",    badge: "bg-purple-50 text-purple-700",img: getPhoto("education-support"),     cat: "Education",       desc: "School bags, textbooks, stationery, and uniforms for children in tribal schools and rural areas." },
  { id: "orphanage", icon: "🏠", label: "Orphanage Care",       badge: "bg-pink-50 text-pink-700",    img: getPhoto("orphanage-care"),       cat: "Child Care",      desc: "Regular visits to orphanages for meals, clothing, school fees, and emotional support for children." },
  { id: "elderly",   icon: "🧓", label: "Old Age Home Support", badge: "bg-amber-50 text-amber-700",  img: getPhoto("old-age-care"),         cat: "Elder Care",      desc: "Monthly food, medicines, and companionship visits to elderly residents in old age homes." },
];

const ALL_PHOTOS = [
  { src: getPhoto("food-distribution-1"),  alt: "Nightly food distribution",    cat: "food"      },
  { src: getPhoto("food-distribution-2"),  alt: "Street food relief drive",      cat: "food"      },
  { src: getPhoto("food-distribution-3"),  alt: "Grocery distribution",          cat: "grocery"   },
  { src: getPhoto("education-support"),    alt: "School supplies distribution",  cat: "education" },
  { src: getPhoto("grocery-support"),      alt: "Monthly grocery kits",          cat: "grocery"   },
  { src: getPhoto("orphanage-care"),       alt: "Orphanage visit",               cat: "orphanage" },
  { src: getPhoto("old-age-care"),         alt: "Old age home support",          cat: "elderly"   },
  { src: getPhoto("medical-support"),      alt: "Medical aid camp",              cat: "medical"   },
];

export default function OurWorkPage() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="bg-surface-container-low py-section-padding text-center border-b border-outline-variant/30">
          <div className="section-container">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">Transparency in Action</span>
            <h1 className="font-headline-xl-mobile font-headline-xl text-headline-xl-mobile md:font-headline-xl text-headline-xl text-primary mt-3 mb-4 max-w-3xl mx-auto">
              Measurable Impact in Every Mission.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              We bridge the gap between intent and impact. Explore our initiatives focused on dignity,
              health, and sustainable support for communities in urgent need.
            </p>
          </div>
        </section>

        {/* ── Photo strip ── */}
        <section className="overflow-hidden bg-surface border-b border-outline-variant/30">
          <div className="flex">
            {ALL_PHOTOS.slice(0, 4).map((p, i) => (
              <div
                key={i}
                className="flex-1 h-40 md:h-52 overflow-hidden cursor-pointer relative group"
                onClick={() => setLightbox(p)}
              >
                <Image src={p.src} alt={p.alt} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
            ))}
          </div>
        </section>

        {/* ── 3×2 CAUSE GRID — no amounts ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {CAUSES.map(cause => (
                <div key={cause.id} className="card group hover:shadow-md transition-all duration-300">
                  {/* Image */}
                  <div
                    className="relative h-52 overflow-hidden cursor-pointer"
                    onClick={() => setLightbox({ src: cause.img, alt: cause.label })}
                  >
                    <Image src={cause.img} alt={cause.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className={`absolute top-3 left-3 badge text-xs ${cause.badge}`}>
                      {cause.cat}
                    </span>
                  </div>

                  {/* Content — no amounts shown */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-headline font-semibold text-on-surface">{cause.label}</h3>
                      <span className="text-xl flex-shrink-0">{cause.icon}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-5 text-sm leading-relaxed">{cause.desc}</p>
                    <Link href="/donate" className="btn-primary w-full justify-center py-2.5 text-sm">
                      <Heart className="w-4 h-4" /> Donate to This Cause
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats banner ── */}
        <section className="py-16 bg-primary">
          <div className="section-container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "500+", label: "Meals Delivered"   },
              { stat: "30+",   label: "Medical Consults"  },
              { stat: "50+",  label: "Education Kits"    },
              { stat: "100%",   label: "Fund Transparency" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="font-headline font-bold text-3xl md:font-headline-xl text-headline-xl text-secondary-container">{stat}</p>
                <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest mt-2">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 bg-secondary">
          <div className="section-container flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-secondary">Your contribution is the final piece.</h2>
              <p className="font-body-md text-body-md text-on-secondary/90 mt-2">Every rupee is tracked and allocated to the missions you see above.</p>
            </div>
            <Link href="/donate"
              className="flex-shrink-0 bg-on-secondary text-secondary px-8 py-4 rounded-lg font-semibold font-label-md text-label-md hover:opacity-90 transition-opacity">
              Donate Now
            </Link>
          </div>
        </section>

      </main>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-12 right-0 text-white hover:text-secondary-container transition-colors">
              <X className="w-8 h-8" />
            </button>
            <Image src={lightbox.src} alt={lightbox.alt} width={900} height={600}
              className="w-full h-auto rounded-xl shadow-2xl object-cover max-h-[80vh]" />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
