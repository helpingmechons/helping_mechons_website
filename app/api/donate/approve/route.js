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

    const { id, action, reason } = await request.json();
    if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });
    if (!["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const adminSb = createAdminClient();

    // Fetch the donation
    const { data: donation, error: fetchErr } = await adminSb
      .from("donations")
      .select("*, campaigns(title)")
      .eq("id", id)
      .single();

    if (fetchErr || !donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    if (donation.status !== "pending") return NextResponse.json({ error: "Donation is not pending" }, { status: 409 });

    const updatePayload = action === "approve"
      ? { status: "approved", approved_by: user.id, approved_at: new Date().toISOString() }
      : { status: "rejected", rejection_reason: reason || "Unspecified" };

    const { data: updated, error: updateErr } = await adminSb
      .from("donations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    // Add to ledger if approved
    if (action === "approve") {
      await adminSb.from("ledger_entries").insert({
        type:           "credit",
        amount:         Number(donation.final_amount || donation.amount),
        note:           `Donation from ${donation.donor_name} approved`,
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
      metadata:    { donation_id: id, amount: donation.amount },
    });

    // Send email notification
    try {
      let emailContent;
      if (action === "approve") {
        emailContent = donationApprovedEmail({
          donorName:     donation.donor_name,
          amount:        donation.final_amount || donation.amount,
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

    return NextResponse.json({ success: true, status: updated.status });
  } catch (err) {
    console.error("Approve API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
