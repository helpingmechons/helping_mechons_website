import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyYoupiSignature, applyYoupiOutcome, donationIdFromOrderId } from "@/lib/payments/youpi";

// ============================================================
// POST /api/donate/youpi/webhook — server-to-server callback
// from our YouPI PG gateway. Set this URL as the "Webhook URL"
// in the YouPI Merchant Admin panel.
//
// Security: the HMAC is computed over the RAW body bytes before
// any JSON parsing, exactly as YouPI signs it. Anything without
// a valid signature is rejected.
//
// Always answers 2xx once the signature is valid (even for
// unknown orders), otherwise YouPI keeps retrying for an hour.
// ============================================================

export const dynamic = "force-dynamic";

export async function POST(request) {
  const rawBody   = await request.text();
  const signature = request.headers.get("x-gateway-signature") || "";

  if (!verifyYoupiSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const donationId = payload.metadata?.donationId || donationIdFromOrderId(payload.orderId);
  if (!donationId) {
    console.warn("YouPI webhook for an order that isn't ours:", payload.orderId);
    return NextResponse.json({ received: true, ignored: "unknown order" });
  }

  try {
    const adminSb = createAdminClient();
    const { data: donation, error: fetchErr } = await adminSb.from("donations").select("*").eq("id", donationId).maybeSingle();
    if (fetchErr) throw new Error(`donation lookup failed: ${fetchErr.message}`); // → 500, YouPI retries
    if (!donation) {
      console.warn("YouPI webhook: donation not found", donationId);
      return NextResponse.json({ received: true, ignored: "donation not found" });
    }

    const status = await applyYoupiOutcome(adminSb, donation, payload);
    return NextResponse.json({ received: true, status });
  } catch (err) {
    // 5xx → YouPI retries with backoff (5s, 30s, 2m, 10m, 1h).
    console.error("YouPI webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
