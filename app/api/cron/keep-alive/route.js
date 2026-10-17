import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// ============================================================
// Daily keep-alive: stops the free-tier Supabase project from
// being paused for inactivity (Supabase pauses free projects
// after ~7 days with no database activity).
//
// Triggered by Vercel Cron (see vercel.json) once per day.
// It does a real Postgres read AND write through PostgREST,
// so it counts as genuine database activity — an auth-only
// call or a ping to the project URL is not reliably enough.
//
// The write goes to public.keep_alive (migration 005), a
// one-row table locked down with RLS so only the service
// role can touch it.
//
// Auth: if CRON_SECRET is set (it should be), the request must
// carry it — Vercel Cron sends it automatically as a Bearer
// token. If CRON_SECRET is NOT set we still run, because a
// missing secret is exactly the kind of silent misconfiguration
// that lets the project get paused. The route returns no data,
// so calling it without a secret is harmless.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminSb = createAdminClient();
    const now = new Date().toISOString();

    // 1) Write: bump the heartbeat row.
    const { error: writeErr } = await adminSb
      .from("keep_alive")
      .upsert({ id: 1, last_ping: now }, { onConflict: "id" });

    // 2) Read: a real table query, so the project stays active even if
    //    migration 005 hasn't been run yet and the write above failed.
    const { error: readErr } = await adminSb
      .from("campaigns")
      .select("id")
      .limit(1);

    if (writeErr) console.error("keep-alive write failed (run migration 005?):", writeErr.message);
    if (readErr)  console.error("keep-alive read failed:", readErr.message);

    if (writeErr && readErr) {
      return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pinged_at: now, heartbeat_written: !writeErr });
  } catch (err) {
    console.error("keep-alive cron error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
