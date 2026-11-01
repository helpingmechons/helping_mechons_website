import Link from "next/link";
import { getPhoto } from "@/lib/images/drivePhotos";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, CheckCircle2 } from "lucide-react";
import { AllocationBar, GrowthChart } from "@/components/transparency/Charts";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import AnimatedIcon from "@/components/motion/AnimatedIcon";
import HoverGroup from "@/components/motion/HoverGroup";
import ImageReveal from "@/components/motion/ImageReveal";

export const metadata = { title: "Transparency & Trust — How We Work" };

// VERIFY: confirm mission locations and figures with the NGO.
const MISSIONS = [
  { id: "HM-2024-08A", cat: "#f57c00", title: "Hyderabad Night Food Drive",
    img: getPhoto("food-distribution-1"),
    desc: "Nightly hot meal distribution to 1,200+ homeless individuals across old city Hyderabad — running every weekend since 2020." },
  { id: "HM-2024-09C", cat: "#7b1fa2", title: "Tribal School Support — Adilabad",
    img: getPhoto("education-support"),
    desc: "School supply kits, uniforms, and digital learning tools delivered to 6 government schools serving tribal children in Adilabad district." },
  { id: "HM-2024-11F", cat: "#1e88e5", title: "Medical Camp — Rural Telangana",
    img: getPhoto("medical-support"),
    desc: "Free health check-ups, medicines, and specialist consultations provided to 3,000+ patients across 4 villages in Nalgonda and Mahbubnagar." },
];

const ALLOCATION = [
  { label: "Direct aid and medical supplies", pct: 82, color: "#0f2b46" },
  { label: "Logistics and field operations",  pct: 12, color: "#f6a623" },
  { label: "Community education",             pct: 6,  color: "#43a047" },
];

// VERIFY: the original chart started in 2018, before the NGO was founded (2020).
const GROWTH = [
  { year: "2020", value: "200+",  pct: 18 },
  { year: "2021", value: "500+",  pct: 36 },
  { year: "2022", value: "800+",  pct: 56 },
  { year: "2023", value: "1000+", pct: 72 },
  { year: "Now",  value: "1500+", pct: 100 },
];

const PROMISES = [
  { icon: "coins",   title: "Donations fund programmes",  desc: "Public donations go to food, medicine, kits and groceries. Running costs are covered separately." },
  { icon: "receipt", title: "Every gift is receipted",    desc: "Each donation is checked by our team and a receipt is emailed and saved to your history." },
  { icon: "camera",  title: "Every drive is recorded",    desc: "Photos and notes from each mission go into the log below, with a mission ID you can quote back to us." },
];

export default function TransparencyPage() {
  return (
    <>
      <Navbar />
      <main id="main">

        {/* ── Hero ── */}
        <section className="bg-white pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="section-container grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12 items-center">
            <div>
              <p className="text-[15px] font-medium text-saffron">Transparency</p>
              <h1 className="mt-3 font-headline text-display text-ink">Every rupee accounted for.</h1>
              <p className="mt-6 text-[19px] leading-relaxed text-on-surface-variant max-w-xl">
                We document every mission and every outcome, so you always know where your money went.
                If something here doesn&apos;t add up, ask us and we&apos;ll show you.
              </p>
            </div>
            <div className="relative aspect-[5/4] rounded-[28px] overflow-hidden shadow-lift">
              <Image src={getPhoto("old-age-care")} alt="Volunteers on a visit" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* ── Promises ── */}
        <section className="bg-ink text-white py-16 md:py-20">
          <RevealGroup className="section-container grid md:grid-cols-3 gap-10">
            {PROMISES.map((p) => (
              <RevealItem key={p.title}>
                <HoverGroup className="group">
                  <span className="w-12 h-12 rounded-2xl bg-marigold text-ink grid place-items-center">
                    <AnimatedIcon name={p.icon} className="w-6 h-6" />
                  </span>
                  <h2 className="mt-5 font-headline text-[26px] font-bold leading-tight">{p.title}</h2>
                  <p className="mt-2 text-[16px] leading-relaxed text-on-primary-container">{p.desc}</p>
                </HoverGroup>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* ── Allocation + growth ── */}
        <section className="bg-white py-20 md:py-28">
          <div className="section-container grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-outline-variant/70 p-7 md:p-10">
              <h2 className="font-headline text-[30px] font-bold text-ink leading-none">How donations are split</h2>
              <p className="mt-2 mb-8 text-[16px] text-on-surface-variant">Share of public donations by use.</p>
              <AllocationBar items={ALLOCATION} />
              <p className="mt-6 text-[14px] text-on-surface-variant">
                Running costs are not taken from public donations. They&apos;re covered by a separate private fund.
              </p>
            </div>
            <div className="rounded-3xl border border-outline-variant/70 p-7 md:p-10">
              <h2 className="font-headline text-[30px] font-bold text-ink leading-none">People reached each year</h2>
              <p className="mt-2 mb-8 text-[16px] text-on-surface-variant">Cumulative, all programmes.</p>
              <GrowthChart data={GROWTH} />
              <div className="mt-3 flex gap-3">
                {GROWTH.map((g) => <span key={g.year} className="flex-1 text-center text-[14px] text-on-surface-variant">{g.year}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission log ── */}
        <section className="bg-mist py-20 md:py-28">
          <div className="section-container">
            <h2 className="h-section">Completed missions</h2>
            <p className="mt-3 mb-10 text-on-surface-variant text-[17px] max-w-md">Reports from our most recent deployments.</p>
            <RevealGroup className="grid md:grid-cols-3 gap-6">
              {MISSIONS.map((m) => (
                <RevealItem key={m.id} className="h-full">
                  <article className="group h-full rounded-3xl bg-white border border-outline-variant/70 overflow-hidden shadow-soft hover:shadow-lift transition-shadow duration-500 flex flex-col">
                    <ImageReveal className="relative h-52 overflow-hidden" direction="up">
                      <Image src={m.img} alt={m.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
                    </ImageReveal>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-3 text-[13px]">
                        <span className="font-mono text-on-surface-variant">{m.id}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-ring-green/10 text-ring-green px-2.5 py-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                        </span>
                      </div>
                      <h3 className="mt-4 font-headline text-[24px] font-bold text-ink leading-tight flex items-start gap-2.5">
                        <span className="cause-dot mt-2.5" style={{ background: m.cat }} /> {m.title}
                      </h3>
                      <p className="mt-2 text-[16px] leading-relaxed text-on-surface-variant">{m.desc}</p>
                    </div>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-white py-20">
          <div className="section-container flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-headline text-[32px] md:text-[44px] leading-[1.05] font-bold text-ink max-w-2xl">
              Help fund the next mission in this log.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/donate" className="btn-primary px-8 py-4 text-[16px]"><Heart className="w-5 h-5 fill-current" /> Donate</Link>
              <Link href="/campaigns" className="btn-ghost border border-outline-variant px-7 py-4 text-[16px] text-ink">View campaigns</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
