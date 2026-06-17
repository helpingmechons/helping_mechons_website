import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Heart, Clock, CheckCircle, TrendingUp, Users, Bell, ArrowRight } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: allDonations },
    { data: pendingDonations },
    { data: campaigns },
    { data: ledger },
  ] = await Promise.all([
    supabase.from("donations").select("id, amount, final_amount, status, donor_name, email, created_at, transaction_ref").order("created_at", { ascending: false }).limit(10),
    supabase.from("donations").select("id, donor_name, email, amount, final_amount, transaction_ref, created_at, proof_link, comment").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, title, goal_amount, current_amount, active, cover_image_url").eq("active", true).order("created_at", { ascending: false }).limit(4),
    supabase.from("ledger_entries").select("type, amount"),
  ]);

  const totalRaised  = (allDonations || []).filter(d => d.status === "approved").reduce((s, d) => s + Number(d.final_amount || d.amount), 0);
  const totalCredits = (ledger || []).filter(l => l.type === "credit").reduce((s, l) => s + Number(l.amount), 0);
  const totalDebits  = (ledger || []).filter(l => l.type === "debit").reduce((s, l) => s + Number(l.amount), 0);
  const balance      = totalCredits - totalDebits;
  const pendingCount = pendingDonations?.length || 0;

  const STATS = [
    { label: "TOTAL FUNDING",   val: `₹${Number(totalRaised).toLocaleString("en-IN")}`, trend: "+12.4%", icon: TrendingUp, color: "bg-primary-fixed text-on-primary-fixed" },
    { label: "MISSIONS ACTIVE", val: String((campaigns || []).length),                    trend: null,     icon: Heart,      color: "bg-secondary-fixed text-on-secondary-fixed" },
    { label: "GLOBAL DONORS",   val: "1,200+",                                            trend: null,     icon: Users,      color: "bg-tertiary-fixed text-on-tertiary-fixed" },
  ];

  return (
    <div className="p-6 md:p-8 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-headline-lg text-primary">System Overview</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Real-time humanitarian logistics tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full text-on-secondary text-xs flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-sm">A</div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-on-surface">Admin</p>
              <p className="text-caption text-on-surface-variant">Chief Administrator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* ── CENTER: Main content (8-col) ── */}
        <div className="xl:col-span-8 space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-gutter">
            {STATS.map(({ label, val, trend, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {trend && <p className="text-secondary text-label-md font-semibold mb-1">{trend}</p>}
                <p className="font-headline font-bold text-headline-lg text-primary">{val}</p>
                <p className="text-caption text-on-surface-variant uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Pending clearances */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-semibold text-primary">PENDING DONATION CLEARANCES</h2>
              {pendingCount > 0 && (
                <span className="badge bg-secondary text-on-secondary">{pendingCount} Urgent</span>
              )}
            </div>
            {(pendingDonations || []).length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-body-md text-on-surface-variant">All donations reviewed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(pendingDonations || []).slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center justify-between gap-3 py-3 border-b border-outline-variant/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-sm flex-shrink-0">
                        {d.donor_name?.[0] || "D"}
                      </div>
                      <div>
                        <p className="text-body-md font-medium text-on-surface">{d.donor_name}</p>
                        <p className="text-caption text-on-surface-variant">{d.comment || d.email} · ₹{Number(d.final_amount || d.amount).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <Link href="/admin/donations" className="text-secondary text-label-md hover:opacity-80 whitespace-nowrap">Review →</Link>
                  </div>
                ))}
                <Link href="/admin/donations" className="block text-center text-secondary text-label-md hover:opacity-80 pt-2">
                  View all pending transactions
                </Link>
              </div>
            )}
          </div>

          {/* Active campaigns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-semibold text-primary uppercase tracking-wider text-sm">ACTIVE IMPACT CAMPAIGNS</h2>
              <Link href="/admin/campaigns" className="flex items-center gap-1 text-secondary text-label-md hover:opacity-80">
                + Create Campaign
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(campaigns || []).map(c => {
                const pct = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) || 0;
                return (
                  <div key={c.id} className="card p-4">
                    <h3 className="text-body-md font-medium text-on-surface mb-2 line-clamp-1">{c.title}</h3>
                    <div className="progress-bar mb-1"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                    <div className="flex justify-between text-caption text-on-surface-variant mt-1">
                      <span>₹{Number(c.current_amount).toLocaleString("en-IN")} raised</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR (4-col)*/}
        <div className="xl:col-span-4 space-y-5">

          {/* Internal reserve / balance */}
          <div className="bg-primary rounded-2xl p-6 text-on-primary">
            <p className="text-caption text-on-primary-container uppercase tracking-widest mb-1">INTERNAL RESERVE</p>
            <p className="font-headline font-bold text-headline-lg text-on-primary mb-4">
              ₹{Math.abs(balance).toLocaleString("en-IN")}
            </p>
            <Link href="/admin/ledger"
              className="w-full block text-center bg-surface-container-lowest text-primary py-2.5 rounded-lg text-label-md font-semibold hover:opacity-90 transition-opacity">
              Audit Ledger
            </Link>
          </div>

          {/* ── Admin Ledger Entry form inline*/}
          <div className="bg-primary rounded-2xl p-6 text-on-primary">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏛</span>
              <h3 className="font-headline font-semibold">ADMIN LEDGER ENTRY</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-caption text-on-primary-container mb-2 uppercase tracking-wider">Transaction Type</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-secondary text-on-secondary py-2 rounded-lg text-label-md font-semibold text-sm">Add Credit</button>
                  <button className="flex-1 bg-primary-container text-on-primary-container py-2 rounded-lg text-label-md font-semibold text-sm hover:bg-secondary/20 transition-colors">Debit Funds</button>
                </div>
              </div>
              <div>
                <p className="text-caption text-on-primary-container mb-2 uppercase tracking-wider">Amount (₹)</p>
                <input type="number" placeholder="0.00" onWheel={e => e.target.blur()}
                  className="w-full bg-primary-container border border-outline-variant/20 text-on-primary rounded-lg px-4 py-3 text-body-md placeholder:text-on-primary-container/50 focus:outline-none focus:ring-1 focus:ring-secondary" />
              </div>
              <div>
                <p className="text-caption text-on-primary-container mb-2 uppercase tracking-wider">Destination Fund</p>
                <select className="w-full bg-primary-container border border-outline-variant/20 text-on-primary rounded-lg px-4 py-3 text-body-md focus:outline-none focus:ring-1 focus:ring-secondary">
                  <option>General Aid Pool</option>
                  <option>Medical Fund</option>
                  <option>Food Distribution</option>
                  <option>Education Fund</option>
                </select>
              </div>
              <Link href="/admin/ledger"
                className="block w-full text-center bg-secondary text-on-secondary py-3 rounded-xl text-label-md font-semibold hover:opacity-90 transition-opacity">
                Commit Transaction
              </Link>
            </div>
          </div>

          {/* Field Media Repository */}
          <div className="card p-6">
            <h3 className="font-headline font-semibold text-primary mb-1 text-sm uppercase tracking-wider">FIELD MEDIA REPOSITORY</h3>
            <p className="text-caption text-on-surface-variant mb-4">Drag and drop high-res field photos or upload evidence</p>
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer">
              <div className="text-3xl mb-2">☁️</div>
              <p className="text-body-md font-medium text-on-surface">Upload Impact Evidence</p>
              <p className="text-caption text-on-surface-variant mt-1">JPG, PNG up to 10MB</p>
            </div>
            <Link href="/admin/gallery" className="btn-ghost w-full justify-center text-secondary border border-secondary rounded-lg mt-3">
              Manage Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
