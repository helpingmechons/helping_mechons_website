import { createAdminClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const adminSb = createAdminClient();

  // Get all profiles (only confirmed accounts exist after migration 003)
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

  return <UsersClient profiles={enriched} />;
}
