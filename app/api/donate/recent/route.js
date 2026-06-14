import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Format name for public display: "Durga Prasad" → "Durga P."
function formatName(fullName) {
  if (!fullName || fullName.trim() === "") return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// Human-readable relative time
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins < 2 ? "Just now" : `${mins} minutes ago`}`;
  if (hours < 24)  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days  === 1) return "Yesterday";
  if (days  < 7)   return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("donations")
      .select("donor_name, final_amount, amount, created_at, is_anonymous")
      .eq("status", "approved")
      .order("approved_at", { ascending: false })
      .limit(5); // fetch 5, return first 3 non-empty

    if (error || !data?.length) {
      return NextResponse.json({ donors: [] });
    }

    const donors = data.slice(0, 3).map(d => ({
      name: d.is_anonymous ? "Anonymous" : formatName(d.donor_name),
      amt:  `₹${Number(d.final_amount || d.amount).toLocaleString("en-IN")}`,
      t:    relativeTime(d.created_at),
    }));

    return NextResponse.json({ donors }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (err) {
    console.error("Recent donors error:", err);
    return NextResponse.json({ donors: [] });
  }
}
