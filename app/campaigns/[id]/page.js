import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPhoto } from "@/lib/images/drivePhotos";
import { createClient } from "@/lib/supabase/server";
import { Heart, MapPin, Calendar, Users, CheckCircle, Quote, ArrowLeft } from "lucide-react";
import CampaignDonateForm from "./CampaignDonateForm";

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data } = await supabase.from("campaigns").select("title, description").or(`slug.eq.${params.id},id.eq.${params.id}`).single();
  return { title: data ? `${data.title} — Helping Mechons` : "Campaign | Helping Mechons" };
}

export default async function CampaignDetailPage({ params }) {
  const supabase = createClient();
  const { id }   = params;

  // Try slug first, fall back to UUID
  let { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .or(`slug.eq.${id},id.eq.${id}`)
    .eq("active", true)
    .single();

  // Static fallback data for demo
  if (!campaign) {
    const FALLBACKS = {
      "emergency-medical-fund": {
        id: "1", title: "Emergency Medical Fund", slug: "emergency-medical-fund",
        description: "We are raising funds to provide life-saving surgeries and primary care to families in Hyderabad who cannot afford treatment. Every rupee goes directly toward medicines, doctor consultations, and emergency procedures.\n\nOur medical camps have already treated over 12,000 patients since 2020. With this campaign, we aim to support 200 more families requiring critical care in the next 3 months.",
        goal_amount: 500000, current_amount: 145000,
        cover_image_url: getPhoto("medical-support"), category: "medical",
        location: "Hyderabad, Telangana", featured: true,
        end_date: new Date(Date.now() + 90 * 86400000).toISOString(),
        fundraiser_display_name: null,
      },
      "daily-food-500-families": {
        id: "2", title: "Daily Food for 500 Families", slug: "daily-food-500-families",
        description: "Our nightly food distribution reaches 500+ homeless individuals and families on the streets of Hyderabad every single night. This is a sustained, continuous operation — not a one-time event.\n\nYour donation will help us buy ingredients, packaging materials, and fuel for our vehicles to keep this mission running every night without exception.",
        goal_amount: 200000, current_amount: 87500,
        cover_image_url: getPhoto("food-distribution-1"), category: "food",
        location: "Hyderabad, Telangana", featured: true,
        end_date: new Date(Date.now() + 60 * 86400000).toISOString(),
        fundraiser_display_name: null,
      },
    };
    campaign = FALLBACKS[id] || null;
    if (!campaign) notFound();
  }

  // Fetch comments
  const { data: comments = [] } = await supabase
    .from("fundraiser_comments")
    .select("id, donor_name, comment, amount, created_at")
    .eq("campaign_id", campaign.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const pct = Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100)) || 0;
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / 86400000))
    : null;

  // Related campaigns
  const { data: related = [] } = await supabase
    .from("campaigns")
    .select("id, title, slug, cover_image_url, category, goal_amount, current_amount")
    .eq("active", true)
    .eq("category", campaign.category)
    .neq("id", campaign.id)
    .limit(3);

  const PHOTO_GRID = [
    campaign.cover_image_url || getPhoto("food-distribution-1"),
    getPhoto("food-distribution-2"),
    getPhoto("old-age-care"),
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Breadcrumb */}
        <div className="bg-surface-container-low border-b border-outline-variant/30">
          <div className="section-container py-3">
            <Link href="/campaigns" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-body-md">
              <ArrowLeft className="w-4 h-4" /> Back to Campaigns
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <section className="relative h-64 md:h-96 overflow-hidden">
          <Image src={campaign.cover_image_url || getPhoto("food-distribution-1")} alt={campaign.title}
            fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 section-container">
            <span className="badge bg-secondary text-on-secondary capitalize">{campaign.category}</span>
            <h1 className="font-headline text-headline-xl-mobile md:text-headline-lg text-on-primary mt-3 drop-shadow-md">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-on-primary-container text-sm">
              {campaign.location && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {campaign.location}</span>
              )}
              {daysLeft !== null && (
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />
                  {daysLeft > 0 ? `${daysLeft} days left` : "Campaign closing soon"}</span>
              )}
            </div>
          </div>
        </section>

        <section className="py-10 bg-background">
          <div className="section-container grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Details */}
            <div className="lg:col-span-3 space-y-8">
              {/* Progress bar */}
              <div className="card p-6">
                <div className="flex justify-between text-body-md mb-3">
                  <span className="text-on-surface-variant">Raised</span>
                  <span className="text-secondary font-bold">{pct}%</span>
                </div>
                <div className="h-3 bg-surface-container-high rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  <div>
                    <p className="font-headline font-bold text-headline-md text-secondary">
                      ₹{Number(campaign.current_amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-caption text-on-surface-variant mt-1">Raised so far</p>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-headline-md text-primary">
                      ₹{Number(campaign.goal_amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-caption text-on-surface-variant mt-1">Total Goal</p>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-headline-md text-primary">
                      {daysLeft !== null ? `${daysLeft}d` : "∞"}
                    </p>
                    <p className="text-caption text-on-surface-variant mt-1">Days Left</p>
                  </div>
                </div>
              </div>

              {/* About section */}
              <div>
                <h2 className="font-headline text-headline-md text-primary mb-4">About This Campaign</h2>
                <div className="prose prose-ngo space-y-4">
                  {(campaign.description || "").split("\n\n").map((para, i) => (
                    <p key={i} className="text-body-lg text-on-surface-variant leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>

              {/* Photo gallery for campaign */}
              <div>
                <h3 className="font-headline font-semibold text-primary text-headline-md mb-4">From the Ground</h3>
                <div className="grid grid-cols-3 gap-3">
                  {PHOTO_GRID.map((src, i) => (
                    <div key={i} className={`relative rounded-xl overflow-hidden ${i === 0 ? "col-span-3 h-52" : "h-32"}`}>
                      <Image src={src} alt={`Campaign photo ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust points */}
              <div className="card p-6 border-l-4 border-secondary">
                <h3 className="font-headline font-semibold text-primary mb-4">Why This Campaign is Trustworthy</h3>
                <ul className="space-y-3">
                  {[
                    "All funds verified manually before disbursement",
                    "Impact updates published every 2 weeks",
                    "Official receipts emailed for every donation",
                    "Admin-reviewed and approved by core team",
                  ].map(point => (
                    <li key={point} className="flex items-start gap-3 text-body-md text-on-surface-variant">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Donor comments */}
              {comments.length > 0 && (
                <div>
                  <h3 className="font-headline font-semibold text-primary text-headline-md mb-4">
                    Donor Messages <span className="text-on-surface-variant font-body font-normal text-body-md">({comments.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="card p-5 relative">
                        <Quote className="absolute top-3 right-3 w-6 h-6 text-outline-variant/20" />
                        <p className="text-body-md text-on-surface-variant italic mb-3">"{c.comment}"</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">
                              {c.donor_name?.[0]}
                            </div>
                            <span className="text-body-md font-medium text-on-surface">{c.donor_name}</span>
                          </div>
                          {c.amount && (
                            <span className="text-secondary font-headline font-bold text-body-lg">
                              ₹{Number(c.amount).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <p className="text-caption text-on-surface-variant mt-2">
                          {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Donate sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <CampaignDonateForm campaign={campaign} />

              {/* Fundraiser info */}
              {campaign.fundraiser_display_name && (
                <div className="card p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold">
                      {campaign.fundraiser_display_name[0]}
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{campaign.fundraiser_display_name}</p>
                      <p className="text-caption text-on-surface-variant">Campaign Organiser</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Org info */}
              <div className="card p-5 bg-surface-container-low">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-on-secondary fill-current" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">Helping Mechons</p>
                    <p className="text-caption text-on-surface-variant">Verified NGO · Est. 2020</p>
                  </div>
                </div>
                <p className="text-caption text-on-surface-variant leading-relaxed">
                  This campaign is organised and managed by Helping Mechons, a Hyderabad-based humanitarian NGO.
                </p>
              </div>

              {/* Share */}
              <div className="card p-5">
                <p className="font-semibold text-on-surface mb-3">Share This Campaign</p>
                <div className="flex gap-2">
                  {["WhatsApp", "Facebook", "Twitter", "Copy Link"].map(s => (
                    <button key={s} className="flex-1 px-2 py-2 bg-surface-container rounded-lg text-caption text-on-surface-variant hover:bg-surface-container-high transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Campaigns */}
        {related.length > 0 && (
          <section className="py-section-padding bg-surface-container-low">
            <div className="section-container">
              <h2 className="font-headline text-headline-md text-primary mb-6">Other Active Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {related.map(c => {
                  const p = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) || 0;
                  return (
                    <Link key={c.id} href={`/campaigns/${c.slug || c.id}`} className="card group hover:shadow-lift transition-shadow">
                      <div className="relative h-40 overflow-hidden">
                        <Image src={c.cover_image_url || getPhoto("food-distribution-1")} alt={c.title}
                          fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-headline font-semibold text-on-surface text-body-lg mb-3 line-clamp-2">{c.title}</h3>
                        <div className="progress-bar mb-1"><div className="progress-fill" style={{ width: `${p}%` }} /></div>
                        <p className="text-caption text-on-surface-variant">{p}% of ₹{Number(c.goal_amount).toLocaleString("en-IN")}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
