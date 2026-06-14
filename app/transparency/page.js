import Link from "next/link";
import { getPhoto } from "@/lib/images/drivePhotos";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Transparency & Trust — How We Work" };

// Missions — amounts removed per org preference
const MISSIONS = [
  { id: "HM-2024-08A", tag: "DELIVERED", title: "Hyderabad Night Food Drive",
    img: getPhoto("food-distribution-1"),
    desc: "Nightly hot meal distribution to 1,200+ homeless individuals across old city Hyderabad — running every weekend since 2020." },
  { id: "HM-2024-09C", tag: "DELIVERED", title: "Tribal School Support — Adilabad",
    img: getPhoto("education-support"),
    desc: "School supply kits, uniforms, and digital learning tools delivered to 6 government schools serving tribal children in Adilabad district." },
  { id: "HM-2024-11F", tag: "DELIVERED", title: "Medical Camp — Rural Telangana",
    img: getPhoto("medical-support"),
    desc: "Free health check-ups, medicines, and specialist consultations provided to 3,000+ patients across 4 villages in Nalgonda and Mahbubnagar." },
];

export default async function TransparencyPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <div className="space-y-5">
              <span className="badge bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md">OUR COMMITMENT</span>
              <h1 className="font-headline-xl-mobile font-headline-xl text-headline-xl-mobile md:font-headline-xl text-headline-xl text-primary leading-tight">
                Every rupee accounted for. Every life honored.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                At Helping Mechons, we believe trust is built on transparency. We document every mission,
                every deployment, and every outcome — so you always know where your generosity goes.
              </p>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <Image src={getPhoto("old-age-care")} alt="Helping Mechons transparency in action" fill className="object-cover" />
            </div>
          </div>
        </section>

        {/* ── Fund Allocation + Growth Chart ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Fund Allocation */}
            <div className="card p-8">
              <h3 className="font-headline font-semibold text-primary mb-6 flex items-center gap-2">
                ⊕ Fund Allocation
              </h3>
              {[
                { label: "Direct Aid & Medical Supplies",   pct: 82, color: "bg-blue-500"   },
                { label: "Logistics & Field Operations",    pct: 12, color: "bg-orange-400" },
                { label: "Community Education",             pct: 6,  color: "bg-green-400"  },
              ].map(({ label, pct, color }) => (
                <div key={label} className="mb-5">
                  <div className="flex justify-between font-body-md text-body-md mb-1.5">
                    <span className="text-on-surface">{label}</span>
                    <span className="text-secondary font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              <p className="font-caption text-caption text-on-surface-variant mt-4 italic">
                *Helping Mechons maintains a 0% internal expense policy for public donations;
                operational costs are covered by a separate private endowment.
              </p>
            </div>

            {/* Growth of Impact */}
            <div className="card p-8">
              <h3 className="font-headline font-semibold text-primary mb-6 flex items-center gap-2">
                ↗ Growth of Impact
              </h3>
              <div className="flex items-end justify-between gap-3 h-40">
                {[
                  { year: "2018", h: "20%"  },
                  { year: "2020", h: "35%"  },
                  { year: "2021", h: "50%"  },
                  { year: "2022", h: "65%"  },
                  { year: "2023", h: "80%"  },
                  { year: "Current", h: "100%", highlight: true },
                ].map(({ year, h, highlight }) => (
                  <div key={year} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${highlight ? "bg-secondary" : "bg-surface-container-high"}`}
                      style={{ height: h }}
                    />
                    <span className="font-caption text-caption text-on-surface-variant text-xs">{year}</span>
                  </div>
                ))}
              </div>
              <p className="font-caption text-caption text-on-surface-variant mt-4">Year-over-year humanitarian reach expansion</p>
            </div>
          </div>
        </section>

        {/* ── Completed Missions Log ── */}
        <section className="py-section-padding bg-surface-container-low">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Completed Missions Log</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Detailed reports from our most recent deployments.</p>
              </div>
              <Link href="#" className="btn-ghost text-secondary border border-secondary rounded-lg whitespace-nowrap">
                View All Logs
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {MISSIONS.map(m => (
                <div key={m.id} className="card overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={m.img} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-primary-fixed text-on-primary-fixed">ID: {m.id}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="badge bg-secondary text-on-secondary">{m.tag}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-headline font-semibold text-on-surface mb-2">{m.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-4 leading-relaxed">{m.desc}</p>
                    <div className="flex items-center justify-end pt-3 border-t border-outline-variant/30">
                      <button className="p-2 rounded-lg text-secondary hover:bg-secondary-fixed/30 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-surface-container">
          <div className="section-container max-w-3xl mx-auto text-center">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Help us reach the next milestone.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Your contribution goes 100% to field operations. Join thousands of transparent donors
              making a measurable difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate" className="btn-primary px-10 py-4 text-base">
                Donate Now
              </Link>
              <Link href="/campaigns"
                className="border-2 border-primary text-primary px-10 py-4 rounded-lg font-semibold font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all">
                View Campaigns
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
