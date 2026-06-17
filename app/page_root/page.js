import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, ArrowRight, CheckCircle, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPhoto } from "@/lib/images/drivePhotos";
import FundraiserBanner from "@/components/FundraiserBanner";

const MARQUEE_PHOTOS = [
  { src: getPhoto("food-distribution-1"), alt: "Nightly food distribution — Hyderabad" },
  { src: getPhoto("food-distribution-2"), alt: "Street food relief drive" },
  { src: getPhoto("food-distribution-3"), alt: "Grocery distribution to families" },
  { src: getPhoto("education-support"),   alt: "School supplies for tribal children" },
  { src: getPhoto("grocery-support"),     alt: "Monthly grocery kits" },
  { src: getPhoto("orphanage-care"),      alt: "Orphanage visit and donations" },
  { src: getPhoto("old-age-care"),        alt: "Old age home support" },
  { src: getPhoto("medical-support"),     alt: "Medical aid distribution" },
];

const TESTIMONIALS = [
  { initials: "RM", name: "Rajesh M.", role: "Monthly Donor since 2021",
    quote: "Every report they send shows exactly where my money goes. That transparency built my trust completely." },
  { initials: "AS", name: "Amara Singh", role: "Community Volunteer",
    quote: "I joined one of their nightly food drives and it changed my life. These volunteers give every weekend without fail." },
  { initials: "RW", name: "Robert White", role: "Corporate Partner",
    quote: "Our company has partnered with Helping Mechons for CSR for two years. Their documentation is best-in-class." },
];

export default async function HomePage() {
  const supabase = createClient();
  const { data: campaignsData } = await supabase
    .from("campaigns")
    .select("id, title, slug, description, goal_amount, current_amount, cover_image_url, category, location")
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
            <Image src={getPhoto("food-distribution-1")}  alt="Helping Mechons volunteers" fill className="object-cover" priority quality={90} />
            <div className="absolute inset-0 hero-gradient" />
          </div>
          <div className="relative z-10 section-container text-center py-24">
            <span className="inline-block mb-6 px-4 py-2 bg-secondary/90 text-on-secondary font-label-md text-label-md rounded-full uppercase tracking-widest">
              Est. 2020 · Hyderabad, India
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

        {/* ── IMPACT STATS — light bg ── */}
        <section className="bg-surface-container-low py-14 md:py-16 border-b border-outline-variant/30">
          <div className="section-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { stat: "1.2M+",  label: "Lives Touched"      },
                { stat: "5.4M",   label: "Meals Served"       },
                { stat: "450+",   label: "Medical Camps"      },
                { stat: "85k",    label: "Students Supported" },
              ].map(({ stat, label }) => (
                <div key={label} className="space-y-2">
                  <p className="font-headline font-bold text-3xl md:font-headline-xl text-headline-xl text-primary">{stat}</p>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── URGENT MISSIONS / CAMPAIGNS ── */}
        {/* ── LIVE FUNDRAISER BANNER (dynamic from DB — shows if any active fundraiser exists) ── */}
        <FundraiserBanner />

        <section className="py-section-padding bg-background">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Urgent Missions</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">Your contribution directly funds these critical operations. Transparency is our foundation.</p>
              </div>
              <Link href="/campaigns" className="btn-ghost text-secondary border border-secondary rounded-lg whitespace-nowrap">
                All Campaigns <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {(campaigns.length > 0 ? campaigns : [
                { id:"1", title:"Emergency Medical Fund",         slug:"emergency-medical-fund",    description:"Providing life-saving surgeries and primary care to displaced families in conflict zones.",    goal_amount:500000, current_amount:145000, cover_image_url:getPhoto("medical-support"), category:"medical"   },
                { id:"2", title:"Daily Food for 500 Families",   slug:"daily-food-500-families",  description:"Our nightly food distribution reaches 500+ homeless and destitute families every single night.", goal_amount:200000, current_amount:87500,  cover_image_url:getPhoto("food-distribution-1"), category:"food"      },
                { id:"3", title:"Education Kits — 200 Children", slug:"education-kits-200-children",description:"Supply school bags, books, and uniforms to 200 underprivileged students so they attend with dignity.", goal_amount:150000, current_amount:62000, cover_image_url:getPhoto("education-support"), category:"education" },
              ]).map((c) => {
                const pct = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) || 0;
                return (
                  <Link key={c.id} href={`/campaigns/${c.slug || c.id}`} className="card group flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative h-64 overflow-hidden">
                      <Image src={c.cover_image_url || getPhoto("food-distribution-1")} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 badge bg-primary-fixed text-on-primary-fixed capitalize">{c.category}</span>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-headline-md font-semibold text-headline-md text-primary mb-2">{c.title}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow">{c.description}</p>
                      <div className="mt-auto">
                        <div className="flex justify-between font-label-md text-label-md mb-2">
                          <span className="text-secondary">₹{Number(c.current_amount).toLocaleString("en-IN")} raised</span>
                          <span className="text-on-surface-variant">{pct}%</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                        <p className="font-caption text-caption text-on-surface-variant mt-2">Goal: ₹{Number(c.goal_amount).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── WHY WE EXIST — dark section ── */}
        <section className="py-section-padding bg-primary text-on-primary">
          <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <Image src={getPhoto("old-age-care")}  alt="Helping Mechons team with beneficiaries" width={600} height={400} className="rounded-2xl shadow-2xl w-full object-cover" />
              <div className="absolute -bottom-6 -right-4 bg-secondary p-6 rounded-xl shadow-xl hidden lg:block max-w-xs">
                <p className="font-headline italic text-on-secondary font-body-md text-body-md">"Transparency is our promise; impact is our proof."</p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="font-headline-lg text-headline-lg text-on-primary">Why We Exist</h2>
              <p className="font-body-lg text-body-lg text-on-primary-container">
                Helping Mechons was founded on the belief that geography should not determine destiny.
                We operate in underserved communities across India, bridging the gap between available resources and those who need them most.
              </p>
              <ul className="space-y-4">
                {["100% of public donations go directly to programs.", "Real-time tracking of every dollar through our Portal.", "Collaborating with local leaders for lasting change."].map(p => (
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

        {/* ── TRUSTED PARTNERS ── */}
        <section className="py-12 bg-surface-container-low border-y border-outline-variant/30">
          <div className="section-container">
            <p className="text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-8">Trusted Global Partners</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
              {["🏛", "🌐", "🤝", "🏥", "📋"].map((icon, i) => (
                <span key={i} className="text-3xl">{icon}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg text-primary">Voices of the Community</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {TESTIMONIALS.map(({ initials, name, role, quote }) => (
                <div key={name} className="bg-surface-container-low rounded-xl border-l-4 border-secondary p-8 relative">
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-outline-variant/20" />
                  <p className="font-body-md text-body-md text-on-surface-variant italic mb-6 leading-relaxed">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center font-headline font-bold text-primary text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{name}</p>
                      <p className="font-caption text-caption text-on-surface-variant">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY / IMPACT IN FOCUS ── */}
        <section className="py-section-padding bg-surface-container">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Our Impact in Focus</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Unfiltered moments from our operations worldwide.</p>
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

        {/* ── CTA BANNER*/}
        <section className="py-20 bg-secondary">
          <div className="section-container text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-secondary mb-4">
              Be the Reason Someone Smiles Today
            </h2>
            <p className="font-body-lg text-body-lg text-on-secondary/90 mb-8 max-w-xl mx-auto">
              Every small contribution fuels our missions. Start your journey as a changemaker with us.
            </p>
            <Link href="/donate"
              className="inline-flex items-center gap-2 bg-on-secondary text-secondary px-10 py-4 rounded-lg font-semibold font-label-md text-label-md hover:opacity-90 transition-opacity shadow-md">
              <Heart className="w-5 h-5 fill-current" />
              Start Monthly Giving
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
