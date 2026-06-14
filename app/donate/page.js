"use client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Shield, Globe, CheckCircle, Info, Users } from "lucide-react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const PLATFORM_FEE = 0.02;

export default function DonatePage() {
  const [amount,   setAmount]  = useState("500");
  const [custom,   setCustom]  = useState(false);
  const [coverFee, setCover]   = useState(true);
  const [anon,     setAnon]    = useState(false);
  const [loading,  setLoading] = useState(false);
  const [done,     setDone]    = useState(false);
  const [form, setForm] = useState({
    donor_name: "", email: "", phone: "", campaign_name: "",
    comment: "", transaction_ref: "", proof_link: "",
  });

  const numAmt = Number(amount) || 0;
  const fee    = Math.round(numAmt * PLATFORM_FEE);
  const total  = coverFee ? numAmt + fee : numAmt;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.donor_name || !form.email) { toast.error("Name and email are required."); return; }
    if (!form.transaction_ref) { toast.error("Please enter your UPI transaction reference."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: numAmt, final_amount: total, fee_covered_by_donor: coverFee, is_anonymous: anon, payment_mode: "manual" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setDone(true);
      toast.success("Donation submitted! You'll receive an email shortly.");
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full card p-10 text-center">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="font-headline text-headline-md text-primary mb-3">Thank You! 🙏</h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Your donation of <strong>₹{total.toLocaleString("en-IN")}</strong> has been submitted. Our team will verify within 24–48 hours and send a receipt to <strong>{form.email}</strong>.
            </p>
            <Link href="/" className="btn-primary inline-flex mt-4">Back to Home</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO: 2-column — text LEFT + image RIGHT ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-md">DIGNIFIED URGENCY</span>
              <h1 className="font-headline text-headline-xl-mobile md:text-headline-xl text-primary leading-tight">
                Your Contribution is the Final, Vital Piece.
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-xl">
                Every donation provides medical aid, food security, and education to those in need.
                Together, we restore stability and dignity to communities across India.
              </p>
              <div className="flex items-center gap-4 py-4">
                <div className="flex -space-x-3">
                  {["RM", "AS", "PK"].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-label-md text-on-surface-variant">Joined by 1,200+ Donors & Partners</span>
              </div>
            </div>
            <div className="relative h-80 md:h-[480px] rounded-2xl overflow-hidden shadow-xl">
              <Image src=getPhoto("orphanage-care") alt="Humanitarian aid delivery" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-on-primary">
                <p className="font-headline text-headline-md italic">"Restoring hope, one life at a time."</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN FORM + QR SIDEBAR ── */}
        <section className="pb-section-padding bg-background">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

              {/* ── LEFT: Form (8-col) ── */}
              <div className="lg:col-span-8 space-y-6">
                <div className="card p-8 md:p-10">
                  <h2 className="font-headline text-headline-lg text-primary mb-8">Donation Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                      <div>
                        <label className="form-label">Full Name *</label>
                        <input name="donor_name" required value={form.donor_name} onChange={handleChange}
                          className="form-input" placeholder="Rahul Sharma" />
                      </div>
                      <div>
                        <label className="form-label">Email Address *</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange}
                          className="form-input" placeholder="rahul@example.com" />
                      </div>
                    </div>

                    {/* Amount presets */}
                    <div>
                      <label className="form-label">Select Amount (₹)</label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                        {PRESET_AMOUNTS.map(val => (
                          <button key={val} type="button"
                            onClick={() => { setAmount(String(val)); setCustom(false); }}
                            className={`py-3 rounded-lg text-label-md font-bold border-2 transition-all ${Number(amount) === val && !custom ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface hover:border-primary"}`}>
                            ₹{val.toLocaleString("en-IN")}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">₹</span>
                        <input type="number" min="10" placeholder="Custom amount"
                          className="form-input pl-8"
                          value={custom ? amount : ""}
                          onChange={e => { setAmount(e.target.value); setCustom(true); }}
                          onFocus={() => setCustom(true)} />
                      </div>
                    </div>

                    {/* Campaign dropdown */}
                    <div>
                      <label className="form-label">Designated Campaign</label>
                      <select name="campaign_name" className="form-input" value={form.campaign_name} onChange={handleChange}>
                        <option value="">General Fund (Where it's needed most)</option>
                        <option value="Emergency Medical Fund">Emergency Medical Fund</option>
                        <option value="Daily Food for 500 Families">Daily Food for 500 Families</option>
                        <option value="Education Kits — 200 Children">Education Kits — 200 Children</option>
                        <option value="Monthly Grocery Kits — Elderly">Monthly Grocery Kits — Elderly</option>
                        <option value="Orphanage Support — Vijayawada">Orphanage Support — Vijayawada</option>
                      </select>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)}
                          className="mt-1 text-secondary focus:ring-secondary rounded" />
                        <span className="text-body-md text-on-surface">I want my donation to be anonymous</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={coverFee} onChange={e => setCover(e.target.checked)}
                          className="mt-1 text-secondary focus:ring-secondary rounded" />
                        <span className="text-body-md text-on-surface">
                          Cover transaction fees (Add ₹{fee} to help us keep 100% of your gift for the mission)
                        </span>
                      </label>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="form-label">Comment or Dedication (Optional)</label>
                      <textarea name="comment" rows={3} className="form-input resize-none"
                        value={form.comment} onChange={handleChange}
                        placeholder="In memory of... / In honour of..." />
                    </div>

                    {/* Manual verification */}
                    <div>
                      <h3 className="font-headline font-semibold text-primary text-body-lg mb-4">Manual Payment Verification</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <div>
                          <label className="form-label">Transaction Reference # *</label>
                          <input name="transaction_ref" required value={form.transaction_ref} onChange={handleChange}
                            className="form-input" placeholder="TXN-982341-HM" />
                        </div>
                        <div>
                          <label className="form-label">Upload Proof Link (Google Drive)</label>
                          <input name="proof_link" type="url" value={form.proof_link} onChange={handleChange}
                            className="form-input" placeholder="https://drive.google.com/..." />
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={loading || numAmt < 10}
                      className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
                      {loading ? "Submitting..." : `Complete Donation — ₹${total.toLocaleString("en-IN")}`}
                    </button>
                  </form>
                </div>

                {/* ── Trust strip (3-card) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Shield className="w-6 h-6" />, label: "92% Efficiency",   desc: "Your funds go directly to on-ground aid with minimal overhead." },
                    { icon: <CheckCircle className="w-6 h-6" />, label: "Secure Transfer", desc: "Every donation is manually verified by our trusted admin team." },
                    { icon: <Globe className="w-6 h-6" />, label: "Real Impact",       desc: "Serving communities across Hyderabad, Visakhapatnam and beyond." },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="card p-5 text-center">
                      <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-3 text-on-primary-fixed">
                        {icon}
                      </div>
                      <p className="text-label-md text-on-surface uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-caption text-on-surface-variant leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: QR Sidebar (4-col) ── */}
              <div className="lg:col-span-4 space-y-6">
                {/* QR + UPI info */}
                <div className="bg-primary rounded-2xl p-6 text-on-primary">
                  <h3 className="font-headline font-semibold text-headline-md mb-2">Quick Scan Donation</h3>
                  <p className="text-body-md text-on-primary-container mb-4">
                    Open your banking or payment app and scan the QR code below for an instant transfer.
                  </p>
                  {/* UPI QR code — auto-generated from UPI ID */}
                  <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center mb-4 border border-outline-variant/20 p-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_ORG_UPI_ID || "helpingmechons@upi")}&pn=Helping%20Mechons%20Trust&cu=INR`}
                      alt="UPI QR Code — Helping Mechons"
                      className="w-full h-full object-contain rounded-lg"
                      width={250}
                      height={250}
                    />
                  </div>
                  <div className="space-y-2 text-body-md border-t border-primary-container pt-4">
                    {[
                      { label: "Payee",  val: "Helping Mechons Trust" },
                      { label: "UPI ID", val: process.env.NEXT_PUBLIC_ORG_UPI_ID || "helpingmechons@upi" },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-on-primary-container text-sm">{label}:</span>
                        <span className="text-on-primary font-bold text-sm">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-secondary rounded-xl">
                    <p className="text-label-md text-on-secondary font-bold mb-1">Transparency Promise</p>
                    <p className="text-caption text-on-secondary/90 leading-relaxed">
                      Every dollar is tracked. Within 48 hours of verification, you will receive a digital receipt and impact certificate via email.
                    </p>
                  </div>
                </div>

                {/* Donation summary */}
                {numAmt > 0 && (
                  <div className="card p-6">
                    <h3 className="font-headline font-semibold text-primary mb-4">Summary</h3>
                    <div className="space-y-2 text-body-md">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Donation</span>
                        <span className="font-medium">₹{numAmt.toLocaleString("en-IN")}</span>
                      </div>
                      {coverFee && (
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Platform fee (2%)</span>
                          <span className="font-medium">₹{fee}</span>
                        </div>
                      )}
                      <div className="border-t border-outline-variant/30 pt-2 flex justify-between font-bold text-lg">
                        <span className="text-primary">Total</span>
                        <span className="text-secondary">₹{total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent donors */}
                <div className="card p-5">
                  <p className="font-semibold text-on-surface text-sm mb-3">Recent Donors</p>
                  {[
                    { name: "Anonymous",  amt: "₹2,500", t: "2 hours ago"  },
                    { name: "Priya M.",   amt: "₹500",   t: "5 hours ago"  },
                    { name: "Rajesh K.",  amt: "₹1,000", t: "Yesterday"    },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">
                          {d.name[0]}
                        </div>
                        <div>
                          <p className="text-sm text-on-surface font-medium">{d.name}</p>
                          <p className="text-xs text-on-surface-variant">{d.t}</p>
                        </div>
                      </div>
                      <span className="text-secondary font-semibold text-sm">{d.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Mobile sticky donate button ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-outline-variant/30 shadow-lift">
        <button type="submit" form="donationForm"
          className="btn-primary w-full justify-center py-3 text-base">
          <Heart className="w-4 h-4" /> Donate Now
        </button>
      </div>

      <Footer />
    </>
  );
}
