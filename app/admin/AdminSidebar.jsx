"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Heart, Megaphone, BarChart3,
  BookOpen, Settings, ChevronRight, Plus, LogOut,
} from "lucide-react";

const NAV = [
  { href: "/admin",           icon: LayoutDashboard, label: "Dashboard"        },
  { href: "/admin/donations", icon: Heart,           label: "Donations"        },
  { href: "/admin/campaigns", icon: Megaphone,       label: "Manage Campaigns" },
  { href: "/admin/gallery",   icon: BarChart3,       label: "Field Media"      },
  { href: "/admin/ledger",    icon: BookOpen,        label: "Ledger Tools"     },
  { href: "/admin/users",     icon: Settings,        label: "Settings"         },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // Match exact for /admin dashboard, prefix for sub-pages
  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-primary flex-shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-primary-container">
          <p className="font-headline font-bold text-on-primary text-lg">Admin Portal</p>
          <p className="text-caption text-on-primary-container">Managing Humanitarian Aid</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "admin-nav-item group",
                  active ? "active" : "",
                ].join(" ")}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active ? (
                  <div className="w-2 h-2 rounded-full bg-on-secondary opacity-80" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 space-y-2 border-t border-primary-container pt-3">
          <Link
            href="/admin/campaigns"
            className="flex items-center gap-2 w-full px-4 py-3 bg-secondary text-on-secondary rounded-lg text-label-md font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New Report
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-4 py-3 text-on-primary-container hover:text-secondary-container text-label-md transition-colors rounded-lg hover:bg-primary-container/40"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 flex items-center justify-between border-b border-primary-container">
        <p className="font-headline font-semibold text-on-primary text-sm">Admin</p>
        <div className="flex gap-1 overflow-x-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={[
                  "p-2 rounded-lg transition-colors flex-shrink-0",
                  active
                    ? "bg-secondary text-on-secondary"
                    : "text-on-primary-container hover:bg-primary-container",
                ].join(" ")}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
