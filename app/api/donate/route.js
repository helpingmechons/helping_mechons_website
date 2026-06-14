import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, donationReceivedEmail } from "@/lib/email/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      donor_name, email, phone, amount, final_amount, fee_covered_by_donor,
      payment_mode, transaction_ref, proof_link, comment, is_anonymous,
      campaign_id, campaign_name,
    } = body;

    if (!donor_name || !email || !amount) {
      return NextResponse.json({ error: "donor_name, email, and amount are required." }, { status: 400 });
    }

    // Get authenticated user if any
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Resolve campaign_id from name if provided
    let resolvedCampaignId = campaign_id || null;
    if (!resolvedCampaignId && campaign_name) {
      const adminSb = createAdminClient();
      const { data: camp } = await adminSb.from("campaigns").select("id").or(`title.ilike.${campaign_name},slug.eq.${campaign_name}`).single();
      if (camp) resolvedCampaignId = camp.id;
    }

    // Insert donation using service role (bypasses RLS for insert)
    const adminSb = createAdminClient();
    const { data: donation, error } = await adminSb.from("donations").insert({
      user_id:              user?.id || null,
      campaign_id:          resolvedCampaignId,
      donor_name,
      email,
      phone:                phone || null,
      amount:               Number(amount),
      final_amount:         Number(final_amount || amount),
      fee_covered_by_donor: Boolean(fee_covered_by_donor),
      payment_mode:         payment_mode || "manual",
      transaction_ref:      transaction_ref || null,
      proof_link:           proof_link || null,
      comment:              comment || null,
      is_anonymous:         Boolean(is_anonymous),
      status:               "pending",
    }).select().single();

    if (error) {
      console.error("Donation insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send confirmation email (non-blocking)
    try {
      const { subject, html } = donationReceivedEmail({
        donorName: donor_name,
        amount:    final_amount || amount,
        ref:       transaction_ref,
      });
      await sendEmail({ to: email, subject, html });

      // Log the email
      await adminSb.from("email_logs").insert({
        recipient_email: email,
        subject,
        status:          "sent",
        donation_id:     donation.id,
        template_type:   "donation_received",
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // Don't fail the donation submission for email errors
    }

    return NextResponse.json({ id: donation.id, status: "pending" }, { status: 201 });
  } catch (err) {
    console.error("Donate API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
