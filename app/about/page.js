import Image from "next/image";
import Link from "next/link";
import { getPhoto } from "@/lib/images/drivePhotos";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Quote } from "lucide-react";
import { ORG } from "@/lib/content/site";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import AnimatedIcon from "@/components/motion/AnimatedIcon";
import HoverGroup from "@/components/motion/HoverGroup";
import ImageReveal from "@/components/motion/ImageReveal";
import { RingFigures } from "@/components/home/RingSVG";

export const metadata = { title: "About Us — Our Story, Mission & Journey" };

const TIMELINE = [
  { year: "2020", title: "The first night drive",     desc: "Founded in Visakhapatnam with one aim: no one within our reach goes hungry. The first nightly food distribution serves 50 people." },
  { year: "2021", title: "Groceries and medical camps", desc: "Grocery kits added. Reached 500+ families across 3 localities. First medical camp held with local doctors." },
  { year: "2022", title: "Schools and orphanages",   desc: "Education support begins. Partnered with 2 orphanages, started monthly old age home visits. 30+ volunteers." },
  { year: "2023", title: "Opening the books",        desc: "Launched this site so every donation and drive can be checked publicly. Reached 1,000+ families." },
];

const VALUES = [
  { icon: "shield", title: "Honest with money",  desc: "Public donations go to programmes only. Every rupee is logged against a drive." },
  { icon: "camera", title: "Show, don't tell",   desc: "We photograph and record each drive so donors can see the work, not just read about it." },
  { icon: "users",  title: "Local first",        desc: "We work with people who know their neighbourhoods: local leaders, doctors and schools." },
  { icon: "hand",   title: "We come back",       desc: "Monthly visits, not one-off photo ops. The same homes and families, again and again." },
];

// VERIFY: replace with real names and photos of the team.
const TEAM = [
  { role: "Founder",            focus: "Leads the organisation",    color: "#f57c00" },
  { role: "Operations lead",    focus: "Runs field logistics",      color: "#1e88e5" },
  { role: "Medical lead",       focus: "Organises medical camps",   color: "#43a047" },
  { role: "Transparency lead",  focus: "Keeps the books and logs",  color: "#7b1fa2" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main">

        {/* ── Hero ── */}
        <section className="bg-white pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          <div className="section-container grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-12 items-center">
            <div>
              <p className="text-[15px] font-medium text-saffron">Our story</p>
              <h1 className="mt-3 font-headline text-display text-ink">Started with one night of food. Still at it.</h1>
              <p className="mt-6 text-[19px] leading-relaxed text-on-surface-variant max-w-xl">
                Helping Mechons began in {ORG.founded} with a simple belief: no one within our reach should go hungry
                or go without care. Today we&apos;re a volunteer team running food, medical, grocery, education and
                elder-care programmes in and around {ORG.city}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/our-work" className="btn-primary px-7 py-4 text-[16px]">See our work</Link>
                <Link href="/transparency" className="btn-ghost border border-outline-variant px-7 py-4 text-[16px] text-ink">How we use donations</Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-[28px] overflow-hidden shadow-lift">
                <Image src={getPhoto("medical-support")} alt="Supplies packed for a drive" fill priority
                  sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-4 md:-left-8 bg-marigold text-ink rounded-2xl px-5 py-4 shadow-lift">
                <p className="font-headline text-[40px] leading-none font-bold">{ORG.founded}</p>
                <p className="text-[14px] font-semibold mt-1">First food drive</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="bg-mist py-20 md:py-24">
          <RevealGroup className="section-container grid md:grid-cols-2 gap-6">
            <RevealItem className="rounded-3xl bg-white p-8 md:p-10 border border-outline-variant/70 h-full">
              <span className="block h-1.5 w-14 rounded-full bg-marigold" />
              <h2 className="mt-6 font-headline text-[34px] font-bold text-ink leading-none">Mission</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-on-surface-variant">
                To provide life-saving medical care and steady food to marginalised communities, so that dignity and
                health are restored whatever someone&apos;s circumstances.
              </p>
            </RevealItem>
            <RevealItem className="rounded-3xl bg-ink text-white p-8 md:p-10 h-full">
              <span className="block h-1.5 w-14 rounded-full bg-ring-sky" />
              <h2 className="mt-6 font-headline text-[34px] font-bold leading-none">Vision</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-on-primary-container">
                Every community with access to food, medical care and education, and humanitarian work that&apos;s
                judged by how openly it accounts for itself.
              </p>
            </RevealItem>
          </RevealGroup>
        </section>

        {/* ── Founder quote ── */}
        <section className="bg-white py-20 md:py-28">
          <div className="section-container grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] gap-10 md:gap-16 items-center">
            <ImageReveal className="relative aspect-[4/5] rounded-[28px] overflow-hidden" direction="up">
              <Image src={getPhoto("education-support")} alt="Volunteers with children after a school kit drive" fill
                sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </ImageReveal>
            <Reveal>
              <Quote className="w-12 h-12 text-marigold" strokeWidth={1.5} />
              <blockquote className="mt-4 font-headline text-[28px] md:text-[38px] leading-[1.15] font-semibold text-ink [font-variation-settings:'wdth'_90]">
                Transparency isn&apos;t just a policy. It&apos;s the bridge of trust between the donor&apos;s heart and the
                community&apos;s recovery. We started Helping Mechons to prove that every rupee can carry the weight of a miracle.
              </blockquote>
              <p className="mt-6 text-[16px] font-semibold text-ink">Founder, Helping Mechons</p>
            </Reveal>
          </div>
        </section>

        {/* ── Timeline (a real sequence, so it's numbered by year) ── */}
        <section className="bg-ink text-white py-20 md:py-28 relative overflow-hidden">
          <RingFigures className="pointer-events-none absolute -left-48 -bottom-48 w-[560px] h-[560px] opacity-10 motion-safe:animate-[spin_140s_linear_infinite]" />
          <div className="section-container relative">
            <h2 className="font-headline text-[38px] md:text-[52px] leading-none font-bold">How we got here</h2>
            <p className="mt-3 text-on-primary-container text-[18px] max-w-lg">From one food drive to six programmes.</p>
            <RevealGroup as="ol" className="mt-14 grid md:grid-cols-4 gap-10 md:gap-6 relative" stagger={0.12}>
              <span aria-hidden className="hidden md:block absolute left-0 right-0 top-[22px] h-px bg-white/20" />
              {TIMELINE.map((t) => (
                <RevealItem as="li" key={t.year} className="relative">
                  <span className="relative inline-flex items-center justify-center h-11 px-4 rounded-full bg-marigold text-ink font-headline text-[20px] font-bold">
                    {t.year}
                  </span>
                  <h3 className="mt-5 font-headline text-[24px] font-bold leading-tight">{t.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-on-primary-container">{t.desc}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-white py-20 md:py-28">
          <div className="section-container">
            <h2 className="h-section mb-12">What we hold ourselves to</h2>
            <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant border border-outline-variant rounded-3xl overflow-hidden">
              {VALUES.map((v) => (
                <RevealItem key={v.title} className="bg-white p-8 h-full">
                  <HoverGroup className="group h-full">
                    <span className="w-12 h-12 rounded-2xl bg-marigold-pale text-saffron grid place-items-center">
                      <AnimatedIcon name={v.icon} className="w-6 h-6" />
                    </span>
                    <h3 className="mt-5 font-headline text-[24px] font-bold text-ink leading-tight">{v.title}</h3>
                    <p className="mt-2 text-[16px] leading-relaxed text-on-surface-variant">{v.desc}</p>
                  </HoverGroup>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── Photo pair ── */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          {[
            { src: getPhoto("food-distribution-2"), label: "Food distribution" },
            { src: getPhoto("grocery-support"),     label: "Grocery support" },
          ].map((p) => (
            <div key={p.label} className="group relative h-72 md:h-[420px] overflow-hidden">
              <Image src={p.src} alt={p.label} fill sizes="50vw" className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <p className="absolute left-6 bottom-6 font-headline text-[30px] font-bold text-white">{p.label}</p>
            </div>
          ))}
        </section>

        {/* ── Team ── */}
        <section className="bg-mist py-20 md:py-28">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="h-section">The people behind it</h2>
                <p className="mt-3 text-on-surface-variant text-[17px] max-w-md">A small core team, and volunteers who turn up every weekend.</p>
              </div>
              <a href={`mailto:${ORG.email}?subject=I'd like to volunteer`} className="btn-ink px-7 py-4 text-[16px] self-start md:self-auto">
                <Heart className="w-4 h-4" /> Join as a volunteer
              </a>
            </div>
            <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {TEAM.map((m) => (
                <RevealItem key={m.role} className="rounded-3xl bg-white border border-outline-variant/70 p-6 h-full">
                  <span className="w-14 h-14 rounded-full grid place-items-center text-white font-headline text-[22px] font-bold"
                    style={{ background: m.color }}>
                    {m.role[0]}
                  </span>
                  <p className="mt-5 font-headline text-[22px] font-bold text-ink leading-tight">{m.role}</p>
                  <p className="mt-1 text-[15px] text-on-surface-variant">{m.focus}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── Pointer to transparency ── */}
        <section className="bg-white py-20">
          <div className="section-container flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-headline text-[32px] md:text-[44px] leading-[1.05] font-bold text-ink max-w-2xl">
              Want to see where the money went? Every drive is logged.
            </h2>
            <Link href="/transparency" className="btn-primary px-8 py-4 text-[16px] self-start md:self-auto">Open the transparency log</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
