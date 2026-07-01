"use client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield, Globe, CheckCircle, CreditCard, Smartphone,
  AlertCircle, QrCode, X, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const PLATFORM_FEE   = 0.02;
const RAZORPAY_KEY   = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_READY = Boolean(RAZORPAY_KEY);
const ORG_UPI_ID     = process.env.NEXT_PUBLIC_ORG_UPI_ID || "tdurgaprasad503@ybl";

// ── Inner component (uses useSearchParams — must be inside <Suspense>) ──────
function DonateForm() {
  const searchParams = useSearchParams();

  const [amount,      setAmount]   = useState("500");
  const [custom,      setCustom]   = useState(false);
  const [coverFee,    setCover]    = useState(false);
  const [anon,        setAnon]     = useState(false);
  const [loading,     setLoading]  = useState(false);
  const [done,        setDone]     = useState(false);
  const [completedVia,setCompletedVia] = useState("manual");
  const [activeTab,   setActiveTab] = useState("manual");
  const [showQR,      setShowQR]    = useState(false);
  const [userLoaded,  setUserLoaded] = useState(false);

  // Dynamic campaigns fetched from DB
  const [campaigns,   setCampaigns] = useState([]);
  // Locked campaign (from ?campaign= URL param) — null means unrestricted
  const [lockedCampaign, setLockedCampaign] = useState(null);

  const [recentDonors, setRecentDonors] = useState([
    { name: "Anonymous", amt: "₹2,500", t: "Just now" },
    { name: "Priya M.",  amt: "₹500",   t: "5 hours ago" },
    { name: "Rajesh K.", amt: "₹1,000", t: "Yesterday" },
  ]);

  const [form, setForm] = useState({
    donor_name: "", email: "", phone: "", campaign_id: "", campaign_name: "", comment: "",
  });

  // On mount: fetch campaigns + recent donors + user data + handle URL param
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // Fetch real recent donors
    fetch("/api/donate/recent")
      .then(r => r.json())
      .then(data => { if (data.donors?.length) setRecentDonors(data.donors); })
      .catch(() => {});

    const supabase = createClient();

    // ── Auto-populate form if user is logged in ──
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      // Fetch their profile for name and phone
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, display_name, phone")
        .eq("id", user.id)
        .single();
      setForm(f => ({
        ...f,
        donor_name: profile?.full_name || profile?.display_name || f.donor_name,
        email:      user.email || f.email,
        phone:      profile?.phone || f.phone,
      }));
      setUserLoaded(true);
    });

    // Fetch active campaigns from Supabase (anon read — public RLS policy)
    supabase
      .from("campaigns")
      .select("id, title, slug")
      .eq("active", true)
      .order("created_at", { ascending: true })
      .then(({ data: camps }) => {
        if (camps?.length) {
          setCampaigns(camps);

          // Check URL param ?campaign=slug-or-id
          const param = searchParams.get("campaign");
          if (param) {
            const match = camps.find(
              c => c.slug === param || c.id === param || c.title.toLowerCase() === param.toLowerCase()
            );
            if (match) {
              setLockedCampaign(match);
              setForm(f => ({ ...f, campaign_id: match.id, campaign_name: match.title }));
            }
          }
        }
      });

    // Pre-fill amount from ?amount= URL param (set by campaign donate button)
    const amtParam = searchParams.get("amount");
    if (amtParam && Number(amtParam) >= 10) {
      setAmount(String(Math.round(Number(amtParam))));
      setCustom(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const numAmt = Number(amount) || 0;
  const fee    = Math.round(numAmt * PLATFORM_FEE);
  const total  = activeTab === "automated" && coverFee ? numAmt + fee : numAmt;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateBasics = () => {
    if (!form.donor_name || !form.email) { toast.error("Please enter your name and email first."); return false; }
    if (numAmt < 10) { toast.error("Minimum donation is ₹10."); return false; }
    return true;
  };

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
        const isNotConfigured =
          order.error?.toLowerCase().includes("not configured") || orderRes.status === 503;
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

      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway failed to load. Please refresh or use the Manual tab.");
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
        prefill: { name: form.donor_name, email: form.email, contact: form.phone },
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
            toast.success("Donation successful! Your receipt has been emailed.");
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
                : " Your receipt has been emailed to "}
              <strong>{form.email}</strong>
              {completedVia === "manual" ? " and added to your donation history." : "."}
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
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="py-section-padding bg-background">
          <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <div className="space-y-4">
              {lockedCampaign ? (
                <>
                  <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">
                    CAMPAIGN DONATION
                  </span>
                  <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-primary leading-tight">
                    {lockedCampaign.title}
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                    Your donation will go directly towards this campaign.
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">DIGNIFIED URGENCY</span>
                  <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-primary leading-tight">
                    Your Contribution is the Final, Vital Piece.
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                    Every donation provides medical aid, food security, and education to those in need across India.
                  </p>
                </>
              )}
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
                <p className="font-headline-md text-headline-md italic">&quot;Restoring hope, one life at a time.&quot;</p>
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
                  <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
                    <h2 className="font-headline-lg text-headline-lg text-primary">Donation Details</h2>
                    {userLoaded && (
                      <span className="flex items-center gap-1.5 text-caption text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Pre-filled from your account
                      </span>
                    )}
                  </div>

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

                    {/* Campaign dropdown — locked if arrived from campaign page */}
                    <div>
                      <label className="form-label flex items-center gap-1.5">
                        Campaign
                        {lockedCampaign && (
                          <span className="inline-flex items-center gap-1 text-caption text-secondary font-normal">
                            <Lock className="w-3 h-3" /> locked
                          </span>
                        )}
                      </label>
                      {lockedCampaign ? (
                        // Locked — show read-only pill; campaign_id already set in form state
                        <div className="form-input bg-surface-container-low flex items-center gap-2 cursor-not-allowed opacity-80">
                          <Lock className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                          <span className="text-on-surface font-medium">{lockedCampaign.title}</span>
                        </div>
                      ) : (
                        <select
                          name="campaign_id"
                          className="form-input"
                          value={form.campaign_id}
                          onChange={e => {
                            const id = e.target.value;
                            const match = campaigns.find(c => c.id === id);
                            setForm(f => ({ ...f, campaign_id: id, campaign_name: match?.title || "" }));
                          }}
                        >
                          <option value="">General Fund (where needed most)</option>
                          {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      )}
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
                        onFocus={() => setCustom(true)}
                        onWheel={e => e.target.blur()} />
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
                            Tap <strong>Pay Now</strong> to get a UPI QR code, scan it with any UPI app, and pay. No screenshots or reference numbers needed — just tap <strong>Done</strong> once you&apos;ve paid. Our team verifies manual donations within 24–48 hours.
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
                            I&apos;d like to additionally cover the ₹{fee} gateway fee
                            <span className="font-caption text-caption text-on-surface-variant block">
                              This box is unchecked by default — Helping Mechons absorbs the 2% gateway fee. Check this only if you&apos;d like to voluntarily cover it as well.
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
                    <li className="flex gap-3"><span className="font-bold text-secondary-container">2.</span> Choose Manual (scan &amp; pay via UPI) or Automated (card / netbanking).</li>
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
                    {lockedCampaign && (
                      <div className="flex justify-between text-body-md mb-2">
                        <span className="text-on-surface-variant">Campaign</span>
                        <span className="font-medium text-secondary text-right max-w-[60%]">{lockedCampaign.title}</span>
                      </div>
                    )}
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

      {/* ── QR Payment Popup ── */}
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
            {lockedCampaign && (
              <p className="font-label-md text-label-md text-secondary -mt-3">
                for: {lockedCampaign.title}
              </p>
            )}

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
              Open any UPI app, scan the code above, and pay <strong>₹{numAmt.toLocaleString("en-IN")}</strong>. Once you&apos;ve completed the payment, tap the button below — no screenshot or reference number needed.
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

// ── Page export wraps DonateForm in Suspense (required by Next.js for useSearchParams) ──
export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-surface-variant font-body-md">Loading…</div>
      </div>
    }>
      <DonateForm />
    </Suspense>
  );
}
