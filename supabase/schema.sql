-- ============================================================
-- Helping Mechons — Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  display_name          text,
  phone                 text,
  avatar_url            text,
  role                  text not null default 'donor' check (role in ('donor','admin','volunteer')),
  anonymous_preference  boolean not null default false,
  must_change_password  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, must_change_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'donor'),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update timestamp trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- CAMPAIGNS / FUNDRAISERS
-- ============================================================
create table if not exists public.campaigns (
  id                      uuid primary key default uuid_generate_v4(),
  title                   text not null,
  slug                    text unique,
  description             text,
  goal_amount             numeric(12,2) not null default 0,
  current_amount          numeric(12,2) not null default 0,
  cover_image_url         text,
  category                text default 'general',
  active                  boolean not null default true,
  featured                boolean not null default false,
  fundraiser_display_name text,
  location                text,
  end_date                date,
  created_by              uuid references public.profiles(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create trigger campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- DONATIONS
-- ============================================================
create table if not exists public.donations (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references public.profiles(id) on delete set null,
  campaign_id          uuid references public.campaigns(id) on delete set null,
  donor_name           text not null,
  email                text not null,
  phone                text,
  amount               numeric(12,2) not null,
  fee_covered_by_donor boolean not null default false,
  final_amount         numeric(12,2) not null,
  status               text not null default 'pending' check (status in ('pending','approved','rejected')),
  payment_mode         text not null default 'manual' check (payment_mode in ('manual','automated')),
  transaction_ref      text,
  proof_link           text,
  comment              text,
  is_anonymous         boolean not null default false,
  fundraiser_name      text,
  rejection_reason     text,
  approved_at          timestamptz,
  approved_by          uuid references public.profiles(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger donations_updated_at before update on public.donations
  for each row execute procedure public.set_updated_at();

-- Update campaign current_amount when donation approved
create or replace function public.sync_campaign_amount()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'approved' and old.status != 'approved' and new.campaign_id is not null then
    update public.campaigns
    set current_amount = current_amount + new.final_amount
    where id = new.campaign_id;
  end if;
  if old.status = 'approved' and new.status != 'approved' and new.campaign_id is not null then
    update public.campaigns
    set current_amount = greatest(0, current_amount - old.final_amount)
    where id = new.campaign_id;
  end if;
  return new;
end;
$$;
create trigger on_donation_status_change
  after update on public.donations
  for each row execute procedure public.sync_campaign_amount();

-- ============================================================
-- FUNDRAISER COMMENTS
-- ============================================================
create table if not exists public.fundraiser_comments (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  donor_name  text not null,
  comment     text not null,
  amount      numeric(12,2),
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- GALLERY ITEMS
-- ============================================================
create table if not exists public.gallery_items (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  image_url     text not null,
  drive_file_id text,
  category      text not null default 'general'
                check (category in ('medical','food','grocery','education','orphanage','general')),
  event_date    date,
  location      text,
  featured      boolean not null default false,
  sort_order    int not null default 0,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger gallery_updated_at before update on public.gallery_items
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- LEDGER ENTRIES (admin-only, never public)
-- ============================================================
create table if not exists public.ledger_entries (
  id              uuid primary key default uuid_generate_v4(),
  type            text not null check (type in ('credit','debit')),
  amount          numeric(12,2) not null,
  note            text not null,
  category        text not null,
  reference_type  text,  -- 'donation' | 'expense' | 'transfer' | 'other'
  reference_id    uuid,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- ADMIN ACTIONS / AUDIT LOG
-- ============================================================
create table if not exists public.admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references public.profiles(id) on delete set null,
  action_type text not null,
  action_note text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- EMAIL LOGS
-- ============================================================
create table if not exists public.email_logs (
  id               uuid primary key default uuid_generate_v4(),
  recipient_email  text not null,
  subject          text not null,
  status           text not null default 'sent' check (status in ('sent','failed','pending')),
  error_message    text,
  donation_id      uuid references public.donations(id) on delete set null,
  template_type    text,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- HOMEPAGE CONTENT (admin-editable)
-- ============================================================
create table if not exists public.homepage_content (
  key         text primary key,
  value       text,
  updated_by  uuid references public.profiles(id),
  updated_at  timestamptz not null default now()
);

-- Seed default content
insert into public.homepage_content (key, value) values
  ('hero_headline',   'Healing Lives, One Mission at a Time.'),
  ('hero_subline',    'Join us in providing medical aid, food security, and education to those who need it most. Together, we can restore dignity to vulnerable communities.'),
  ('impact_lives',    '1,200+'),
  ('impact_meals',    '5,400'),
  ('impact_camps',    '450+'),
  ('impact_students', '85K'),
  ('founder_story',   'Helping Mechons was born from a simple idea: no one should go to bed hungry or without access to basic healthcare simply because of where they were born. Our founder saw families in his own city — in Hyderabad — struggling without food, medicine, or education. That single spark grew into a movement. Today, we serve communities across India, reaching the elderly, orphaned children, students, and families in crisis.')
on conflict (key) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

alter table public.profiles             enable row level security;
alter table public.campaigns            enable row level security;
alter table public.donations            enable row level security;
alter table public.fundraiser_comments  enable row level security;
alter table public.gallery_items        enable row level security;
alter table public.ledger_entries       enable row level security;
alter table public.admin_actions        enable row level security;
alter table public.email_logs           enable row level security;
alter table public.homepage_content     enable row level security;

-- Helper: is caller an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());
create policy "Admins can update all profiles"
  on public.profiles for update using (public.is_admin());

-- CAMPAIGNS (public can read active ones; only admin writes)
create policy "Public can view active campaigns"
  on public.campaigns for select using (active = true);
create policy "Admins have full campaign access"
  on public.campaigns for all using (public.is_admin());

-- DONATIONS
create policy "Users can view own donations"
  on public.donations for select using (auth.uid() = user_id);
create policy "Authenticated users can insert donations"
  on public.donations for insert with check (true);
create policy "Admins can view all donations"
  on public.donations for select using (public.is_admin());
create policy "Admins can update donations"
  on public.donations for update using (public.is_admin());

-- FUNDRAISER COMMENTS (public)
create policy "Public can view public comments"
  on public.fundraiser_comments for select using (is_public = true);
create policy "Anyone can insert comment"
  on public.fundraiser_comments for insert with check (true);
create policy "Admins manage comments"
  on public.fundraiser_comments for all using (public.is_admin());

-- GALLERY (public read; admin write)
create policy "Public can view gallery"
  on public.gallery_items for select using (true);
create policy "Admins manage gallery"
  on public.gallery_items for all using (public.is_admin());

-- LEDGER (admin only — never expose publicly)
create policy "Only admins can access ledger"
  on public.ledger_entries for all using (public.is_admin());

-- ADMIN ACTIONS (admin only)
create policy "Only admins can access audit log"
  on public.admin_actions for all using (public.is_admin());

-- EMAIL LOGS (admin only)
create policy "Only admins can access email logs"
  on public.email_logs for all using (public.is_admin());

-- HOMEPAGE CONTENT (public read; admin write)
create policy "Public can read homepage content"
  on public.homepage_content for select using (true);
create policy "Admins can update homepage content"
  on public.homepage_content for all using (public.is_admin());

-- ============================================================
-- COMPUTED VIEW: Public donation ledger (no expenses)
-- ============================================================
create or replace view public.public_donation_summary as
  select
    count(*)                               as total_donations,
    sum(final_amount)                      as total_raised,
    count(*) filter (where status='pending') as pending_count,
    max(created_at)                        as last_donation_at
  from public.donations
  where status = 'approved';

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_donations_user         on public.donations(user_id);
create index if not exists idx_donations_campaign     on public.donations(campaign_id);
create index if not exists idx_donations_status       on public.donations(status);
create index if not exists idx_donations_created      on public.donations(created_at desc);
create index if not exists idx_gallery_category       on public.gallery_items(category);
create index if not exists idx_ledger_type            on public.ledger_entries(type);
create index if not exists idx_campaigns_active       on public.campaigns(active, featured);
