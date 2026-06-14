import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Clock, ArrowRight } from "lucide-react";

function daysLeft(end) {
  if (!end) return null;
  return Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
}

export default async function FundraiserBanner() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data: fundraisers } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_fundraiser", true)
    .eq("active", true)
    .gte("end_date", today)
    .order("end_date", { ascending: true })
    .limit(3);

  if (!fundraisers?.length) return null;

  return (
    <section className="py-12 bg-secondary">
      <div className="section-container">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-on-secondary" />
          <span className="font-label-md text-label-md text-on-secondary uppercase tracking-widest">
            Limited-Time Fundraisers
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {fundraisers.map(f => {
            const days = daysLeft(f.end_date);
            const pct  = Math.min(100, Math.round((f.current_amount / f.goal_amount) * 100)) || 0;
            const img  = f.poster_url || f.cover_image_url;
            return (
              <div key={f.id} className="bg-primary-container rounded-xl overflow-hidden flex flex-col">
                {img && (
                  <div className="relative h-44 w-full">
                    <Image src={img} alt={f.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                    {days !== null && (
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${days <= 2 ? "bg-error text-on-error" : "bg-secondary text-on-secondary"}`}>
                          {days > 0 ? `${days} day${days !== 1 ? "s" : ""} left` : "Last day!"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  {f.urgency_label && (
                    <span className="font-caption text-caption text-secondary-fixed mb-1 uppercase tracking-wider">
                      {f.urgency_label}
                    </span>
                  )}
                  <h3 className="font-headline-md text-headline-md text-on-primary-container mb-2 line-clamp-2">{f.title}</h3>
                  <p className="font-body-md text-body-md text-on-primary-fixed-variant line-clamp-2 mb-4">{f.description}</p>
                  <div className="mt-auto">
                    <div className="flex justify-between font-caption text-caption text-on-primary-fixed-variant mb-1">
                      <span>₹{Number(f.current_amount).toLocaleString("en-IN")} raised</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 bg-primary/40 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-secondary-container rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <Link
                      href={`/donate?campaign=${encodeURIComponent(f.title)}`}
                      className="flex items-center justify-between w-full py-2 px-4 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
                    >
                      Donate Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
