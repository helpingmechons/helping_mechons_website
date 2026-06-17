import { createAdminClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const adminSb = createAdminClient();

  // Get all profiles (filtered to confirmed-only below — migration 003
  // reduces but does not 100% guarantee unconfirmed rows never appear here)
  const { data: profilesData } = await adminSb
    .from("profiles")
    .select("id, full_name, phone, role, must_change_password, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = profilesData ?? [];

  // Fetch auth.users to get email + confirmation status
  // (requires service role — never expose this to client)
  const { data: authData } = await adminSb.auth.admin.listUsers({ perPage: 200 });
  const authUsers = authData?.users || [];

  // Merge profiles with email + confirmed status from auth
  const enriched = profiles.map(p => {
    const authUser = authUsers.find(u => u.id === p.id);
    return {
      ...p,
      email:           authUser?.email || "",
      email_confirmed: Boolean(authUser?.email_confirmed_at),
      last_sign_in:    authUser?.last_sign_in_at || null,
    };
  });

  // Show only confirmed users in the admin list. Migration 003 was meant to
  // stop unconfirmed signups from ever getting a profiles row, but in
  // practice some still slip through — so we filter explicitly here rather
  // than trust that invariant blindly. Admins are always shown regardless
  // of confirmation status, since their access shouldn't be hidden/toggled
  // based on a stale email-confirmation state.
  const visibleUsers = enriched.filter(p => p.email_confirmed || p.role === "admin");

  return <UsersClient profiles={visibleUsers} />;
}
