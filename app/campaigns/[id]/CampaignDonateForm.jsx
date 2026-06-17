"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [100, 250, 500, 1000, 2500];

export default function CampaignDonateForm({ campaign }) {
  const [amount,  setAmount]  = useState("500");
  const [custom,  setCustom]  = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const numAmt     = Number(amount) || 0;
  const pct        = Math.min(100, Math.round(((campaign.current_amount || 0) / (campaign.goal_amount || 1)) * 100));
  const isComplete = campaign.is_completed || pct >= 100;

  const handleDonate = async (e) => {
    e.preventDefault();
    if (numAmt < 10) { toast.error("Minimum donation is ₹10"); return; }
    router.push(`/donate?campaign=${campaign.slug || campaign.id}&amount=${numAmt}`);
  };

  return (
    <div className={`card p-6 border-2 ${isComplete ? "border-secondary/60 bg-secondary-fixed/10" : "border-secondary/30 bg-surface-container-lowest"}`}>
      <h3 className="font-headline text-headline-md text-primary mb-5 flex items-center gap-2">
        <Heart className="w-5 h-5 text-secondary fill-current" />
        {isComplete ? "Goal Reached!" : "Donate to This Campaign"}
      </h3>

      {/* Goal-reached banner */}
      {isComplete && (
        <div className="flex items-start gap-3 p-4 bg-secondary rounded-xl mb-5 text-on-secondary">
          <BadgeCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">This campaign has met its goal 🎉</p>
            <p className="text-xs mt-1 text-on-secondary/80">
              Any additional donations will support our general fund and other active causes.
            </p>
          </div>
        </div>
      )}

      {/* Progress bar — only when show_public_stats is on */}
      {campaign.show_public_stats && (
        <div className="mb-5">
          <div className="flex justify-between text-caption text-on-surface-variant mb-1.5">
            <span>₹{Number(campaign.current_amount || 0).toLocaleString("en-IN")} raised</span>
            <span className={`font-semibold ${isComplete ? "text-secondary" : "text-primary"}`}>
              {pct}% {isComplete ? "✓" : ""}
            </span>
          </div>
          <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-secondary" : "bg-secondary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-caption text-on-surface-variant mt-1.5 text-right">
            Goal: ₹{Number(campaign.goal_amount || 0).toLocaleString("en-IN")}
          </p>
        </div>
      )}

      <form onSubmit={handleDonate} className="space-y-4">
        {/* Quick amounts */}
        <div>
          <p className="form-label">Select Amount</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PRESETS.map(val => (
              <button key={val} type="button"
                onClick={() => { setAmount(String(val)); setCustom(false); }}
                className={`py-2.5 rounded-lg text-label-md font-semibold transition-all border-2 ${
                  Number(amount) === val && !custom
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container text-on-surface border-outline-variant hover:border-secondary"
                }`}>
                ₹{val.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <input type="number" min="10" placeholder="Custom amount (₹)"
            className="form-input text-center font-headline text-headline-md"
            value={custom ? amount : ""}
            onChange={e => { setAmount(e.target.value); setCustom(true); }}
            onFocus={() => setCustom(true)}
          />
        </div>

        {numAmt > 0 && (
          <div className="p-3 bg-surface-container-low rounded-lg text-center">
            <p className="text-label-md text-on-surface-variant">You&apos;re donating</p>
            <p className="font-headline font-bold text-headline-lg text-secondary">₹{numAmt.toLocaleString("en-IN")}</p>
          </div>
        )}

        <button type="submit" disabled={loading || numAmt < 10}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
          {loading ? "Redirecting..." : isComplete ? "Donate Anyway →" : "Donate Now →"}
        </button>
      </form>

      <p className="text-caption text-on-surface-variant text-center mt-3">
        {isComplete
          ? "Your donation will support our general fund and other ongoing missions."
          : "You'll be taken to our secure donation page to complete the payment via UPI."}
      </p>
    </div>
  );
}
