-- ============================================================
-- Migration 004: Instant-approve automated donations + allow
--               amount correction when admin approves manual ones
-- Run in Supabase Dashboard > SQL Editor AFTER migration 003
-- ============================================================
-- Why this migration exists —
-- 1) Automated (Razorpay) donations are now inserted directly with
--    status = 'approved' (money has already been captured by the
--    gateway, so there's nothing for an admin to verify). The old
--    trigger only fired on UPDATE, so a donation inserted already-
--    approved never bumped the campaign's current_amount.
--    This migration makes the trigger fire on INSERT too.
-- 2) Manual (UPI/QR) donations use a static QR so a donor could
--    pay a different amount than they typed. Admins can now correct
--    donations.final_amount at the moment they approve — the trigger
--    uses whatever final_amount is on the row at approval time, so
--    campaign totals always reflect the corrected, real amount.

CREATE OR REPLACE FUNCTION public.sync_campaign_amount()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Brand-new donation inserted as already-approved (automated/instant flow)
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'approved' AND NEW.campaign_id IS NOT NULL THEN
      UPDATE public.campaigns
      SET current_amount = current_amount + NEW.final_amount
      WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Existing donation changing status (admin approve/reject flow)
  IF TG_OP = 'UPDATE' THEN
    -- Newly approved: add final_amount to campaign (uses corrected amount if admin changed it)
    IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.campaign_id IS NOT NULL THEN
      UPDATE public.campaigns
      SET current_amount = current_amount + NEW.final_amount
      WHERE id = NEW.campaign_id;
    END IF;
    -- Un-approved / rejected: subtract the previously-approved amount
    IF OLD.status = 'approved' AND NEW.status != 'approved' AND NEW.campaign_id IS NOT NULL THEN
      UPDATE public.campaigns
      SET current_amount = GREATEST(0, current_amount - OLD.final_amount)
      WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_donation_status_change ON public.donations;

CREATE TRIGGER on_donation_status_change
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE PROCEDURE public.sync_campaign_amount();

SELECT 'Migration 004 applied successfully.' AS result;
