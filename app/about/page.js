import Image from "next/image";
import { getPhoto } from "@/lib/images/drivePhotos";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Target, Eye, CheckCircle } from "lucide-react";

export const metadata = { title: "About Us — Our Story, Mission & Journey" };

const TIMELINE = [
  { year: "2020", title: "The Seed",       desc: "Founded in Visakhapatnam with a single aim: no one goes hungry within our reach. First nightly food distribution serves 50 people." },
  { year: "2021", title: "Expansion",      desc: "Expanded to grocery kit distribution. Reached 500+ families across 3 localities. First medical camp conducted with local doctors." },
  { year: "2022", title: "Digital Health", desc: "Launched education support program. Partnered with 2 orphanages. Monthly old-age home visits. Team grew to 30+ volunteers." },
  { year: "2023", title: "Stability",      desc: "Launched our digital portal for transparency. Reached 1,000+ families. Featured in local media for humanitarian work." },
];

const VALUES = [
  { icon: "🤝", title: "Unwavering Ethics",    desc: "We operate with surgical precision and absolute moral clarity in every mission we undertake." },
  { icon: "🔍", title: "Radical Transparency", desc: "82 cents of every rupee goes directly to the field. Our finances are open and audited regularly." },
  { icon: "💡", title: "Innovative Care",      desc: "Leveraging technology to bring quality care to the most hard-to-reach areas." },
  { icon: "🌱", title: "Sustainable Impact",   desc: "We don't just leave after the crisis. We build infrastructure and train local helpers to sustain the healing." },
];

const TEAM = [
  { initials: "FM", name: "Founder",           role: "Chief Humanitarian Officer", img: getPhoto("education-support")    },
  { initials: "SC", name: "Operations Lead",   role: "Head of Field Logistics",    img: getPhoto("food-distribution-1")  },
  { initials: "MT", name: "Medical Director",  role: "Health Program Director",    img: getPhoto("medical-support")     },
  { initials: "LR", name: "Transparency Lead", role: "Ethics & Accountability",    img: getPhoto("old-age-care")        },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <div className="space-y-6">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">Our Story</span>
              <h1 className="font-headline-xl-mobile font-headline-xl text-headline-xl-mobile md:font-headline-xl text-headline-xl text-primary leading-tight">
                Healing Humanity Through Action.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                Founded in 2020, Helping Mechons started from a simple belief — no one within our reach should
                go hungry or without care. Today, we stand as a growing force for humanitarian aid and community support,
                driven by the belief that every life deserves dignity.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/our-work" className="btn-primary">View Our Impact</Link>
                <Link href="/transparency" className="btn-ghost border border-on-surface-variant/30 rounded-lg text-on-surface-variant">View Transparency</Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src={getPhoto("medical-support")} alt="Helping Mechons team in action"
                width={600} height={480}
                className="rounded-2xl w-full object-cover shadow-xl"
              />
              <div className="absolute bottom-6 left-6 bg-secondary text-on-secondary px-5 py-3 rounded-xl shadow-md">
                <p className="font-headline-lg font-bold text-headline-lg">100+</p>
                <p className="font-caption text-caption text-on-secondary uppercase tracking-wider">Lives Impacted</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="py-section-padding bg-surface-container-low">
          <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="card p-8 border-t-4 border-secondary">
              <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-on-secondary-fixed" />
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mb-4">Our Mission</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                To provide life-saving medical care and nutritional stability to marginalised communities,
                ensuring that dignity and health are restored regardless of geography or circumstance.
              </p>
            </div>
            <div className="card p-8 border-t-4 border-tertiary-container">
              <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-on-primary-fixed" />
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mb-4">Our Vision</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                A world where every community has access to food, medical care, and education — and where
                transparency and accountability define how humanitarian work is done.
              </p>
            </div>
          </div>
        </section>

        {/* ── Founder Quote ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div className="md:col-span-1">
                <Image src={getPhoto("education-support")} alt="Founder" width={400} height={500}
                  className="rounded-2xl object-cover w-full shadow-md" />
              </div>
              <div className="md:col-span-2 space-y-5">
                <p className="font-headline text-6xl text-secondary opacity-40 leading-none">❝</p>
                <blockquote className="font-headline-md text-headline-md text-primary italic leading-relaxed">
                  "Transparency isn't just a policy; it's the bridge of trust between the donor's heart and the
                  community's recovery. We founded Helping Mechons to prove that every rupee can carry the weight of a miracle."
                </blockquote>
                <div>
                  <p className="font-headline font-semibold text-primary font-body-lg text-body-lg">Helping Mechons Founder</p>
                  <p className="font-caption text-caption text-on-surface-variant">Chief Humanitarian Officer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-section-padding bg-primary">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg text-on-primary">A 4-Year Journey</h2>
              <p className="font-body-md text-body-md text-on-primary-container mt-2">From a single food drive to a multi-city network of aid programs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {TIMELINE.map((item) => (
                <div key={item.year} className="bg-primary-container rounded-xl p-6">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-headline font-bold text-sm mb-4">
                    {item.year}
                  </div>
                  <h3 className="font-headline font-semibold text-on-primary mb-2">{item.title}</h3>
                  <p className="font-caption text-caption text-on-primary-container leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Core Values ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg text-primary">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {VALUES.map(({ icon, title, desc }, i) => (
                <div key={title} className={`card p-6 ${i === 3 ? "bg-primary text-on-primary border-0" : ""}`}>
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className={`font-headline font-semibold font-body-lg text-body-lg mb-2 ${i === 3 ? "text-on-primary" : "text-on-surface"}`}>{title}</h3>
                  <p className={`font-body-md text-body-md leading-relaxed ${i === 3 ? "text-on-primary-container" : "text-on-surface-variant"}`}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Image strip ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 h-72 md:h-96">
          <div className="relative overflow-hidden">
            <Image src={getPhoto("food-distribution-2")} alt="Field operations" fill className="object-cover" />
            <div className="absolute inset-0 bg-primary/40 flex items-end p-6">
              <p className="text-on-primary font-headline font-semibold">Food Distribution</p>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <Image src={getPhoto("grocery-support")} alt="Grocery support" fill className="object-cover" />
            <div className="absolute inset-0 bg-primary/40 flex items-end p-6">
              <p className="text-on-primary font-headline font-semibold">Grocery Support</p>
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">The People Behind the Mission</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Our team of dedicated volunteers gives every weekend without fail.
                </p>
              </div>
              <Link href="/our-work" className="btn-ghost text-secondary border border-secondary rounded-lg whitespace-nowrap">
                Join the Team →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {TEAM.map(({ initials, name, role, img }) => (
                <div key={name} className="card overflow-hidden group">
                  <div className="relative h-52 overflow-hidden">
                    <Image src={img} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="font-headline font-semibold text-on-surface">{name}</p>
                    <p className="font-caption text-caption text-on-surface-variant">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Transparency ── */}
        <section className="py-section-padding bg-surface-container-high border-y border-outline-variant">
          <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Built on Absolute Transparency</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                We believe that donors are partners, not just sources of funding. Every operation is documented
                and shared openly.
              </p>
              <ul className="space-y-4">
                {[
                  { label: "82% Aid Efficiency",         desc: "Direct aid as a share of all spending." },
                  { label: "Real-time Field Updates",    desc: "Mission logs updated directly by our field teams." },
                  { label: "Verified Donation Records",  desc: "Every donation manually reviewed and receipted." },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-on-surface font-body-md text-body-md">{label}</p>
                      <p className="font-caption text-caption text-on-surface-variant">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">Where Your Donation Goes</p>
              {[
                { label: "Medical Supplies",   pct: 45, color: "bg-blue-500"   },
                { label: "Food & Nutrition",   pct: 32, color: "bg-orange-400" },
                { label: "Field Operations",   pct: 15, color: "bg-green-500"  },
                { label: "Administration",     pct: 8,  color: "bg-gray-400"   },
              ].map(({ label, pct, color }) => (
                <div key={label} className="mb-4">
                  <div className="flex justify-between font-body-md text-body-md mb-1">
                    <span className="text-on-surface">{label}</span>
                    <span className="text-on-surface-variant">{pct}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
