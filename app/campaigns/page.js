import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { getPhoto } from "@/lib/images/drivePhotos";
import { Heart, MapPin, Calendar, BadgeCheck } from "lucide-react";

export const metadata = { title: "Active Campaigns — Fundraisers" };

const CATEGORY_LABELS = {
  all:        "All Campaigns",
  medical:    "Medical Aid",
  food:       "Food Distribution",
  grocery:    "Grocery Support",
  education:  "Education",
  orphanage:  "Orphanage Care",
  general:    "General",
};

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
  const { data: campaigns = [] } = await query;

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
      <main>
        {/* Hero */}
        <section className="bg-primary py-16">
          <div className="section-container text-center">
            <span className="text-label-md text-secondary-container uppercase tracking-widest">Our Campaigns</span>
            <h1 className="font-headline text-headline-xl-mobile md:text-headline-lg text-on-primary mt-3 mb-4">
              Every Cause Needs You
            </h1>
            <p className="text-body-lg text-on-primary-container max-w-xl mx-auto">
              Each campaign is a real mission — completed or ongoing. Your contribution is counted, verified, and reported.
            </p>
          </div>
        </section>

        {/* Category filters */}
        <section className="bg-white border-b border-outline-variant/30 sticky top-16 z-40">
          <div className="section-container py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Link
                  key={key}
                  href={key === "all" ? "/campaigns" : `/campaigns?cat=${key}`}
                  className={`px-4 py-2 rounded-full text-label-md whitespace-nowrap transition-all flex-shrink-0 ${
                    cat === key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Campaign cards */}
        <section className="py-section-padding bg-background">
          <div className="section-container">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-body-lg text-on-surface-variant">No campaigns found in this category.</p>
                <Link href="/campaigns" className="btn-primary inline-flex mt-4">View All</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {items.map(c => {
                  const pct       = Math.min(100, Math.round(((c.current_amount || 0) / (c.goal_amount || 1)) * 100));
                  const daysLeft  = c.end_date ? Math.max(0, Math.ceil((new Date(c.end_date) - new Date()) / 86400000)) : null;
                  const completed = c.is_completed || pct >= 100;
                  const showStats = c.show_public_stats && !completed;

                  return (
                    <div key={c.id} className="card group flex flex-col hover:shadow-lift transition-all duration-300">
                      {/* Image */}
                      <Link href={`/campaigns/${c.slug || c.id}`}>
                        <div className="relative h-52 overflow-hidden">
                          <Image
                            src={c.cover_image_url || getPhoto("food-distribution-1")}
                            alt={c.title} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                            {c.featured && <span className="badge bg-secondary text-on-secondary">Featured</span>}
                            {completed && (
                              <span className="badge bg-primary-fixed text-on-primary-fixed flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" /> Completed
                              </span>
                            )}
                          </div>
                          <span className="absolute top-3 right-3 badge bg-primary/80 text-on-primary capitalize">
                            {c.category}
                          </span>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <Link href={`/campaigns/${c.slug || c.id}`}>
                          <h2 className="font-headline font-semibold text-headline-md text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                            {c.title}
                          </h2>
                        </Link>
                        <p className="text-body-md text-on-surface-variant mb-4 flex-grow line-clamp-3">{c.description}</p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-on-surface-variant mb-4">
                          {c.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>
                          )}
                          {!completed && daysLeft !== null && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {daysLeft > 0 ? `${daysLeft} days left` : "Closing soon"}
                            </span>
                          )}
                        </div>

                        {/* Conditional: show amounts only if show_public_stats = true and not completed */}
                        {showStats && (
                          <div className="mb-4">
                            <div className="flex justify-between text-label-md mb-2">
                              <span className="text-secondary font-semibold">
                                ₹{Number(c.current_amount || 0).toLocaleString("en-IN")} raised
                              </span>
                              <span className="text-on-surface-variant">{pct}%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-caption text-on-surface-variant mt-2">
                              Goal: ₹{Number(c.goal_amount || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}

                        {/* Completed message */}
                        {completed && (
                          <p className="text-caption text-secondary font-semibold mb-4 flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5" /> Mission completed — thank you!
                          </p>
                        )}

                        {/* Donate CTA — always shown */}
                        <Link
                          href={`/donate?campaign=${c.slug || c.id}`}
                          className="mt-auto btn-primary w-full justify-center text-sm py-3"
                        >
                          <Heart className="w-4 h-4" /> Donate to This Cause
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
