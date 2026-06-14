-- ============================================================
-- Migration 003: Only create profiles for confirmed accounts
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Step 1: Fix INSERT trigger ────────────────────────────────────────────────
-- Old trigger created a profile the moment someone signs up,
-- BEFORE they confirm their email. This allows unconfirmed ghost accounts.
-- New trigger only creates a profile if the email is ALREADY confirmed
-- (e.g., when admin creates a user, or OAuth login).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only create profile immediately if the email is already confirmed
  -- (SSO / OAuth / admin-created users). Regular signups hit the UPDATE trigger below.
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role, must_change_password)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'donor'),
      COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- ── Step 2: Add UPDATE trigger for email confirmation ─────────────────────────
-- When user clicks the confirmation link, Supabase sets email_confirmed_at.
-- That UPDATE fires this trigger and creates the profile.

CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Fire only when email_confirmed_at transitions from NULL → a timestamp
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role, must_change_password)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'donor'),
      COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_email_confirmed();

-- ── Step 3: Clean up ghost profiles from unconfirmed accounts ─────────────────
-- Remove profiles for users who never confirmed their email.
-- Safe: ON DELETE CASCADE means their donations remain (user_id = null).

DELETE FROM public.profiles
WHERE id IN (
  SELECT p.id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE u.email_confirmed_at IS NULL
    AND p.role = 'donor'  -- never delete admin profiles this way
);

-- ── Step 4: Public donor summary view — only approved, confirmed donations ─────
-- Refresh the view to be safe
CREATE OR REPLACE VIEW public.public_donation_summary AS
  SELECT
    COUNT(*)                                          AS total_donations,
    SUM(final_amount)                                 AS total_raised,
    COUNT(*) FILTER (WHERE status = 'pending')        AS pending_count,
    MAX(created_at)                                   AS last_donation_at
  FROM public.donations
  WHERE status = 'approved';

-- Done!
SELECT 'Migration 003 applied successfully.' AS result;
