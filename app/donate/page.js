"use client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Shield, Globe, CheckCircle, Upload, CreditCard, Smartphone, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const PLATFORM_FEE   = 0.02;
const RAZORPAY_KEY   = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_READY = Boolean(RAZORPAY_KEY);

// UPI ID — set NEXT_PUBLIC_ORG_UPI_ID=tdurgaprasad503@ybl in env
const ORG_UPI_ID = process.env.NEXT_PUBLIC_ORG_UPI_ID || "tdurgaprasad503@ybl";

export default function DonatePage() {
  const [amount,      setAmount]  = useState("500");
  const [custom,      setCustom]  = useState(false);
  // Platform fee is covered by donor by default
  const [coverFee,    setCover]   = useState(true);
  const [anon,        setAnon]    = useState(false);
  const [loading,     setLoading] = useState(false);
  const [done,        setDone]    = useState(false);
  // Razorpay is always the default mode
  const [payMode,     setPayMode] = useState("razorpay");
  const [showUPI,     setShowUPI] = useState(false);
  const [proofFile,   setProof]   = useState(null);
  const [uploading,   setUpload]  = useState(false);
  const [form, setForm] = useState({
    donor_name: "", email: "", phone: "", campaign_name: "",
    comment: "", transaction_ref: "", proof_link: "",
  });

  // Scroll to top on page mount (fixes footer "Donate Now" not scrolling)
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const numAmt = Number(amount) || 0;
  const fee    = Math.round(numAmt * PLATFORM_FEE);
  const total  = coverFee ? numAmt + fee : numAmt;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Upload payment proof screenshot to Drive
  const handleProofUpload = async (file) => {
    if (!file) return null;
    setUpload(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "proof");
      const res  = await fetch("/api/drive", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm(f => ({ ...f, proof_link: data.viewUrl }));
      toast.success("Screenshot uploaded ✓");
      return data.viewUrl;
    } catch (err) {
      toast.error("Screenshot upload failed: " + err.message);
      return null;
    } finally { setUpload(false); }
  };

  // Submit to backend
  const submitDonation = async (extraFields = {}) => {
    const res = await fetch("/api/donate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: numAmt, final_amount: total,
        fee_covered_by_donor: coverFee, is_anonymous: anon,
        ...extraFields,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Submission failed");
    return data;
  };

  // ── Razorpay flow ──
  const handleRazorpay = async () => {
    if (!form.donor_name || !form.email) { toast.error("Please enter your name and email first."); return; }
    if (numAmt < 10) { toast.error("Minimum donation is ₹10."); return; }
    setLoading(true);
    try {
      const orderRes = await fetch("/api/donate/razorpay-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) {
        // Razorpay not configured yet — show helpful message
        const isNotConfigured =
          order.error?.toLowerCase().includes("not configured") ||
          orderRes.status === 503;
        if (isNotConfigured) {
          toast.error(
            "Online payment is being set up. Please use the UPI option below or contact helpingmechons@gmail.com.",
            { duration: 6000 }
          );
          setShowUPI(true);
        } else {
          throw new Error(order.error || "Could not create order");
        }
        setLoading(false);
        return;
      }

      // Check Razorpay SDK loaded
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway failed to load. Please refresh the page or use UPI below.");
        setShowUPI(true);
        setLoading(false);
        return;
      }

      const options = {
        key:          RAZORPAY_KEY,
        amount:       order.amount,
        currency:     "INR",
        name:         "Helping Mechons",
        description:  form.campaign_name || "General Donation",
        order_id:     order.id,
        prefill: {
          name:    form.donor_name,
          email:   form.email,
          contact: form.phone,
        },
        theme:        { color: "#9a442d" },
        handler: async (response) => {
          try {
            await submitDonation({
              payment_mode:    "automated",
              transaction_ref: response.razorpay_payment_id,
              proof_link:      `razorpay:${response.razorpay_order_id}`,
            });
            setDone(true);
            toast.success("Donation successful! Receipt will be emailed shortly.");
          } catch (err) { toast.error(err.message); }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rz = new window.Razorpay(options);
      rz.on("payment.failed", (resp) => {
        toast.error("Payment failed: " + (resp.error?.description || "Unknown error"));
        setLoading(false);
      });
      rz.open();
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again or use UPI below.");
      setShowUPI(true);
      setLoading(false);
    }
  };

  // ── Manual UPI flow ──
  const handleManual = async (e) => {
    e.preventDefault();
    if (!form.donor_name || !form.email) { toast.error("Name and email are required."); return; }
    if (!form.transaction_ref) { toast.error("Please enter your UPI transaction reference."); return; }
    setLoading(true);
    try {
      let proofUrl = form.proof_link;
      if (proofFile && !proofUrl) {
        proofUrl = await handleProofUpload(proofFile);
      }
      await submitDonation({
        payment_mode: "manual",
        proof_link:   proofUrl || form.proof_link,
      });
      setDone(true);
      toast.success("Donation submitted! We'll verify within 24–48 hours.");
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
            <h2 className="font-headline-md text-headline-md text-primary mb-3">Thank You! 🙏</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Your donation of <strong>₹{total.toLocaleString("en-IN")}</strong> has been{" "}
              {payMode === "razorpay" ? "processed successfully" : "submitted for verification"}.
              A receipt will be emailed to <strong>{form.email}</strong>.
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
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">DIGNIFIED URGENCY</span>
              <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-primary leading-tight">
                Your Contribution is the Final, Vital Piece.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Every donation provides medical aid, food security, and education to those in need across India.
              </p>
              <div className="flex items-center gap-4 py-4">
                <div className="flex -space-x-3">
                  {["RM","AS","PK"].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-surface bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">{i}</div>
                  ))}
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">Joined by 1,200+ Donors</span>
              </div>
            </div>
            <div className="relative h-80 md:h-[480px] rounded-xl overflow-hidden shadow-xl">
              <Image src={getPhoto("orphanage-care")} alt="Humanitarian aid delivery" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-on-primary">
                <p className="font-headline-md text-headline-md italic">"Restoring hope, one life at a time."</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN FORM + SIDEBAR ── */}
        <section className="pb-section-padding bg-background">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

              {/* ── LEFT: Form ── */}
              <div className="lg:col-span-8 space-y-6">
                <div className="card p-8 md:p-10">
                  <h2 className="font-headline-lg text-headline-lg text-primary mb-8">Donation Details</h2>

                  {/* Step 1: Name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-6">
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
                    <div>
                      <label className="form-label">Phone (optional)</label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                        className="form-input" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="form-label">Campaign (optional)</label>
                      <select name="campaign_name" className="form-input" value={form.campaign_name} onChange={handleChange}>
                        <option value="">General Fund (where needed most)</option>
                        <option value="Emergency Medical Fund">Emergency Medical Fund</option>
                        <option value="Daily Food for 500 Families">Daily Food for 500 Families</option>
                        <option value="Education Kits — 200 Children">Education Kits — 200 Children</option>
                        <option value="Monthly Grocery Kits — Elderly">Monthly Grocery Kits — Elderly</option>
                        <option value="Orphanage Support — Vijayawada">Orphanage Support — Vijayawada</option>
                      </select>
                    </div>
                  </div>

                  {/* Step 2: Amount */}
                  <div className="mb-6">
                    <label className="form-label">Select Amount (₹)</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                      {PRESET_AMOUNTS.map(val => (
                        <button key={val} type="button"
                          onClick={() => { setAmount(String(val)); setCustom(false); }}
                          className={`py-3 rounded-lg font-label-md text-label-md font-bold border-2 transition-all ${Number(amount) === val && !custom ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface hover:border-primary"}`}>
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

                  {/* Step 3: Options */}
                  <div className="space-y-3 mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)}
                        className="mt-1 text-secondary focus:ring-secondary rounded" />
                      <span className="font-body-md text-body-md text-on-surface">Keep my donation anonymous</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={coverFee} onChange={e => setCover(e.target.checked)}
                        className="mt-1 text-secondary focus:ring-secondary rounded" />
                      <div className="font-body-md text-body-md text-on-surface">
                        I'll cover the platform fee (₹{fee})
                        <span className="font-caption text-caption text-on-surface-variant block">
                          A 2% fee applies to online payments. This is pre-checked so 100% of your ₹{numAmt.toLocaleString("en-IN")} gift reaches those in need.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="mb-8">
                    <label className="form-label">Comment or Dedication (optional)</label>
                    <textarea name="comment" rows={2} className="form-input resize-none"
                      value={form.comment} onChange={handleChange}
                      placeholder="In memory of… / In honour of…" />
                  </div>

                  {/* ── Razorpay CTA (primary) ── */}
                  <div className="space-y-4">
                    {!RAZORPAY_READY && (
                      <div className="flex items-start gap-3 p-4 bg-secondary-fixed/20 rounded-lg border border-secondary/30">
                        <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <p className="font-body-md text-body-md text-on-surface">
                          Online payment gateway is being configured. You can use the UPI option below to donate, or check back soon.
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-primary-fixed rounded-lg font-body-md text-body-md text-on-primary-fixed">
                      You will be charged <strong>₹{total.toLocaleString("en-IN")}</strong>.
                      {coverFee && <span className="font-caption text-caption block mt-1 text-on-primary-fixed-variant">Includes ₹{fee} platform fee — thank you for covering it!</span>}
                    </div>

                    <button
                      type="button"
                      onClick={handleRazorpay}
                      disabled={loading || numAmt < 10}
                      className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 flex items-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      {loading ? "Opening payment…" : `Pay ₹${total.toLocaleString("en-IN")} securely`}
                    </button>
                    <p className="font-caption text-caption text-on-surface-variant text-center">
                      Secured by Razorpay · Card / UPI / NetBanking · No card details stored with us
                    </p>
                  </div>

                  {/* ── UPI Alternative toggle ── */}
                  <div className="mt-8">
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 border-t border-outline-variant/40" />
                      <span className="font-caption text-caption text-on-surface-variant">OR</span>
                      <div className="flex-1 border-t border-outline-variant/40" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUPI(!showUPI)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-outline-variant text-on-surface-variant rounded-lg font-label-md hover:border-secondary hover:text-secondary transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      {showUPI ? "Hide UPI / Manual option" : "Donate via UPI / Bank Transfer instead"}
                    </button>
                  </div>

                  {/* ── Manual UPI form (hidden by default) ── */}
                  {showUPI && (
                    <form onSubmit={handleManual} className="space-y-4 mt-6 pt-6 border-t border-outline-variant/30">
                      <p className="font-body-md text-body-md text-on-surface">
                        <strong>Step 1:</strong> Scan the QR code on the right and pay <strong>₹{total.toLocaleString("en-IN")}</strong> to our UPI ID.<br />
                        <strong>Step 2:</strong> Paste the transaction reference below and upload the screenshot.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <div>
                          <label className="form-label">Transaction Reference # *</label>
                          <input name="transaction_ref" required value={form.transaction_ref} onChange={handleChange}
                            className="form-input" placeholder="e.g. TXN982341HM" />
                        </div>
                        <div>
                          <label className="form-label">Upload Payment Screenshot</label>
                          <label className="flex items-center gap-2 form-input cursor-pointer hover:bg-surface-container transition-colors">
                            <Upload className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                            <span className="font-body-md text-body-md text-on-surface-variant truncate">
                              {proofFile ? proofFile.name : uploading ? "Uploading…" : "Choose screenshot"}
                            </span>
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) setProof(f); }}
                              disabled={uploading} />
                          </label>
                          {form.proof_link && (
                            <p className="font-caption text-caption text-secondary mt-1">✓ Uploaded</p>
                          )}
                        </div>
                      </div>
                      <button type="submit" disabled={loading || uploading || numAmt < 10}
                        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
                        {loading ? "Submitting…" : `Submit Donation — ₹${total.toLocaleString("en-IN")}`}
                      </button>
                      <p className="font-caption text-caption text-on-surface-variant text-center">
                        Manual donations are verified within 24–48 hours. Receipt emailed after approval.
                      </p>
                    </form>
                  )}
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Shield className="w-6 h-6" />,       label: "92% Efficiency",   desc: "Your funds go directly to on-ground aid with minimal overhead." },
                    { icon: <CheckCircle className="w-6 h-6" />,  label: "Verified & Secure", desc: "Every donation is manually verified by our trusted admin team." },
                    { icon: <Globe className="w-6 h-6" />,        label: "Real Impact",       desc: "Serving communities across Visakhapatnam, Hyderabad and beyond." },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="card p-5 text-center">
                      <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-3 text-on-primary-fixed">{icon}</div>
                      <p className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-1">{label}</p>
                      <p className="font-caption text-caption text-on-surface-variant leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: QR Sidebar ── */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-primary rounded-xl p-6 text-on-primary">
                  <h3 className="font-headline-md text-headline-md mb-2">Quick Scan</h3>
                  <p className="font-body-md text-body-md text-on-primary-container mb-4">
                    Open any UPI app and scan to pay instantly.
                  </p>
                  <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center mb-4 border border-outline-variant/20 p-3">
                    {/* Use static QR from /public/qr-pay.png — place your Google Pay QR there.
                        Falls back to dynamic generation if file not present. */}
                    <img
                      src="/qr-pay.png"
                      alt="UPI QR Code — Helping Mechons"
                      className="w-full h-full object-contain rounded-lg"
                      width={250}
                      height={250}
                      onError={(e) => {
                        // Fallback: generate QR dynamically if static image missing
                        e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${ORG_UPI_ID}&pn=Helping+Mechons&cu=INR`)}`;
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>
                  <div className="space-y-2 font-body-md text-body-md border-t border-primary-container pt-4">
                    {[
                      { label: "Payee",  val: "Helping Mechons" },
                      { label: "UPI ID", val: ORG_UPI_ID },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-on-primary-container text-sm">{label}:</span>
                        <span className="font-bold text-sm">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-secondary rounded-xl">
                    <p className="font-label-md text-label-md text-on-secondary font-bold mb-1">Transparency Promise</p>
                    <p className="font-caption text-caption text-on-secondary/90 leading-relaxed">
                      Every rupee is tracked. Within 48 hours of verification you'll receive a digital receipt via email.
                    </p>
                  </div>
                </div>

                {/* Summary */}
                {numAmt > 0 && (
                  <div className="card p-6">
                    <h3 className="font-headline-md text-headline-md text-primary mb-4">Summary</h3>
                    <div className="space-y-2 font-body-md text-body-md">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Donation</span>
                        <span className="font-medium">₹{numAmt.toLocaleString("en-IN")}</span>
                      </div>
                      {coverFee && (
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Platform fee (2%)</span>
                          <span className="font-medium text-on-surface-variant">₹{fee}</span>
                        </div>
                      )}
                      <div className="border-t border-outline-variant pt-2 flex justify-between font-bold text-lg">
                        <span className="text-primary">Total</span>
                        <span className="text-secondary">₹{total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent donors */}
                <div className="card p-5">
                  <p className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-3">Recent Donors</p>
                  {[
                    { name: "Anonymous",  amt: "₹2,500", t: "2 hours ago" },
                    { name: "Priya M.",   amt: "₹500",   t: "5 hours ago" },
                    { name: "Rajesh K.",  amt: "₹1,000", t: "Yesterday"   },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">{d.name[0]}</div>
                        <div>
                          <p className="font-body-md text-body-md text-on-surface font-medium">{d.name}</p>
                          <p className="font-caption text-caption text-on-surface-variant">{d.t}</p>
                        </div>
                      </div>
                      <span className="text-secondary font-semibold font-body-md text-body-md">{d.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
