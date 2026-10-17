-- ============================================================
-- Migration 005: Supabase keep-alive table, YouPI PG payments,
--               and a fix for the donations INSERT policy
-- Run in Supabase Dashboard > SQL Editor AFTER migration 004
-- ============================================================

-- ── 1) Keep-alive heartbeat ──────────────────────────────────────────────────
-- /api/cron/keep-alive upserts this one row every day so the free-tier
-- project always has real database activity and never gets paused.
-- RLS on with NO policies = only the service role (server) can touch it.
CREATE TABLE IF NOT EXISTS public.keep_alive (
  id        int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_ping timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;
INSERT INTO public.keep_alive (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── 2) YouPI PG payment mode + awaiting_payment status ───────────────────────
-- 'youpi'            = paid via the self-hosted YouPI UPI gateway
-- 'awaiting_payment' = donation row created, donor is on the YouPI checkout
--                      page and hasn't paid yet. Kept separate from 'pending'
--                      so abandoned checkouts don't clutter the admin's
--                      manual-verification queue.
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_payment_mode_check;
ALTER TABLE public.donations
  ADD CONSTRAINT donations_payment_mode_check
  CHECK (payment_mode IN ('manual', 'automated', 'youpi'));

ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE public.donations
  ADD CONSTRAINT donations_status_check
  CHECK (status IN ('awaiting_payment', 'pending', 'approved', 'rejected'));

-- ── 3) Close the direct-insert hole ──────────────────────────────────────────
-- The old policy was `with check (true)`, so anyone holding the public anon
-- key could insert a donation straight into the table with
-- status = 'approved' — which (via the migration-004 trigger) bumped the
-- campaign total. The website never inserts donations from the browser
-- (all inserts go through /api/donate* with the service role), so this
-- only removes the abuse path.
DROP POLICY IF EXISTS "Authenticated users can insert donations" ON public.donations;
CREATE POLICY "Public can insert pending donations"
  ON public.donations FOR INSERT
  WITH CHECK (status = 'pending' AND payment_mode = 'manual');

SELECT 'Migration 005 applied successfully.' AS result;
