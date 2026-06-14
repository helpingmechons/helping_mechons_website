import { createClient } from "@/lib/supabase/server";
import DonationsClient from "./DonationsClient";

export const metadata = { title: "Donation Management" };

export default async function AdminDonationsPage() {
  const supabase = createClient();
  const { data: donations } = await supabase
    .from("donations")
    .select("*, campaigns(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return <DonationsClient donations={donations || []} />;
}
