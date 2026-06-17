import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPhoto } from "@/lib/images/drivePhotos";
import FundraiserBanner from "@/components/FundraiserBanner";

const MARQUEE_PHOTOS = [
  { src: getPhoto("food-distribution-1"), alt: "Nightly food distribution" },
  { src: getPhoto("food-distribution-2"), alt: "Street food relief drive" },
  { src: getPhoto("food-distribution-3"), alt: "Grocery distribution to families" },
  { src: getPhoto("education-support"),   alt: "School supplies for tribal children" },
  { src: getPhoto("grocery-support"),     alt: "Monthly grocery kits" },
  { src: getPhoto("orphanage-care"),      alt: "Orphanage visit and donations" },
  { src: getPhoto("old-age-care"),        alt: "Old age home support" },
  { src: getPhoto("medical-support"),     alt: "Medical aid distribution" },
];

export default async function HomePage() {
  const supabase = createClient();
  const { data: campaignsData } = await supabase
    .from("campaigns")
    .select("id, title, slug, description, cover_image_url, category, location")
    .eq("active", true).eq("featured", true)
    .order("created_at", { ascending: false }).limit(3);
  const campaigns = campaignsData ?? [];

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src={getPhoto("food-distribution-1")} alt="Helping Mechons volunteers" fill className="object-cover" priority quality={80} />
            <div className="absolute inset-0 hero-gradient" />
          </div>
          <div className="relative z-10 section-container text-center py-24">
            <span className="inline-block mb-6 px-4 py-2 bg-secondary/90 text-on-secondary font-label-md text-label-md rounded-full uppercase tracking-widest">
              Est. 2020 · Visakhapatnam, India
            </span>
            <h1 className="font-headline text-4xl md:font-headline-xl text-headline-xl text-white mb-6 max-w-4xl mx-auto leading-tight text-balance drop-shadow-lg">
              Healing Lives,<br className="hidden md:block" /> One Mission at a Time.
            </h1>
            <p className="text-white/90 font-body-lg text-body-lg max-w-2xl mx-auto mb-10 drop-shadow-sm">
              Medical aid. Food security. Grocery support. Education. Orphanage care.<br className="hidden md:block" />
              Join us in restoring dignity to those who need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate" className="btn-primary text-base px-10 py-4 shadow-md">
                <Heart className="w-5 h-5" /> Donate Now
              </Link>
              <Link href="/our-work" className="btn-outline text-white border-white text-base px-10 py-4">
                View Our Work <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-white/70 rounded-full" />
            </div>
          </div>
        </section>

        {/* ── IMPACT STATS ── */}
        <section className="bg-surface-container-low py-14 md:py-16 border-b border-outline-variant/30">
          <div className="section-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
				{ stat: "500+", label: "Meals Delivered"   },
                { stat: "30+",   label: "Medical Consults"  },
                { stat: "50+",  label: "Education Kits"    },
                { stat: "100%",   label: "Fund Transparency" }
              ].map(({ stat, label }) => (
                <div key={label} className="space-y-2">
                  <p className="font-headline font-bold text-3xl md:font-headline-xl text-headline-xl text-primary">{stat}</p>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIVE FUNDRAISER BANNER ── */}
        <FundraiserBanner />

        {/* ── URGENT MISSIONS / CAMPAIGNS ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Urgent Missions</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
                  Your contribution directly funds these critical operations. Transparency is our foundation.
                </p>
              </div>
              <Link href="/campaigns" className="btn-ghost text-secondary border border-secondary rounded-lg whitespace-nowrap">
                All Campaigns <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {(campaigns.length > 0 ? campaigns : [
                { id:"1", title:"Emergency Medical Fund",         slug:"emergency-medical-fund",     description:"Providing life-saving surgeries and primary care to families in need.",                               cover_image_url:getPhoto("medical-support"),       category:"medical"   },
                { id:"2", title:"Daily Food for 500 Families",   slug:"daily-food-500-families",   description:"Our nightly food distribution reaches 500+ homeless and destitute families every single night.",       cover_image_url:getPhoto("food-distribution-1"),   category:"food"      },
                { id:"3", title:"Education Kits — 200 Children", slug:"education-kits-200-children",description:"Supply school bags, books, and uniforms to 200 underprivileged students so they attend with dignity.", cover_image_url:getPhoto("education-support"),     category:"education" },
              ]).map((c) => (
                <div key={c.id} className="card group flex flex-col hover:shadow-md transition-shadow">
                  <Link href={`/campaigns/${c.slug || c.id}`}>
                    <div className="relative h-64 overflow-hidden">
                      <Image src={c.cover_image_url || getPhoto("food-distribution-1")} alt={c.title}
                        fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 badge bg-primary-fixed text-on-primary-fixed capitalize">{c.category}</span>
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/campaigns/${c.slug || c.id}`}>
                      <h3 className="font-headline-md font-semibold text-headline-md text-primary mb-2 group-hover:text-secondary transition-colors">{c.title}</h3>
                    </Link>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow">{c.description}</p>
                    {/* No amounts — just donate CTA */}
                    <Link href={`/donate?campaign=${c.slug || c.id}`} className="mt-auto btn-primary w-full justify-center text-sm py-3">
                      <Heart className="w-4 h-4" /> Donate to This Cause
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY WE EXIST ── */}
        <section className="py-section-padding bg-primary text-on-primary">
          <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <Image src={getPhoto("old-age-care")} alt="Helping Mechons team with beneficiaries"
                width={600} height={400} className="rounded-2xl shadow-2xl w-full object-cover" />
              <div className="absolute -bottom-6 -right-4 bg-secondary p-6 rounded-xl shadow-xl hidden lg:block max-w-xs">
                <p className="font-headline italic text-on-secondary font-body-md text-body-md">"Transparency is our promise; impact is our proof."</p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="font-headline-lg text-headline-lg text-on-primary">Why We Exist</h2>
              <p className="font-body-lg text-body-lg text-on-primary-container">
                Helping Mechons was founded on the belief that geography should not determine destiny.
                We operate in underserved communities across India, bridging the gap between available resources
                and those who need them most.
              </p>
              <ul className="space-y-4">
                {[
                  "100% of public donations go directly to programs.",
                  "Real-time tracking of every donation through our Portal.",
                  "Collaborating with local leaders for lasting change.",
                ].map(p => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary-container flex-shrink-0 mt-0.5" />
                    <span className="font-body-md text-body-md text-on-primary-container">{p}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="inline-flex items-center gap-2 text-secondary-container font-semibold border-b border-secondary-container pb-1 hover:opacity-80 transition-opacity">
                Learn more about our mission <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section className="py-section-padding bg-surface-container">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Our Impact in Focus</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Unfiltered moments from our operations across India.</p>
              </div>
              <Link href="/our-work" className="btn-ghost text-secondary border border-secondary rounded-lg whitespace-nowrap">
                View Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MARQUEE_PHOTOS.slice(0, 4).map((p, i) => (
                <div key={i} className={`relative rounded-xl overflow-hidden ${i === 0 ? "md:col-span-2 md:row-span-2 h-64 md:h-full" : "h-40 md:h-48"}`}>
                  <Image src={p.src} alt={p.alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PHOTO MARQUEE ── */}
        <section className="py-10 bg-surface overflow-hidden border-y border-outline-variant/30">
          <div className="overflow-hidden">
            <div className="marquee-track">
              {[...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS].map((p, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-48 mx-3 rounded-xl overflow-hidden">
                  <Image src={p.src} alt={p.alt} width={288} height={192}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="py-20 bg-secondary">
          <div className="section-container text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-secondary mb-4">
              Be the Reason Someone Smiles Today
            </h2>
            <p className="font-body-lg text-body-lg text-on-secondary/90 mb-8 max-w-xl mx-auto">
              Every small contribution fuels our missions. Start your journey as a changemaker with us.
            </p>
            {/* Link to /donate — useEffect in donate page handles scroll-to-top */}
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-on-secondary text-secondary px-10 py-4 rounded-lg font-semibold font-label-md text-label-md hover:opacity-90 transition-opacity shadow-md"
            >
              <Heart className="w-5 h-5 fill-current" />
              Donate Now
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
