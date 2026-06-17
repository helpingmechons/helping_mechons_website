"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [open, setOpen]     = useState(false);
  const [user, setUser]     = useState(null);
  const [isAdmin, setAdmin] = useState(false);
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
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/our-work",      label: "Our Work" },
    { href: "/about",         label: "About Us" },
    { href: "/campaigns",     label: "Campaigns" },
    { href: "/transparency",  label: "Transparency" },
  ];

  const isActive = (href) => pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-outline-variant/40"
                 : "bg-white border-b border-outline-variant/20"
      }`}
    >
      <nav className="section-container flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        // <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          // <img
            // src="/brand/logo-full.png"
            // alt="Helping Mechons"
            // className="h-12 md:h-14 w-auto object-contain"
          // />
        // </Link>
		<Link href="/" className="flex items-center gap-2 group flex-shrink-0">
		  <img
			src="/brand/logo-full.png"
			alt="Helping Mechons"
			className="h-10 md:h-12 w-auto object-contain"
		  />

		  <span className="font-headline font-bold text-headline-md text-primary leading-none">
			Helping<br />
			<span className="text-secondary">Mechons</span>
		  </span>
		</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-body-md">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors hover:text-secondary ${
                isActive(href) ? "text-secondary font-semibold" : "text-on-surface-variant"
              }`}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`transition-colors hover:text-secondary ${
                isActive("/admin") ? "text-secondary font-semibold" : "text-on-surface-variant"
              }`}
            >
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-on-surface-variant hover:text-secondary transition-colors">
                My Profile
              </Link>
              <button onClick={handleLogout} className="text-secondary text-label-md font-semibold hover:opacity-80 transition-opacity">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-on-surface-variant hover:text-secondary transition-colors">
              Login
            </Link>
          )}
        </div>

        {/* Donate CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/donate" className="btn-primary">
            <Heart className="w-4 h-4" />
            Donate Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          onClick={() => setOpen(!open)}
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
              <Link
                key={href}
                href={href}
                className={`px-4 py-3 rounded-lg text-body-md transition-colors ${
                  isActive(href)
                    ? "bg-secondary text-on-secondary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="px-4 py-3 rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container transition-colors">
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link href="/profile" className="px-4 py-3 rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container transition-colors">
                  My Profile
                </Link>
                <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-body-md text-left text-secondary font-semibold hover:bg-secondary-fixed/30 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-3 rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container transition-colors">
                Login
              </Link>
            )}
            <div className="pt-2 border-t border-outline-variant/30 mt-1">
              <Link href="/donate" className="btn-primary w-full justify-center">
                <Heart className="w-4 h-4" />
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
