import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { getPhoto } from "@/lib/images/drivePhotos";
import { CAUSES } from "@/lib/content/site";
import CampaignCard from "@/components/CampaignCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const metadata = { title: "Active Campaigns — Fundraisers" };

const CATEGORY_LABELS = {
  all:        "All campaigns",
  medical:    "Medical",
  food:       "Food",
  grocery:    "Groceries",
  education:  "Education",
  orphanage:  "Orphanage",
  general:    "General",
};
const CAT_COLOR = Object.fromEntries(CAUSES.map((c) => [c.id, c.color]));

export default async function CampaignsPage({ searchParams }) {
  const supabase = createClient();
  const cat      = searchParams?.cat || "all";

  let query = supabase
    .from("campaigns")
    .select("id, title, slug, description, goal_amount, current_amount, cover_image_url, category, location, end_date, featured, show_public_stats, is_completed")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at",  { ascending: false });

  if (cat !== "all") query = query.eq("category", cat);
  const { data: campaignsData } = await query;
  const campaigns = campaignsData ?? [];

  // Static fallback — ALL marked as completed since they're existing/done campaigns
  const items = campaigns.length > 0 ? campaigns : [
    { id:"1", title:"Emergency Medical Fund",         slug:"emergency-medical-fund",     description:"Life-saving surgeries and primary care for families who cannot afford treatment.", cover_image_url:getPhoto("medical-support"),     category:"medical",   location:"Visakhapatnam", featured:true,  is_completed:true, show_public_stats:false },
    { id:"2", title:"Daily Food for 500 Families",   slug:"daily-food-500-families",   description:"Nightly food distribution reaches 500+ homeless and destitute families.",          cover_image_url:getPhoto("food-distribution-1"), category:"food",      location:"Visakhapatnam", featured:true,  is_completed:true, show_public_stats:false },
    { id:"3", title:"Education Kits — 200 Children", slug:"education-kits-200-children",description:"School bags, books, and uniforms for 200 underprivileged students.",              cover_image_url:getPhoto("education-support"),   category:"education", location:"Visakhapatnam", featured:true,  is_completed:true, show_public_stats:false },
    { id:"4", title:"Monthly Grocery Kits — Elderly",slug:"grocery-kits-elderly",       description:"Monthly kits containing rice, dal, oil, and essentials for the elderly.",         cover_image_url:getPhoto("grocery-support"),     category:"grocery",   location:"Visakhapatnam", featured:false, is_completed:true, show_public_stats:false },
    { id:"5", title:"Orphanage Support",             slug:"orphanage-support-vijayawada",description:"Monthly support covering food, clothing, school fees, and medical checkups.",    cover_image_url:getPhoto("orphanage-care"),      category:"orphanage", location:"Visakhapatnam", featured:false, is_completed:true, show_public_stats:false },
  ];

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero */}
        <section className="bg-white pt-12 pb-10 md:pt-20 md:pb-14">
          <div className="section-container grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 lg:items-end">
            <div>
              <p className="text-[15px] font-medium text-saffron">Campaigns</p>
              <h1 className="mt-3 font-headline text-display text-ink">Pick a drive to fund.</h1>
            </div>
            <p className="text-[18px] leading-relaxed text-on-surface-variant max-w-md lg:pb-3">
              Each campaign is a real mission, finished or still running. Gifts to a campaign are tagged to it,
              checked by our team and reported.
            </p>
          </div>
        </section>

        {/* Category filters */}
        <nav aria-label="Filter campaigns" className="bg-white/90 backdrop-blur-xl border-y border-outline-variant/60 sticky top-0 z-30">
          <div className="section-container py-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const on = cat === key;
                return (
                  <Link
                    key={key}
                    href={key === "all" ? "/campaigns" : `/campaigns?cat=${key}`}
                    scroll={false}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
                      on ? "bg-ink text-white shadow-soft" : "text-on-surface-variant hover:bg-surface-container hover:text-ink"
                    }`}
                  >
                    {CAT_COLOR[key] && <span className="cause-dot" style={{ background: CAT_COLOR[key] }} />}
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Campaign cards */}
        <section className="py-14 md:py-20 bg-mist">
          <div className="section-container">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[19px] text-on-surface-variant">No campaigns in this category right now.</p>
                <Link href="/campaigns" className="btn-primary inline-flex mt-5">Show all campaigns</Link>
              </div>
            ) : (
              <RevealGroup key={cat} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((c) => (
                  <RevealItem key={c.id} className="h-full"><CampaignCard campaign={c} showMeta /></RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
