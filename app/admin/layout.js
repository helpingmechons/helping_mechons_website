import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, BarChart3, Megaphone, BookOpen, Settings, Heart, LogOut, ChevronRight, Plus } from "lucide-react";

const NAV = [
  { href: "/admin",           icon: LayoutDashboard, label: "Dashboard"        },
  { href: "/admin/donations", icon: Heart,           label: "Donations"        },
  { href: "/admin/campaigns", icon: Megaphone,       label: "Manage Campaigns" },
  { href: "/admin/gallery",   icon: BarChart3,       label: "Field Media"      },
  { href: "/admin/ledger",    icon: BookOpen,        label: "Ledger Tools"     },
  { href: "/admin/users",     icon: Settings,        label: "Settings"         },
];

export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role, full_name, must_change_password").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-primary flex-shrink-0 min-h-screen">
        <div className="px-5 py-5 border-b border-primary-container">
          <p className="font-headline font-bold text-on-primary text-lg">Admin Portal</p>
          <p className="text-caption text-on-primary-container">Managing Humanitarian Aid</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="admin-nav-item group">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <Link href="/admin/campaigns"
            className="flex items-center gap-2 w-full px-4 py-3 bg-secondary text-on-secondary rounded-lg text-label-md font-semibold hover:opacity-90 transition-opacity mb-3">
            <Plus className="w-4 h-4" /> New Report
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit"
              className="flex items-center gap-2 w-full px-4 py-3 text-on-primary-container hover:text-secondary-container text-label-md transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 flex items-center justify-between border-b border-primary-container">
        <p className="font-headline font-semibold text-on-primary">Admin</p>
        <div className="flex gap-1 overflow-x-auto">
          {NAV.map(({ href, icon: Icon }) => (
            <Link key={href} href={href}
              className="p-2 rounded-lg text-on-primary-container hover:bg-primary-container transition-colors flex-shrink-0">
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 min-w-0 overflow-auto mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
