"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

// Where donors land after the YouPI checkout. The result shown here always
// comes from our server (/api/donate/youpi/status), never from URL params.

const POLL_MS   = 3000;
const MAX_POLLS = 40; // ~2 minutes, then we stop and show the "we'll email you" state

const VIEWS = {
  approved: {
    icon: <CheckCircle className="w-8 h-8 text-secondary" />,
    title: "Thank You! 🙏",
    body: (amt) => <>Your donation of <strong>₹{amt}</strong> was received and verified. A receipt is on its way to your email.</>,
  },
  pending: {
    icon: <Clock className="w-8 h-8 text-secondary" />,
    title: "Payment Under Review",
    body: () => <>We couldn&apos;t auto-confirm your payment yet. If money left your account, don&apos;t worry: our team will check the bank statement and email your receipt within 24–48 hours.</>,
  },
  rejected: {
    icon: <XCircle className="w-8 h-8 text-error" />,
    title: "Payment Not Completed",
    body: () => <>This UPI checkout was cancelled or expired before any payment was confirmed. No money was taken by us.</>,
  },
  awaiting_payment: {
    icon: <Loader2 className="w-8 h-8 text-secondary animate-spin" />,
    title: "Confirming Your Payment…",
    body: () => <>We&apos;re waiting for the bank to confirm your UPI payment. This usually takes a few seconds. You can keep this page open.</>,
  },
};

function StatusView() {
  const id = useSearchParams().get("id");
  const [state, setState] = useState({ status: "awaiting_payment", amount: null, error: null, gaveUp: false });

  useEffect(() => {
    if (!id) { setState(s => ({ ...s, error: "Missing donation reference." })); return; }
    let polls = 0;
    let timer;
    let cancelled = false;

    const check = async () => {
      polls += 1;
      try {
        const res  = await fetch(`/api/donate/youpi/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setState(s => ({ ...s, error: data.error || "Donation not found." })); return; }
        setState(s => ({ ...s, status: data.status, amount: data.amount }));
        if (data.status !== "awaiting_payment") return;
      } catch {
        // Flaky connection — just try again on the next tick.
      }
      if (polls >= MAX_POLLS) { setState(s => ({ ...s, gaveUp: true })); return; }
      timer = setTimeout(check, POLL_MS);
    };
    check();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [id]);

  const view = state.gaveUp && state.status === "awaiting_payment" ? VIEWS.pending : VIEWS[state.status] || VIEWS.pending;
  const amt  = state.amount != null ? state.amount.toLocaleString("en-IN") : "—";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full card p-10 text-center">
        <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
          {state.error ? <XCircle className="w-8 h-8 text-error" /> : view.icon}
        </div>
        <h2 className="font-headline-md text-headline-md text-primary mb-3">
          {state.error ? "Something Went Wrong" : view.title}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">
          {state.error || view.body(amt)}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          {(state.status === "rejected" || state.error) && (
            <Link href="/donate" className="btn-primary inline-flex justify-center">Try Again</Link>
          )}
          <Link href="/" className={state.status === "rejected" || state.error ? "btn-ghost inline-flex justify-center" : "btn-primary inline-flex justify-center"}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function DonationStatusPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<main className="min-h-screen bg-background" />}>
        <StatusView />
      </Suspense>
      <Footer />
    </>
  );
}
