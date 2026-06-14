"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [100, 250, 500, 1000, 2500];

export default function CampaignDonateForm({ campaign }) {
  const [amount,  setAmount]  = useState("500");
  const [custom,  setCustom]  = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const numAmt = Number(amount) || 0;

  const handleDonate = async (e) => {
    e.preventDefault();
    if (numAmt < 10) { toast.error("Minimum donation is ₹10"); return; }
    // Redirect to donate page with campaign pre-filled
    router.push(`/donate?campaign=${campaign.slug || campaign.id}&amount=${numAmt}`);
  };

  return (
    <div className="card p-6 border-2 border-secondary/30 bg-surface-container-lowest">
      <h3 className="font-headline text-headline-md text-primary mb-5 flex items-center gap-2">
        <Heart className="w-5 h-5 text-secondary fill-current" />
        Donate to This Campaign
      </h3>

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
            <p className="text-label-md text-on-surface-variant">You're donating</p>
            <p className="font-headline font-bold text-headline-lg text-secondary">₹{numAmt.toLocaleString("en-IN")}</p>
          </div>
        )}

        <button type="submit" disabled={loading || numAmt < 10}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
          {loading ? "Redirecting..." : "Donate Now →"}
        </button>
      </form>

      <p className="text-caption text-on-surface-variant text-center mt-3">
        You'll be taken to our secure donation page to complete the payment via UPI.
      </p>
    </div>
  );
}
