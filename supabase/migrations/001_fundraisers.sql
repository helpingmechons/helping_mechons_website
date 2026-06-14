-- ============================================================
-- Migration 001: Time-limited fundraiser campaigns
-- Run in Supabase Dashboard > SQL Editor AFTER schema.sql
-- ============================================================

alter table public.campaigns
  add column if not exists is_fundraiser    boolean not null default false,
  add column if not exists start_date       date,
  add column if not exists poster_url       text,
  add column if not exists poster_drive_id  text,
  add column if not exists urgency_label    text default 'Limited Time';

-- View: active, non-expired fundraisers only
create or replace view public.active_fundraisers as
  select *
  from public.campaigns
  where is_fundraiser = true
    and active = true
    and (end_date is null or end_date >= current_date)
  order by created_at desc;
