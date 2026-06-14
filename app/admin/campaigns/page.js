import { createClient } from "@/lib/supabase/server";
import CampaignsClient from "./CampaignsClient";

export const metadata = { title: "Campaigns Management" };

export default async function AdminCampaignsPage() {
  const supabase = createClient();
  const { data: campaigns = [] } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  return <CampaignsClient initialCampaigns={campaigns} />;
}
