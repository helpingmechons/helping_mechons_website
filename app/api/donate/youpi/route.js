import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createYoupiPayment, isYoupiConfigured } from "@/lib/payments/youpi";

// ============================================================
// POST /api/donate/youpi — start a YouPI PG (0%-fee UPI) donation.
//
// 1. Insert the donation as 'awaiting_payment' (never approved here).
// 2. Ask our YouPI gateway for a hosted checkout session.
// 3. Return its checkoutUrl; the browser redirects there.
//
// The donation only becomes 'approved' when the gateway's signed
// webhook (or our own server-side status check) says the bank
// actually received the money — see lib/payments/youpi.js.
// ============================================================

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  if (!isYoupiConfigured()) {
    return NextResponse.json(
      { error: "Instant UPI is not configured yet. Please use the Manual (UPI / QR) option." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const donor_name = String(body.donor_name || "").trim();
    const email      = String(body.email || "").trim();
    const phone      = String(body.phone || "").trim() || null;
    const amount     = Math.round(Number(body.amount) * 100) / 100;

    if (!donor_name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 10 || amount > 1000000) {
      return NextResponse.json({ error: "Amount must be between ₹10 and ₹10,00,000." }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminSb = createAdminClient();

    let campaignId = null;
    if (body.campaign_id && UUID.test(body.campaign_id)) {
      const { data: camp } = await adminSb.from("campaigns").select("id").eq("id", body.campaign_id).maybeSingle();
      campaignId = camp?.id || null;
    }

    const { data: donation, error } = await adminSb.from("donations").insert({
      user_id:              user?.id || null,
      campaign_id:          campaignId,
      donor_name,
      email,
      phone,
      amount,
      final_amount:         amount,   // 0% gateway fee — nothing to cover
      fee_covered_by_donor: false,
      payment_mode:         "youpi",
      comment:              body.comment ? String(body.comment).slice(0, 1000) : null,
      is_anonymous:         Boolean(body.is_anonymous),
      status:               "awaiting_payment",
    }).select("id").single();

    if (error) {
      console.error("YouPI donation insert error:", error);
      return NextResponse.json({ error: "Could not start donation. Please try again." }, { status: 500 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");

    let payment;
    try {
      payment = await createYoupiPayment({
        donationId: donation.id,
        amount,
        returnUrl:  `${siteUrl}/donate/status?id=${donation.id}`,
        customer:   { fullName: donor_name, email, ...(phone ? { phoneNumber: phone } : {}) },
        metadata:   { source: "helping-mechons-website", campaignId },
      });
    } catch (gatewayErr) {
      console.error(gatewayErr.message);
      await adminSb.from("donations").delete().eq("id", donation.id).eq("status", "awaiting_payment");
      return NextResponse.json(
        { error: "The instant UPI gateway is unreachable right now. Please use the Manual (UPI / QR) option." },
        { status: 502 }
      );
    }

    await adminSb.from("donations")
      .update({ transaction_ref: payment.paymentId })
      .eq("id", donation.id);

    return NextResponse.json({ donationId: donation.id, checkoutUrl: payment.checkoutUrl }, { status: 201 });
  } catch (err) {
    console.error("YouPI create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
