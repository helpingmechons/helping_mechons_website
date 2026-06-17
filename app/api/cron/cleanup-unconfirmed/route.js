import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// ============================================================
// Daily cleanup: delete auth.users accounts that signed up
// more than 24 hours ago and never confirmed their email.
//
// Triggered by Vercel Cron (see vercel.json) once per day.
// Protected by CRON_SECRET so only Vercel's scheduler (or
// someone who knows the secret) can invoke it.
//
// Note: this only ever deletes auth.users rows. It never
// touches public.profiles directly — migration 003 already
// ensures unconfirmed signups never get a profile row in the
// first place, so there's nothing to clean up there. Donations
// made anonymously/pre-signup are unaffected (donations.user_id
// is "on delete set null", so even if a user record disappears,
// any donation they made keeps its donor_name/email/amount —
// it just loses the link back to a user account).
// ============================================================

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function GET(request) {
  // Verify this is Vercel Cron (or someone with the secret) calling us —
  // prevents randoms from hitting this route and deleting accounts at will.
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminSb = createAdminClient();
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

    // List users in pages of 1000 (Supabase admin API max per page).
    // For a small NGO donor base this will almost always be a single page.
    let page = 1;
    const toDelete = [];

    while (true) {
      const { data, error } = await adminSb.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error("listUsers error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const users = data?.users || [];
      for (const u of users) {
        const isUnconfirmed = !u.email_confirmed_at;
        const isOldEnough   = new Date(u.created_at) < cutoff;
        if (isUnconfirmed && isOldEnough) {
          toDelete.push({ id: u.id, email: u.email, created_at: u.created_at });
        }
      }

      if (users.length < 1000) break; // last page
      page += 1;
    }

    const results = { deleted: [], failed: [] };

    for (const u of toDelete) {
      const { error: delErr } = await adminSb.auth.admin.deleteUser(u.id);
      if (delErr) {
        console.error(`Failed to delete ${u.email}:`, delErr.message);
        results.failed.push({ email: u.email, error: delErr.message });
      } else {
        results.deleted.push(u.email);
      }
    }

    console.log(`Cleanup: deleted ${results.deleted.length}, failed ${results.failed.length}`);

    return NextResponse.json({
      success: true,
      checked_cutoff: cutoff.toISOString(),
      deleted_count: results.deleted.length,
      failed_count: results.failed.length,
      deleted: results.deleted,
      failed: results.failed,
    });
  } catch (err) {
    console.error("Cleanup cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
