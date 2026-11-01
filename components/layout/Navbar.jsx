"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Heart, LogOut, User, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AnimatedIcon from "@/components/motion/AnimatedIcon";

const NAV_LINKS = [
  { href: "/our-work",     label: "Our work"     },
  { href: "/campaigns",    label: "Campaigns"    },
  { href: "/transparency", label: "Transparency" },
  { href: "/about",        label: "About"        },
];

export default function Navbar() {
  const [open,     setOpen]    = useState(false);
  const [user,     setUser]    = useState(null);
  const [isAdmin,  setAdmin]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]  = useState(false);
  const [hovered,  setHovered] = useState(null);

  const pathname = usePathname();
  const router   = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setAdmin(p?.role === "admin");
      }
    }).catch(() => {});

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

  // Hide when scrolling down, reveal when scrolling up.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 160 && y > prev && !open);
  });

  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) window.__lenis?.stop(); else window.__lenis?.start();
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const mobileLinks = [
    ...NAV_LINKS,
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    ...(user ? [{ href: "/profile", label: "My profile" }] : [{ href: "/login", label: "Log in" }]),
  ];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 border-b ${
          scrolled || open
            ? "bg-white/85 backdrop-blur-xl backdrop-saturate-150 shadow-soft border-outline-variant/60"
            : "bg-white border-transparent"
        }`}
      >
        <nav className="section-container flex items-center justify-between h-16 md:h-[72px]" aria-label="Main">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0" aria-label="Helping Mechons home">
            <motion.img
              src="/brand/logo-icon.png" alt="" width={44} height={44}
              className="h-10 w-10 md:h-11 md:w-11 rounded-full object-contain"
              whileHover={{ rotate: 36 }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
            />
            <span className="font-headline text-[21px] md:text-[23px] font-bold leading-[0.95] text-ink [font-variation-settings:'wdth'_85]">
              Helping<br />Mechons
            </span>
          </Link>

          {/* Desktop links with a sliding hover pill */}
          <ul className="hidden lg:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href} className="relative" onMouseEnter={() => setHovered(href)}>
                {hovered === href && (
                  <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-surface-container"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <Link href={href} aria-current={isActive(href) ? "page" : undefined}
                  className={`relative block px-4 py-2 rounded-full text-[16px] font-medium transition-colors ${
                    isActive(href) ? "text-ink" : "text-on-surface-variant hover:text-ink"}`}>
                  {label}
                  {isActive(href) && (
                    <motion.span layoutId="nav-active" className="absolute left-4 right-4 -bottom-0.5 h-[3px] rounded-full bg-marigold" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop account + CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="btn-ghost text-on-surface-variant" title="Admin">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            {user ? (
              <>
                <Link href="/profile" className="btn-ghost text-on-surface-variant"><User className="w-4 h-4" /> Profile</Link>
                <button onClick={handleLogout} className="btn-ghost text-on-surface-variant" aria-label="Log out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-ghost text-on-surface-variant">Log in</Link>
            )}
            <motion.div initial="off" whileHover="on" whileTap="on" className="ml-1">
              <Link href="/donate" className="btn-primary">
                <AnimatedIcon name="heart" className="w-4 h-4 fill-current" /> Donate
              </Link>
            </motion.div>
          </div>

          {/* Hamburger that morphs into a close icon */}
          <button
            className="lg:hidden relative w-11 h-11 rounded-full grid place-items-center text-ink hover:bg-surface-container transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Menu</span>
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="absolute h-[2.5px] w-6 rounded-full bg-current"
                initial={false}
                animate={open
                  ? { rotate: i === 1 ? 0 : i === 0 ? 45 : -45, y: 0, opacity: i === 1 ? 0 : 1 }
                  : { rotate: 0, y: (i - 1) * 7, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
            ))}
          </button>
        </nav>
      </motion.header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu"
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-[55] bg-white flex flex-col"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.ul className="section-container w-full pt-6 flex-1 overflow-y-auto"
              initial="hidden" animate="show" exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } }, hidden: {} }}>
              {mobileLinks.map(({ href, label }) => (
                <motion.li key={href} className="border-b border-outline-variant/70"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }}>
                  <Link href={href} onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-4 font-headline text-[34px] font-bold leading-none [font-variation-settings:'wdth'_85] ${
                      isActive(href) ? "text-saffron" : "text-ink"}`}>
                    {label}
                    {isActive(href) && <span className="cause-dot bg-marigold w-3 h-3" />}
                  </Link>
                </motion.li>
              ))}
              {user && (
                <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
                  <button onClick={handleLogout} className="py-4 text-[17px] font-semibold text-saffron inline-flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </motion.li>
              )}
            </motion.ul>
            <motion.div className="section-container w-full py-5 pb-[max(env(safe-area-inset-bottom),20px)] border-t border-outline-variant/70"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }} exit={{ opacity: 0 }}>
              <Link href="/donate" onClick={() => setOpen(false)} className="btn-primary w-full justify-center py-4 text-[17px]">
                <Heart className="w-5 h-5 fill-current" /> Donate
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
