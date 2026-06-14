import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

// ── Admin route security ──────────────────────────────────────────────────────
// Double-checked here AND in middleware.js — belt-and-braces approach.
// Even if middleware is somehow bypassed, this layout gate stops the render.
// ─────────────────────────────────────────────────────────────────────────────
export default async function AdminLayout({ children }) {
  const supabase = createClient();

  // Always use getUser() — never getSession() — so the JWT is validated
  // server-side against Supabase, not just decoded client-side.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Gate 1 — must be authenticated
  if (authError || !user) {
    redirect("/login?next=/admin");
  }

  // Gate 2 — must be admin role (fetched from DB, not from JWT claims)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, must_change_password")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    // Silently redirect — don't reveal whether the route exists
    redirect("/");
  }

  // Gate 3 — force password change on first login
  // (pathname check happens in middleware; this is a fallback)
  // Note: we can't check path here easily in a layout, so middleware handles it.

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      {/* Sidebar — client component for active-state highlighting */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
