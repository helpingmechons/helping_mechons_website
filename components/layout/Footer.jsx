import Link from "next/link";
import { Mail, Phone, Heart } from "lucide-react";
import { ORG, CAUSES } from "@/lib/content/site";
import { RingFigures } from "@/components/home/RingSVG";

const EXPLORE = [
  { href: "/our-work",     label: "Our work" },
  { href: "/campaigns",    label: "Campaigns" },
  { href: "/transparency", label: "Transparency" },
  { href: "/about",        label: "About us" },
  { href: "/donate",       label: "Donate" },
];

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-ink-deep text-white overflow-hidden">
      <RingFigures className="pointer-events-none absolute -right-40 -top-40 w-[520px] h-[520px] opacity-[0.12] motion-safe:animate-[spin_120s_linear_infinite]" />

      <div className="section-container relative pt-16 md:pt-20 pb-8">
        {/* Closing ask */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/10">
          <h2 className="font-headline text-[40px] md:text-[64px] leading-[0.95] font-bold max-w-2xl [font-variation-settings:'wdth'_85]">
            Give a meal, a kit, or a Saturday morning.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/donate" className="btn-primary text-[16px] px-8 py-4">
              <Heart className="w-5 h-5 fill-current" /> Donate
            </Link>
            <a href={`mailto:${ORG.email}?subject=I'd like to volunteer`} className="btn-outline text-white text-[16px] px-8 py-4">
              Volunteer with us
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 py-12">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-3">
              <img src="/brand/logo-icon.png" alt="" width={52} height={52} className="w-12 h-12 rounded-full bg-white p-0.5" />
              <p className="font-headline text-[24px] font-bold leading-none [font-variation-settings:'wdth'_85]">Helping Mechons</p>
            </div>
            <p className="mt-4 text-on-primary-container text-[16px] leading-relaxed max-w-sm">
              A volunteer-run NGO in {ORG.city}, handing out food, medicine, groceries and school kits since {ORG.founded}.
            </p>
            <a href={ORG.instagram} target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-white/90 hover:text-marigold transition-colors">
              <InstagramIcon className="w-5 h-5" /> @helpingmechons
            </a>
          </div>

          <nav className="md:col-span-2" aria-label="Footer">
            <h3 className="text-[15px] font-semibold text-white/60 mb-4 font-body">Explore</h3>
            <ul className="space-y-2.5">
              {EXPLORE.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[16px] text-white/90 hover:text-marigold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h3 className="text-[15px] font-semibold text-white/60 mb-4 font-body">Programmes</h3>
            <ul className="space-y-2.5">
              {CAUSES.map((c) => (
                <li key={c.id}>
                  <Link href="/our-work" className="group inline-flex items-center gap-2.5 text-[16px] text-white/90 hover:text-white">
                    <span className="cause-dot transition-transform duration-300 group-hover:scale-150" style={{ background: c.color }} />
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-3">
            <h3 className="text-[15px] font-semibold text-white/60 mb-4 font-body">Contact</h3>
            <ul className="space-y-3 text-[16px]">
              <li>
                <a href={`mailto:${ORG.email}`} className="inline-flex items-center gap-2.5 text-white/90 hover:text-marigold transition-colors break-all">
                  <Mail className="w-4 h-4 text-marigold flex-shrink-0" /> {ORG.email}
                </a>
              </li>
              <li>
                <a href={ORG.phoneHref} className="inline-flex items-center gap-2.5 text-white/90 hover:text-marigold transition-colors">
                  <Phone className="w-4 h-4 text-marigold flex-shrink-0" /> {ORG.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-[14px] text-white/60">
          <p>© {year} Helping Mechons. Registered NGO, India.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of use</Link>
            <Link href="/transparency" className="hover:text-white transition-colors">Transparency</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
