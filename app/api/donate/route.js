import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, donationReceivedEmail, donationApprovedEmail } from "@/lib/email/mailer";
import { verifyRazorpayPayment } from "@/lib/payments/razorpay";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      donor_name, email, phone, fee_covered_by_donor,
      payment_mode, comment, is_anonymous,
      campaign_id, campaign_name,
    } = body;
    let { amount, final_amount, transaction_ref, proof_link } = body;

    if (!donor_name || !email || !amount) {
      return NextResponse.json({ error: "donor_name, email, and amount are required." }, { status: 400 });
    }

    // Automated (Razorpay) donations are auto-approved, so the browser's word
    // is not enough: verify the checkout signature and fetch the payment from
    // Razorpay. The amount recorded is what Razorpay says was paid, never the
    // amount the request claims.
    const isAutomated = payment_mode === "automated";
    if (isAutomated) {
      let verified;
      try {
        verified = await verifyRazorpayPayment(body);
      } catch (verifyErr) {
        console.warn("Razorpay verification failed:", verifyErr.message);
        return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
      }

      const adminCheck = createAdminClient();
      const { data: existing } = await adminCheck
        .from("donations").select("id, status").eq("transaction_ref", verified.paymentId).maybeSingle();
      if (existing) {
        // Same payment submitted twice (double-click, retry) — don't record it again.
        return NextResponse.json({ id: existing.id, status: existing.status }, { status: 200 });
      }

      final_amount    = verified.amountRupees;
      amount          = Math.min(Number(amount), verified.amountRupees);
      transaction_ref = verified.paymentId;
      proof_link      = `razorpay:${verified.orderId}`;
    }

    // Get authenticated user if any
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminSb = createAdminClient();

    // Resolve campaign_id from name/slug if not already provided as a UUID
    // (primary path is the donate page sending campaign_id directly; this
    // fallback only runs for older clients or direct API calls)
    let resolvedCampaignId = campaign_id || null;
    if (!resolvedCampaignId && campaign_name) {
      const trimmedName = String(campaign_name).trim();
      if (trimmedName) {
        // Try slug match first, then exact (case-insensitive) title match.
        // Using .eq()/.ilike() with bound params — never interpolate user
        // input into a raw PostgREST filter string (.or(`...${x}`) is unsafe:
        // commas/parens in the input corrupt the filter or match unintended rows).
        let { data: camp } = await adminSb
          .from("campaigns")
          .select("id")
          .eq("slug", trimmedName)
          .maybeSingle();

        if (!camp) {
          const { data: byTitle } = await adminSb
            .from("campaigns")
            .select("id")
            .ilike("title", trimmedName)
            .limit(1)
            .maybeSingle();
          camp = byTitle;
        }

        if (camp) resolvedCampaignId = camp.id;
      }
    }

    // Automated payments (Razorpay) are auto-approved — money is already captured
    // and was verified above.
    const status = isAutomated ? "approved" : "pending";
    const approvedAt = isAutomated ? new Date().toISOString() : null;

    const { data: donation, error } = await adminSb.from("donations").insert({
      user_id:              user?.id || null,
      campaign_id:          resolvedCampaignId,
      donor_name,
      email,
      phone:                phone || null,
      amount:               Number(amount),
      final_amount:         Number(final_amount || amount),
      fee_covered_by_donor: Boolean(fee_covered_by_donor),
      payment_mode:         isAutomated ? "automated" : "manual",
      transaction_ref:      transaction_ref || null,
      proof_link:           proof_link || null,
      comment:              comment || null,
      is_anonymous:         Boolean(is_anonymous),
      status,
      ...(approvedAt ? { approved_at: approvedAt } : {}),
    }).select().single();

    if (error) {
      console.error("Donation insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For automated payments: also add to ledger immediately (no admin step)
    if (isAutomated) {
      // Fetch campaign title for ledger note (if applicable)
      let campaignTitle = null;
      if (resolvedCampaignId) {
        const { data: camp } = await adminSb.from("campaigns").select("title").eq("id", resolvedCampaignId).single();
        campaignTitle = camp?.title || null;
      }

      // Supabase query builders have no .catch() — check the returned error instead.
      const { error: ledgerErr } = await adminSb.from("ledger_entries").insert({
        type:           "credit",
        amount:         Number(final_amount || amount),
        note:           `Donation from ${donor_name} (automated / Razorpay)`,
        category:       campaignTitle ? "donation" : "General",
        reference_type: "donation",
        reference_id:   donation.id,
        created_by:     null, // system-generated, no admin actor
      });
      if (ledgerErr) console.error("Ledger insert error:", ledgerErr.message);

      revalidatePublicPages();
    }

    // Send appropriate confirmation email (non-blocking)
    try {
      let emailContent;
      if (isAutomated) {
        // Receipt email sent immediately — no pending state for donor
        emailContent = donationApprovedEmail({
          donorName:     donor_name,
          amount:        Number(final_amount || amount),
          donationId:    donation.id,
          campaignTitle: null, // resolved async above but email is fast-path; keep simple
        });
      } else {
        // Manual: "we received it, pending verification" email
        emailContent = donationReceivedEmail({
          donorName: donor_name,
          amount:    final_amount || amount,
          ref:       transaction_ref,
        });
      }

      await sendEmail({ to: email, ...emailContent });

      await adminSb.from("email_logs").insert({
        recipient_email: email,
        subject:         emailContent.subject,
        status:          "sent",
        donation_id:     donation.id,
        template_type:   isAutomated ? "donation_approved" : "donation_received",
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // Don't fail the donation for email errors
    }

    return NextResponse.json({ id: donation.id, status }, { status: 201 });
  } catch (err) {
    console.error("Donate API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
