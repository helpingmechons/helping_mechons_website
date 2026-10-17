import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getYoupiPayment, applyYoupiOutcome, isYoupiConfigured } from "@/lib/payments/youpi";

// ============================================================
// GET /api/donate/youpi/status?id=<donationId>
//
// Polled by /donate/status after the donor returns from the
// YouPI checkout. Reads OUR database; if the donation is still
// awaiting payment, it also asks the gateway directly (server-
// to-server) — a safety net in case a webhook got lost.
// Returns only the status and amount, nothing personal.
// ============================================================

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const adminSb = createAdminClient();
  const { data: donation, error } = await adminSb.from("donations").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: "Temporarily unavailable" }, { status: 503 });
  if (!donation || donation.payment_mode !== "youpi") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let status = donation.status;
  if (status === "awaiting_payment" && donation.transaction_ref && isYoupiConfigured()) {
    try {
      const payment = await getYoupiPayment(donation.transaction_ref);
      const ours = payment.metadata?.donationId === donation.id;
      if (ours) status = await applyYoupiOutcome(adminSb, donation, payment);
    } catch (err) {
      console.error("YouPI status check failed:", err.message);
    }
  }

  return NextResponse.json(
    { status, amount: Number(donation.final_amount) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
