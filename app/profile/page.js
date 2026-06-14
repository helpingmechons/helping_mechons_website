import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export const metadata = { title: "My Profile & Donation History" };

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: donations }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("donations")
      .select("id, amount, final_amount, status, campaign_id, donor_name, created_at, approved_at, transaction_ref, is_anonymous")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const totalApproved = (donations || [])
    .filter(d => d.status === "approved")
    .reduce((sum, d) => sum + Number(d.final_amount), 0);

  return (
    <>
      <Navbar />
      <ProfileClient user={user} profile={profile} donations={donations || []} totalApproved={totalApproved} />
      <Footer />
    </>
  );
}
