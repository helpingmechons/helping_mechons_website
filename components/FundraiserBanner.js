import Link from "next/link";
import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import { Clock, ArrowRight } from "lucide-react";

function daysLeft(end) {
  if (!end) return null;
  return Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
}

export default async function FundraiserBanner() {
  const supabase = createPublicClient();
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
    <section className="py-16 md:py-20 bg-marigold-pale border-y border-marigold/40">
      <div className="section-container">
        <div className="flex items-center gap-3 mb-8">
          <span className="relative flex w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ring-red opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex rounded-full w-3 h-3 bg-ring-red" />
          </span>
          <h2 className="font-headline text-[30px] md:text-[38px] font-bold text-ink leading-none">Fundraisers closing soon</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundraisers.map(f => {
            const days = daysLeft(f.end_date);
            const pct  = Math.min(100, Math.round((f.current_amount / f.goal_amount) * 100)) || 0;
            const img  = f.poster_url || f.cover_image_url;
            return (
              <article key={f.id} className="group bg-white rounded-3xl overflow-hidden flex flex-col border border-marigold/40 shadow-soft hover:shadow-lift transition-shadow duration-500">
                {img && (
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image src={img} alt={f.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
                    {days !== null && (
                      <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${days <= 2 ? "bg-ring-red text-white" : "bg-white text-ink"}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {days > 0 ? `${days} day${days !== 1 ? "s" : ""} left` : "Last day"}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  {f.urgency_label && (
                    <span className="text-[14px] font-semibold text-saffron mb-1">{f.urgency_label}</span>
                  )}
                  <h3 className="font-headline text-[24px] leading-tight font-bold text-ink mb-2 line-clamp-2">{f.title}</h3>
                  <p className="text-[16px] text-on-surface-variant line-clamp-2 mb-5">{f.description}</p>
                  <div className="mt-auto">
                    <div className="flex justify-between text-[14px] mb-1.5">
                      <span className="font-semibold text-ink">₹{Number(f.current_amount).toLocaleString("en-IN")} raised</span>
                      <span className="text-on-surface-variant">{pct}%</span>
                    </div>
                    <div className="progress-bar mb-5">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <Link href={`/donate?campaign=${f.slug || f.id}`} className="btn-primary w-full justify-between py-3.5">
                      Donate to this <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
