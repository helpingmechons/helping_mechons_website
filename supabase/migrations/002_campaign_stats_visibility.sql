-- ============================================================
-- Migration: Add show_public_stats + is_completed to campaigns
-- Run this in Supabase SQL Editor (or as a migration file)
-- ============================================================

-- show_public_stats: when true, publicly shows raised/goal/progress bar
-- is_completed:      when true, shows "Mission Completed" badge, hides amounts
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS show_public_stats boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_completed      boolean NOT NULL DEFAULT false;

-- Mark ALL existing campaigns as completed (they're old/done ones).
-- New campaigns you create will start with is_completed = false by default.
UPDATE public.campaigns
SET is_completed = true
WHERE created_at < now();   -- marks everything currently in DB as completed

-- Confirm the change
SELECT id, title, is_completed, show_public_stats FROM public.campaigns;
