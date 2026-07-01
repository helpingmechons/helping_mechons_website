"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [open,     setOpen]    = useState(false);
  const [user,     setUser]    = useState(null);
  const [isAdmin,  setAdmin]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setAdmin(p?.role === "admin");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setAdmin(p?.role === "admin");
      } else {
        setAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change (different page)
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  // Close menu and navigate — also closes if already on the same page
  const handleMobileNav = (href) => {
    setOpen(false);
    router.push(href);
  };

  const navLinks = [
    { href: "/our-work",    label: "Our Work"     },
    { href: "/about",       label: "About Us"     },
    { href: "/campaigns",   label: "Campaigns"    },
    { href: "/transparency",label: "Transparency" },
  ];

  // exact match for home, prefix match for others
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // ── Desktop link style ──
  const desktopLink = (href) =>
    `relative transition-colors hover:text-secondary pb-0.5 ${
      isActive(href)
        ? "text-secondary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-secondary"
        : "text-on-surface-variant"
    }`;

  // ── Mobile link style ──
  const mobileLink = (href) =>
    `px-4 py-3 rounded-lg text-body-md transition-colors text-left w-full ${
      isActive(href)
        ? "bg-secondary/10 text-secondary font-semibold border-l-4 border-secondary"
        : "text-on-surface-variant hover:bg-surface-container"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-outline-variant/40"
          : "bg-white border-b border-outline-variant/20"
      }`}
    >
      <nav className="section-container flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <img src="/brand/logo-full.png" alt="Helping Mechons" className="h-10 md:h-12 w-auto object-contain" />
          <span className="font-headline font-bold text-headline-md text-primary leading-none">
            Helping<br /><span className="text-secondary">Mechons</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-body-md">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={desktopLink(href)}>{label}</Link>
          ))}

          {isAdmin && (
            <Link href="/admin" className={desktopLink("/admin")}>Admin</Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className={desktopLink("/profile")}>My Profile</Link>
              <button
                onClick={handleLogout}
                className="text-secondary text-label-md font-semibold hover:opacity-80 transition-opacity"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className={desktopLink("/login")}>Login</Link>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/donate" className="btn-primary">
            <Heart className="w-4 h-4" /> Donate Now
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-outline-variant/30 bg-white">
          <div className="section-container py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => handleMobileNav(href)}
                className={mobileLink(href)}
              >
                {label}
              </button>
            ))}

            {isAdmin && (
              <button onClick={() => handleMobileNav("/admin")} className={mobileLink("/admin")}>
                Admin Dashboard
              </button>
            )}

            {user ? (
              <>
                <button onClick={() => handleMobileNav("/profile")} className={mobileLink("/profile")}>
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-lg text-body-md text-left text-secondary font-semibold hover:bg-secondary/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => handleMobileNav("/login")} className={mobileLink("/login")}>
                Login
              </button>
            )}

            <div className="pt-2 border-t border-outline-variant/30 mt-1">
              <button
                onClick={() => handleMobileNav("/donate")}
                className="btn-primary w-full justify-center"
              >
                <Heart className="w-4 h-4" /> Donate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
