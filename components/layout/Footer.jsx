"use client";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const year = new Date().getFullYear();
  const router = useRouter();

  const handleDonateClick = (e) => {
    e.preventDefault();
    router.push("/donate");
    // Ensure scroll to top after navigation
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 50);
  };

  return (
    <footer className="bg-primary text-on-primary">
      <div className="section-container pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/brand/logo-full.png"
                alt="Helping Mechons"
                className="h-16 w-auto object-contain bg-white rounded-lg p-1"
              />
            </div>
            <p className="text-on-primary-container text-body-md leading-relaxed mb-4">
              Healing lives through medical aid, food distribution, grocery support, education, and orphanage care across India.
            </p>
            {/* Instagram only */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/helpingmechons/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container hover:bg-secondary hover:text-on-secondary transition-colors text-xs font-bold"
                aria-label="Instagram"
              >
                I
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-headline font-semibold text-headline-md mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/",             label: "Home" },
                { href: "/about",        label: "About Us" },
                { href: "/our-work",     label: "Our Work" },
                { href: "/campaigns",    label: "Campaigns" },
                { href: "/donate",       label: "Donate Now" },
                { href: "/transparency", label: "Transparency" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-on-primary-container hover:text-secondary-container transition-colors text-body-md"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Causes */}
          <div>
            <h3 className="font-headline font-semibold text-headline-md mb-4">Our Causes</h3>
            <ul className="space-y-3">
              {[
                "Medical Assistance",
                "Food Distribution",
                "Grocery Support",
                "Education Support",
                "Orphanage Care",
              ].map((cause) => (
                <li key={cause}>
                  <Link
                    href="/our-work"
                    className="text-on-primary-container hover:text-secondary-container transition-colors text-body-md"
                  >
                    {cause}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-headline font-semibold text-headline-md mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-body-md text-on-primary-container">
                <Mail className="w-5 h-5 mt-0.5 text-secondary-container flex-shrink-0" />
                <a href="mailto:helpingmechons@gmail.com" className="hover:text-secondary-container transition-colors">
                  helpingmechons@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-body-md text-on-primary-container">
                <Phone className="w-5 h-5 mt-0.5 text-secondary-container flex-shrink-0" />
                <a href="tel:+919966752148" className="hover:text-secondary-container transition-colors">
                  +91 9966752148
                </a>
              </li>
              {/* No physical address — removed per org preference */}
            </ul>

            <div className="mt-6 p-4 bg-primary-container rounded-xl border border-outline-variant/20">
              <p className="text-caption text-on-primary-container mb-2 font-semibold uppercase tracking-wider">Support Us</p>
              <p className="text-body-md text-on-primary-container mb-3">Every rupee you give reaches those who need it most.</p>
              <button
                onClick={handleDonateClick}
                className="inline-block bg-secondary text-on-secondary px-5 py-2 rounded-lg text-label-md font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-container pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption text-on-primary-container">
            © {year} Helping Mechons. All rights reserved. Registered NGO, India.
          </p>
          <div className="flex flex-wrap gap-4 text-caption text-on-primary-container">
            <Link href="/privacy"       className="hover:text-secondary-container transition-colors">Privacy Policy</Link>
            <Link href="/terms"         className="hover:text-secondary-container transition-colors">Terms of Use</Link>
            <Link href="/transparency"  className="hover:text-secondary-container transition-colors">Transparency</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
