import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { getPhoto } from "@/lib/images/drivePhotos";
import FundraiserBanner from "@/components/FundraiserBanner";
import { ORG, STATS, CAUSES, IMPACT_UNITS, PRESETS, PHOTOS, FAQ } from "@/lib/content/site";

import HeroHeadline, { HeroFade } from "@/components/home/HeroHeadline";
import HeroRing from "@/components/home/HeroRing";
import LiveDonations from "@/components/home/LiveDonations";
import PhotoStrip from "@/components/home/PhotoStrip";
import CauseList from "@/components/home/CauseList";
import ImpactCalculator from "@/components/home/ImpactCalculator";
import DonationJourney from "@/components/home/DonationJourney";
import Faq from "@/components/home/Faq";
import CampaignCard from "@/components/CampaignCard";
import CountUp from "@/components/motion/CountUp";
import Magnetic from "@/components/motion/Magnetic";
import Reveal, { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import AnimatedIcon from "@/components/motion/AnimatedIcon";
import HoverGroup from "@/components/motion/HoverGroup";

// Served from the CDN and rebuilt in the background at most once a minute
// (and immediately when a donation is approved — see lib/revalidate.js).
export const revalidate = 60;

const FALLBACK_CAMPAIGNS = [
  { id: "1", title: "Emergency Medical Fund",        slug: "emergency-medical-fund",      description: "Providing life-saving surgeries and primary care to families in need.",                         cover_image_url: getPhoto("medical-support"),     category: "medical",   location: "Visakhapatnam" },
  { id: "2", title: "Daily Food for 500 Families",   slug: "daily-food-500-families",     description: "Our nightly food distribution reaches homeless and destitute families across the city.",       cover_image_url: getPhoto("food-distribution-1"), category: "food",      location: "Visakhapatnam" },
  { id: "3", title: "Education Kits — 200 Children", slug: "education-kits-200-children", description: "School bags, books, and uniforms for underprivileged students so they attend with dignity.", cover_image_url: getPhoto("education-support"),   category: "education", location: "Visakhapatnam" },
];

const WAYS = [
  { icon: "coins",   title: "Give money",   body: "One-off or whenever you can. UPI, card or net banking, with a receipt every time.",
    cta: { href: "/donate", label: "Donate" } },
  { icon: "users",   title: "Give time",    body: "Join a weekend drive: packing kits, serving food, or helping at a medical camp.",
    cta: { href: `mailto:${ORG.email}?subject=I'd like to volunteer`, label: "Email us to volunteer" } },
  { icon: "package", title: "Give supplies", body: "Rice, dal, clothes, school stationery and unexpired medicines all go to the next drive.",
    cta: { href: ORG.phoneHref, label: `Call ${ORG.phone}` } },
];

export default async function HomePage() {
  let campaigns = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id, title, slug, description, cover_image_url, category, location")
      .eq("active", true).eq("featured", true)
      .order("created_at", { ascending: false }).limit(3);
    campaigns = data ?? [];
  } catch {}
  const shown = campaigns.length ? campaigns : FALLBACK_CAMPAIGNS;

  return (
    <>
      <Navbar />
      <main id="main">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white">
          <div className="section-container grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-center pt-10 pb-8 md:pt-14 md:pb-16">
            <div>
              <HeroFade delay={0}>
                <p className="inline-flex items-center gap-2 text-[15px] font-medium text-on-surface-variant">
                  <MapPin className="w-4 h-4 text-saffron" /> Volunteers in {ORG.city} since {ORG.founded}
                </p>
              </HeroFade>
              <HeroHeadline
                lines={["Food, medicine and", "school kits, handed", "over by volunteers."]}
                className="mt-4 font-headline text-display text-ink"
              />
              <HeroFade delay={0.55}>
                <p className="mt-6 text-[19px] leading-relaxed text-on-surface-variant max-w-[34rem] text-pretty">
                  We run night food drives, medical camps and monthly grocery deliveries for people who have no one else to ask.
                  Every rupee you give goes to the field, and every drive is photographed and logged.
                </p>
              </HeroFade>
              <HeroFade delay={0.7} className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Link href="/donate" className="btn-primary text-[17px] px-7 py-4">
                    <Heart className="w-5 h-5 fill-current" /> Donate now
                  </Link>
                </Magnetic>
                <Link href="/transparency" className="btn-ghost text-ink border border-outline-variant px-6 py-4 text-[17px]">
                  <ShieldCheck className="w-5 h-5 text-ring-green" /> See where it goes
                </Link>
              </HeroFade>
              <HeroFade delay={0.9} className="mt-6 md:mt-8 md:min-h-[44px]">
                <LiveDonations />
              </HeroFade>
            </div>
            <HeroFade delay={0.2} className="relative -mx-2 sm:mx-0 -mb-6 md:mb-0">
              <HeroRing src={getPhoto("education-support", 1000)} alt="Volunteers with children after handing out school kits" />
            </HeroFade>
          </div>
        </section>

        <PhotoStrip photos={PHOTOS} />

        {/* ── TOTALS, set as a sentence ───────────────────────── */}
        <section className="bg-white py-16 md:py-24">
          <div className="section-container">
            <Reveal>
              <p className="font-headline text-[30px] md:text-[46px] leading-[1.12] font-semibold text-ink max-w-5xl [font-variation-settings:'wdth'_90]">
                Since {ORG.founded}, our volunteers have served{" "}
                <span className="text-saffron"><CountUp to={STATS[0].value} suffix={STATS[0].suffix} /> meals</span>, run{" "}
                <span className="text-saffron"><CountUp to={STATS[1].value} suffix={STATS[1].suffix} /> medical consultations</span>{" "}
                and handed out <span className="text-saffron"><CountUp to={STATS[2].value} suffix={STATS[2].suffix} /> school kits</span>,
                {" "}<span className="text-on-surface-variant">all paid for by people like you.</span>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── PROGRAMMES ─────────────────────────────────────── */}
        <section className="bg-white pb-20 md:pb-28">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
              <h2 className="h-section">What we do</h2>
              <p className="text-on-surface-variant text-[17px] max-w-sm">Six programmes, each with its own colour. Pick one to see its campaigns.</p>
            </div>
            <CauseList causes={CAUSES} />
          </div>
        </section>

        {/* ── IMPACT CALCULATOR ───────────────────────────────── */}
        <section className="bg-ink py-20 md:py-28 relative overflow-hidden">
          <div className="section-container relative">
            <ImpactCalculator units={IMPACT_UNITS} presets={PRESETS} />
          </div>
        </section>

        <FundraiserBanner />

        {/* ── CAMPAIGNS ───────────────────────────────────────── */}
        <section className="bg-mist py-20 md:py-28">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="h-section">Campaigns you can fund</h2>
                <p className="mt-3 text-on-surface-variant text-[17px] max-w-md">Give to one specific drive. Your gift is tagged to it and shows up in its report.</p>
              </div>
              <HoverGroup className="self-start md:self-auto">
                <Link href="/campaigns" className="link-underline text-[17px]">
                  All campaigns <AnimatedIcon name="arrow" className="w-4 h-4" />
                </Link>
              </HoverGroup>
            </div>
            <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shown.map((c) => (
                <RevealItem key={c.id}><CampaignCard campaign={c} /></RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── HOW A DONATION TRAVELS ──────────────────────────── */}
        <section className="bg-white py-20 md:py-28">
          <div className="section-container">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 mb-14">
              <h2 className="h-section">Where your money goes, step by step</h2>
              <p className="text-on-surface-variant text-[18px] leading-relaxed lg:pt-2 max-w-lg">
                You shouldn&apos;t have to take our word for it. This is what happens after you press Donate,
                and where you can check each step yourself.
              </p>
            </div>
            <DonationJourney />
          </div>
        </section>

        {/* ── WAYS TO HELP ────────────────────────────────────── */}
        <section className="bg-mist py-20 md:py-28">
          <div className="section-container">
            <h2 className="h-section mb-10">Three ways to help</h2>
            <RevealGroup className="grid md:grid-cols-3 gap-px bg-outline-variant rounded-3xl overflow-hidden border border-outline-variant">
              {WAYS.map((w) => (
                <RevealItem key={w.title} className="bg-white">
                  <HoverGroup className="group h-full p-8 md:p-10 flex flex-col">
                    <span className="w-14 h-14 rounded-2xl bg-marigold-pale text-saffron grid place-items-center">
                      <AnimatedIcon name={w.icon} className="w-7 h-7" />
                    </span>
                    <h3 className="mt-6 font-headline text-[30px] font-bold text-ink leading-none">{w.title}</h3>
                    <p className="mt-3 text-on-surface-variant text-[17px] leading-relaxed flex-1">{w.body}</p>
                    <a href={w.cta.href} className="link-underline mt-6 text-[16px] self-start">{w.cta.label}</a>
                  </HoverGroup>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section className="bg-white py-20 md:py-28">
          <div className="section-container grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16">
            <div>
              <h2 className="h-section">Questions donors ask us</h2>
              <p className="mt-4 text-on-surface-variant text-[17px] max-w-sm">
                Something else? Email <a className="link-underline" href={`mailto:${ORG.email}`}>{ORG.email}</a>
              </p>
              <div className="relative mt-10 hidden lg:block aspect-[4/3] max-w-sm rounded-3xl overflow-hidden">
                <Image src={getPhoto("grocery-support")} alt="Volunteers with residents at an old age home" fill sizes="384px" className="object-cover" />
              </div>
            </div>
            <Faq items={FAQ} />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
