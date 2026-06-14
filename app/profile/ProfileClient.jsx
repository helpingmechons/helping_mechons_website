"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Download, Edit3, Lock, LogOut, CheckCircle, Clock, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STATUS = {
  approved: { class: "badge-approved", icon: <CheckCircle className="w-3 h-3" />, label: "Allocated" },
  pending:  { class: "badge-pending",  icon: <Clock className="w-3 h-3" />,        label: "Pending"   },
  rejected: { class: "badge-rejected", icon: <XCircle className="w-3 h-3" />,      label: "Rejected"  },
};

const ACHIEVEMENTS = [
  { icon: "🏥", label: "First Responder",  sublabel: "Emergency Aid Hero",     unlocked: true  },
  { icon: "🍛", label: "Nutrient Guard",   sublabel: "500+ Meals Provided",    unlocked: true  },
  { icon: "📚", label: "Edu-Catalyst",     sublabel: "Literacy Campaigner",    unlocked: true  },
  { icon: "💧", label: "Water Guardian",   sublabel: "Unlock at ₹15k",         unlocked: false },
];

export default function ProfileClient({ user, profile, donations, totalApproved }) {
  const [tab,      setTab]      = useState("history");
  const [editForm, setEditForm] = useState({ full_name: profile?.full_name || "", phone: profile?.phone || "", display_name: profile?.display_name || "" });
  const [pwForm,   setPwForm]   = useState({ newPwd: "", confirm: "" });
  const [saving,   setSaving]   = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: editForm.full_name, phone: editForm.phone, display_name: editForm.display_name }).eq("id", user.id);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); router.refresh(); }
    setSaving(false);
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPwd.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (pwForm.newPwd !== pwForm.confirm) { toast.error("Passwords don't match."); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPwd });
    if (error) toast.error(error.message);
    else { toast.success("Password changed!"); setPwForm({ newPwd: "", confirm: "" }); }
    setSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const tabs = [
    { id: "history",  label: "Donation History", icon: <Heart className="w-4 h-4" />  },
    { id: "edit",     label: "Edit Profile",      icon: <Edit3 className="w-4 h-4" />  },
    { id: "password", label: "Security",          icon: <Lock className="w-4 h-4" />   },
  ];

  return (
    <main className="bg-background min-h-screen">

      {/* ── Profile hero*/}
      <section className="bg-background border-b border-outline-variant/30 py-8">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-headline font-bold text-2xl flex-shrink-0">
              {(profile?.full_name || user.email)?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-headline text-headline-lg text-primary">{profile?.full_name || "Donor"}</h1>
              <p className="text-body-md text-on-surface-variant">
                Supporter since {new Date(user.created_at || Date.now()).toLocaleString("en-IN", { month: "long", year: "numeric" })}
                <span className="ml-2 badge bg-secondary-fixed text-on-secondary-fixed text-xs">Lifetime Donor</span>
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setTab("edit")} className="btn-primary py-2.5 px-5 text-sm">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button className="flex items-center gap-2 border-2 border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-lg text-label-md hover:border-primary hover:text-primary transition-all text-sm">
                <Download className="w-4 h-4" /> Download Tax Receipt
              </button>
            </div>
          </div>

          {/* 3-stat cards*/}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="stat-card">
              <p className="text-caption text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3" /> Total Contributions
              </p>
              <p className="font-headline font-bold text-headline-xl-mobile text-primary">
                ₹{Number(totalApproved).toLocaleString("en-IN")}
              </p>
              <p className="text-caption text-on-surface-variant mt-1">
                Supporting {donations.filter(d => d.status === "approved").length} verified donations
              </p>
            </div>
            <div className="stat-card">
              <p className="text-caption text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next Monthly Gift
              </p>
              <p className="font-headline font-bold text-headline-xl-mobile text-primary">
                {new Date(Date.now() + 15 * 86400000).toLocaleString("en-IN", { day: "numeric", month: "short" })}
              </p>
              <p className="text-caption text-on-surface-variant mt-1">₹500 · via UPI</p>
            </div>
            <div className="stat-card bg-primary text-on-primary">
              <p className="text-caption text-secondary-container uppercase tracking-wider mb-1">Impact Multiplier</p>
              <p className="font-headline font-bold text-headline-xl-mobile text-secondary-container">2.4x</p>
              <p className="text-caption text-on-primary-container mt-1">Your donations matched by institutional partners.</p>
            </div>
          </div>

          {/* ── Impact Achievements*/}
          <div>
            <h2 className="font-headline font-semibold text-primary mb-4">Your Impact Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map(({ icon, label, sublabel, unlocked }) => (
                <div key={label} className={`card p-4 text-center transition-all ${unlocked ? "border-secondary/30" : "opacity-50"}`}>
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-xl ${
                    label === "First Responder" ? "bg-secondary-fixed" :
                    label === "Nutrient Guard"  ? "bg-primary-fixed"   :
                    label === "Edu-Catalyst"    ? "bg-tertiary-fixed"  : "bg-surface-container-high"
                  }`}>
                    {icon}
                  </div>
                  <p className="text-body-md font-semibold text-on-surface text-sm">{label}</p>
                  <p className="text-caption text-on-surface-variant mt-0.5">{sublabel}</p>
                  {!unlocked && <p className="text-caption text-secondary mt-1">Locked</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <section className="py-10">
        <div className="section-container max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-1 mb-8 border-b border-outline-variant/30">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-label-md font-medium border-b-2 -mb-px transition-all ${tab === t.id ? "border-secondary text-secondary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>
                {t.icon} {t.label}
              </button>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 text-label-md font-medium text-on-surface-variant hover:text-secondary transition-colors ml-auto">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* History */}
          {tab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-headline font-semibold text-primary">Recent Donations</h3>
                <button className="text-secondary text-label-md hover:opacity-80">View All Records</button>
              </div>
              {donations.length === 0 ? (
                <div className="card p-12 text-center">
                  <Heart className="w-10 h-10 text-outline-variant mx-auto mb-4" />
                  <h3 className="font-headline text-headline-md text-primary mb-2">No donations yet</h3>
                  <p className="text-body-md text-on-surface-variant mb-6">Make your first donation and help change a life.</p>
                  <a href="/donate" className="btn-primary inline-flex">Donate Now</a>
                </div>
              ) : donations.map(d => {
                const s = STATUS[d.status] || STATUS.pending;
                return (
                  <div key={d.id} className="card p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-on-primary-fixed" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{d.is_anonymous ? "Anonymous Donation" : d.donor_name}</p>
                        <p className="text-caption text-on-surface-variant mt-0.5">
                          {new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          {d.transaction_ref ? ` · ${d.transaction_ref}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <p className="font-headline font-bold text-headline-md text-secondary">₹{Number(d.final_amount || d.amount).toLocaleString("en-IN")}</p>
                      <span className={`badge ${s.class} flex items-center gap-1`}>{s.icon} {s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit */}
          {tab === "edit" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-8">
                <h2 className="font-headline text-headline-md text-primary mb-6">Edit Profile</h2>
                <form onSubmit={handleEditSave} className="space-y-5">
                  <div><label className="form-label">Full Name</label><input className="form-input" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                  <div><label className="form-label">Display Name</label><input className="form-input" value={editForm.display_name} placeholder="e.g. Rahul K." onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))} /></div>
                  <div><label className="form-label">Phone</label><input className="form-input" type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><label className="form-label">Email (cannot be changed)</label><input className="form-input opacity-60 cursor-not-allowed" value={user.email} disabled /></div>
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button>
                </form>
              </div>

              {/* Security settings — right panel */}
              <div className="card p-8">
                <h2 className="font-headline text-headline-md text-primary mb-6">Security Settings</h2>
                <form onSubmit={handlePwChange} className="space-y-5">
                  <div><label className="form-label">Current Password</label><input type="password" className="form-input" placeholder="••••••••" disabled /></div>
                  <div><label className="form-label">New Password</label><input type="password" className="form-input" value={pwForm.newPwd} placeholder="Min. 8 characters" onChange={e => setPwForm(f => ({ ...f, newPwd: e.target.value }))} /></div>
                  <div><label className="form-label">Confirm Password</label><input type="password" className="form-input" value={pwForm.confirm} placeholder="Repeat new password" onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
                  <button type="submit" disabled={saving} className="w-full py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-on-primary transition-all disabled:opacity-60">
                    {saving ? "Updating..." : "Update Security"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Password-only tab */}
          {tab === "password" && (
            <div className="card p-8 max-w-lg">
              <h2 className="font-headline text-headline-md text-primary mb-6">Change Password</h2>
              <form onSubmit={handlePwChange} className="space-y-5">
                <div><label className="form-label">New Password</label><input type="password" className="form-input" value={pwForm.newPwd} placeholder="Min. 8 characters" onChange={e => setPwForm(f => ({ ...f, newPwd: e.target.value }))} /></div>
                <div><label className="form-label">Confirm</label><input type="password" className="form-input" value={pwForm.confirm} placeholder="Repeat" onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Updating..." : "Update Password"}</button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
