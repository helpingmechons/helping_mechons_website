import { createClient } from "@/lib/supabase/server";
import CampaignsClient from "./CampaignsClient";

export const metadata = { title: "Campaigns Management" };

export default async function AdminCampaignsPage() {
  const supabase = createClient();
  const { data: campaignsData } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  const campaigns = campaignsData ?? [];
  return <CampaignsClient initialCampaigns={campaigns} />;
}
