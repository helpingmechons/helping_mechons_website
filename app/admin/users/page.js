import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, must_change_password, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return <UsersClient profiles={profiles} />;
}
