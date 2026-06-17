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
            {/* Instagram with SVG logo */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/helpingmechons/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container hover:bg-secondary hover:text-on-secondary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
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
