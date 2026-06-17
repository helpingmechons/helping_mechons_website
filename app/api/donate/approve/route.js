import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, donationApprovedEmail, donationRejectedEmail } from "@/lib/email/mailer";

export async function POST(request) {
  try {
    // Verify admin
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const { id, action, reason, approved_amount } = await request.json();
    if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });
    if (!["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const adminSb = createAdminClient();

    // Fetch the donation (with campaign title for email)
    const { data: donation, error: fetchErr } = await adminSb
      .from("donations")
      .select("*, campaigns(title)")
      .eq("id", id)
      .single();

    if (fetchErr || !donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    if (donation.status !== "pending") return NextResponse.json({ error: "Donation is not pending" }, { status: 409 });

    // Build update payload
    // If admin supplied a corrected amount, update final_amount too —
    // the DB trigger uses final_amount when updating campaign.current_amount.
    let updatePayload;
    if (action === "approve") {
      const correctedAmount = approved_amount && Number(approved_amount) > 0
        ? Number(approved_amount)
        : null; // null = keep existing final_amount

      updatePayload = {
        status:      "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        ...(correctedAmount !== null ? { final_amount: correctedAmount } : {}),
      };
    } else {
      updatePayload = {
        status:           "rejected",
        rejection_reason: reason || "Unspecified",
      };
    }

    const { data: updated, error: updateErr } = await adminSb
      .from("donations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    // Add to ledger if approved (use the final approved amount — corrected or original)
    if (action === "approve") {
      const receiptAmount = updated.final_amount || updated.amount;
      await adminSb.from("ledger_entries").insert({
        type:           "credit",
        amount:         Number(receiptAmount),
        note:           `Donation from ${donation.donor_name} approved by admin`,
        category:       donation.campaigns?.title ? "donation" : "General",
        reference_type: "donation",
        reference_id:   donation.id,
        created_by:     user.id,
      });
    }

    // Log admin action
    await adminSb.from("admin_actions").insert({
      admin_id:    user.id,
      action_type: action === "approve" ? "donation_approved" : "donation_rejected",
      action_note: action === "reject" ? reason : null,
      metadata:    { donation_id: id, original_amount: donation.amount, final_amount: updated.final_amount },
    });

    // Send email notification
    try {
      let emailContent;
      if (action === "approve") {
        const receiptAmount = updated.final_amount || updated.amount;
        emailContent = donationApprovedEmail({
          donorName:     donation.donor_name,
          amount:        receiptAmount,
          donationId:    donation.id,
          campaignTitle: donation.campaigns?.title || null,
        });
      } else {
        emailContent = donationRejectedEmail({
          donorName: donation.donor_name,
          amount:    donation.amount,
          reason:    reason || null,
        });
      }
      await sendEmail({ to: donation.email, ...emailContent });
      await adminSb.from("email_logs").insert({
        recipient_email: donation.email,
        subject:         emailContent.subject,
        status:          "sent",
        donation_id:     donation.id,
        template_type:   action === "approve" ? "donation_approved" : "donation_rejected",
      });
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr.message);
    }

    return NextResponse.json({ success: true, status: updated.status, final_amount: updated.final_amount });
  } catch (err) {
    console.error("Approve API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
