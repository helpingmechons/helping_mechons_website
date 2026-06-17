"use client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield, Globe, CheckCircle, CreditCard, Smartphone,
  AlertCircle, QrCode, X,
} from "lucide-react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const PLATFORM_FEE   = 0.02;
const RAZORPAY_KEY   = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_READY = Boolean(RAZORPAY_KEY);

// UPI ID — set NEXT_PUBLIC_ORG_UPI_ID=tdurgaprasad503@ybl in env
const ORG_UPI_ID = process.env.NEXT_PUBLIC_ORG_UPI_ID || "tdurgaprasad503@ybl";

export default function DonatePage() {
  const [amount,      setAmount]   = useState("500");
  const [custom,      setCustom]   = useState(false);
  // Gateway fee is absorbed by Helping Mechons by default — donor can opt in (automated tab only)
  const [coverFee,    setCover]    = useState(false);
  const [anon,        setAnon]     = useState(false);
  const [loading,     setLoading]  = useState(false);
  const [done,        setDone]     = useState(false);
  const [completedVia,setCompletedVia] = useState("manual");
  // Two separate tabs — Manual is the default landing tab
  const [activeTab,   setActiveTab] = useState("manual");
  const [showQR,      setShowQR]    = useState(false);
  const [recentDonors, setRecentDonors] = useState([
    { name: "Anonymous", amt: "₹2,500", t: "Just now" },
    { name: "Priya M.",  amt: "₹500",   t: "5 hours ago" },
    { name: "Rajesh K.", amt: "₹1,000", t: "Yesterday" },
  ]);
  const [form, setForm] = useState({
    donor_name: "", email: "", phone: "", campaign_name: "", comment: "",
  });

  // Scroll to top on page mount (fixes footer "Donate Now" not scrolling)
  // Also fetch real recent donors from DB
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetch("/api/donate/recent")
      .then(r => r.json())
      .then(data => { if (data.donors?.length) setRecentDonors(data.donors); })
      .catch(() => {}); // fail silently — keeps placeholder data
  }, []);

  const numAmt = Number(amount) || 0;
  const fee    = Math.round(numAmt * PLATFORM_FEE);
  // The fee only ever applies on the Automated (online gateway) tab, and only if the donor opts in
  const total  = activeTab === "automated" && coverFee ? numAmt + fee : numAmt;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateBasics = () => {
    if (!form.donor_name || !form.email) { toast.error("Please enter your name and email first."); return false; }
    if (numAmt < 10) { toast.error("Minimum donation is ₹10."); return false; }
    return true;
  };

  // Submit to backend
  const submitDonation = async (extraFields = {}) => {
    const res = await fetch("/api/donate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: numAmt, final_amount: total,
        fee_covered_by_donor: activeTab === "automated" && coverFee,
        is_anonymous: anon,
        ...extraFields,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Submission failed");
    return data;
  };

  // ── Automated (Razorpay) flow ──
  const handleRazorpay = async () => {
    if (!validateBasics()) return;
    setLoading(true);
    try {
      const orderRes = await fetch("/api/donate/razorpay-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) {
        // Razorpay not configured yet — point them to the Manual tab
        const isNotConfigured =
          order.error?.toLowerCase().includes("not configured") ||
          orderRes.status === 503;
        if (isNotConfigured) {
          toast.error(
            "Online payment is being set up. Please use the Manual (UPI) tab below or contact helpingmechons@gmail.com.",
            { duration: 6000 }
          );
          setActiveTab("manual");
        } else {
          throw new Error(order.error || "Could not create order");
        }
        setLoading(false);
        return;
      }

      // Check Razorpay SDK loaded
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway failed to load. Please refresh the page or use the Manual tab.");
        setActiveTab("manual");
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
            setCompletedVia("automated");
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
      toast.error(err.message || "Something went wrong. Please try again or use the Manual tab.");
      setActiveTab("manual");
      setLoading(false);
    }
  };

  // ── Manual (UPI / QR) flow ──
  const openQRModal = () => {
    if (!validateBasics()) return;
    setShowQR(true);
  };

  const handleManualDone = async () => {
    setLoading(true);
    try {
      await submitDonation({ payment_mode: "manual" });
      setShowQR(false);
      setCompletedVia("manual");
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
              {completedVia === "automated" ? "processed successfully" : "submitted for verification"}.
              {completedVia === "manual"
                ? " Once our admin team approves it, a receipt will be emailed to "
                : " A receipt will be emailed to "}
              <strong>{form.email}</strong>{completedVia === "manual" ? " and added to your donation history." : "."}
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
                  <div className="space-y-3 mb-8">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)}
                        className="mt-1 text-secondary focus:ring-secondary rounded" />
                      <span className="font-body-md text-body-md text-on-surface">Keep my donation anonymous</span>
                    </label>
                  </div>

                  <div className="mb-8">
                    <label className="form-label">Comment or Dedication (optional)</label>
                    <textarea name="comment" rows={2} className="form-input resize-none"
                      value={form.comment} onChange={handleChange}
                      placeholder="In memory of… / In honour of…" />
                  </div>

                  {/* ── Payment Method Tabs ── */}
                  <div>
                    <label className="form-label mb-2 block">Choose Payment Method</label>
                    <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab("manual")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                          activeTab === "manual" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <Smartphone className="w-4 h-4" /> Manual (UPI / QR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("automated")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                          activeTab === "automated" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" /> Automated (Card / NetBanking)
                      </button>
                    </div>

                    {/* ── Manual tab ── */}
                    {activeTab === "manual" && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
                          <QrCode className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <p className="font-body-md text-body-md text-on-surface">
                            Tap <strong>Pay Now</strong> to get a UPI QR code, scan it with any UPI app, and pay. No screenshots or reference numbers needed — just tap <strong>Done</strong> once you've paid. Our team verifies manual donations within 24–48 hours.
                          </p>
                        </div>
                        <div className="p-4 bg-primary-fixed rounded-lg font-body-md text-body-md text-on-primary-fixed">
                          You will pay <strong>₹{numAmt.toLocaleString("en-IN")}</strong> — no gateway fee applies to manual payments.
                        </div>
                        <button
                          type="button"
                          onClick={openQRModal}
                          disabled={numAmt < 10}
                          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 flex items-center gap-2"
                        >
                          <Smartphone className="w-5 h-5" />
                          Pay ₹{numAmt.toLocaleString("en-IN")} via UPI
                        </button>
                        <p className="font-caption text-caption text-on-surface-variant text-center">
                          Manual donations are verified within 24–48 hours. Receipt emailed after approval.
                        </p>
                      </div>
                    )}

                    {/* ── Automated tab ── */}
                    {activeTab === "automated" && (
                      <div className="space-y-4">
                        {!RAZORPAY_READY && (
                          <div className="flex items-start gap-3 p-4 bg-secondary-fixed/20 rounded-lg border border-secondary/30">
                            <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <p className="font-body-md text-body-md text-on-surface">
                              Online payment gateway is being configured. You can use the Manual tab to donate, or check back soon.
                            </p>
                          </div>
                        )}

                        <label className="flex items-start gap-3 cursor-pointer p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
                          <input type="checkbox" checked={coverFee} onChange={e => setCover(e.target.checked)}
                            className="mt-1 text-secondary focus:ring-secondary rounded" />
                          <div className="font-body-md text-body-md text-on-surface">
                            I'd like to additionally cover the ₹{fee} gateway fee
                            <span className="font-caption text-caption text-on-surface-variant block">
                              This box is unchecked by default — Helping Mechons absorbs the 2% payment-gateway fee ourselves, not the donor. Check this only if you'd like to voluntarily cover it as well.
                            </span>
                          </div>
                        </label>

                        <div className="p-4 bg-primary-fixed rounded-lg font-body-md text-body-md text-on-primary-fixed">
                          You will be charged <strong>₹{total.toLocaleString("en-IN")}</strong>.
                          {coverFee && <span className="font-caption text-caption block mt-1 text-on-primary-fixed-variant">Includes ₹{fee} gateway fee — thank you for covering it!</span>}
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
                    )}
                  </div>
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

              {/* ── RIGHT: Sidebar ── */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-primary rounded-xl p-6 text-on-primary">
                  <h3 className="font-headline-md text-headline-md mb-2">How It Works</h3>
                  <ul className="space-y-3 font-body-md text-body-md text-on-primary-container">
                    <li className="flex gap-3"><span className="font-bold text-secondary-container">1.</span> Fill in your details and pick an amount.</li>
                    <li className="flex gap-3"><span className="font-bold text-secondary-container">2.</span> Choose Manual (scan & pay via UPI) or Automated (card / netbanking).</li>
                    <li className="flex gap-3"><span className="font-bold text-secondary-container">3.</span> Manual donations are verified by our admin team; automated ones confirm instantly.</li>
                  </ul>
                  <div className="mt-4 p-4 bg-secondary rounded-xl">
                    <p className="font-label-md text-label-md text-on-secondary font-bold mb-1">Transparency Promise</p>
                    <p className="font-caption text-caption text-on-secondary/90 leading-relaxed">
                      Every rupee is tracked. Once verified, a digital receipt is emailed and added to your donation history.
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
                      {activeTab === "automated" && coverFee && (
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Gateway fee (2%)</span>
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
                  {recentDonors.map((d, i) => (
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

      {/* ── QR Payment Popup (Manual tab) ── */}
      {showQR && (
        <div
          className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4"
          onClick={() => !loading && setShowQR(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => !loading && setShowQR(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-headline-md text-headline-md text-primary">
              Scan &amp; Pay ₹{numAmt.toLocaleString("en-IN")}
            </h3>

            <div className="w-56 h-56 mx-auto bg-white rounded-xl flex items-center justify-center border border-outline-variant/30 p-3">
              <img
                src="/qr-pay.png"
                alt="UPI QR Code — Helping Mechons"
                className="w-full h-full object-contain rounded-lg"
                width={224}
                height={224}
                onError={(e) => {
                  e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${ORG_UPI_ID}&pn=Helping+Mechons&am=${numAmt}&cu=INR`)}`;
                  e.currentTarget.onerror = null;
                }}
              />
            </div>

            <div className="space-y-1 font-body-md text-body-md">
              <p className="text-on-surface-variant">Payee</p>
              <p className="font-bold text-on-surface">Helping Mechons</p>
              <p className="text-on-surface-variant mt-2">UPI ID</p>
              <p className="font-bold text-on-surface">{ORG_UPI_ID}</p>
            </div>

            <p className="font-body-md text-body-md text-on-surface bg-surface-container-low rounded-lg p-4">
              Open any UPI app, scan the code above, and pay <strong>₹{numAmt.toLocaleString("en-IN")}</strong>. Once you've completed the payment, tap the button below — no screenshot or reference number needed.
            </p>

            <button
              onClick={handleManualDone}
              disabled={loading}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
            >
              {loading ? "Submitting…" : "I've Paid — Done"}
            </button>
            <button
              onClick={() => !loading && setShowQR(false)}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
