-- ============================================================
-- Helping Mechons — Seed Data
-- Run AFTER schema.sql
-- NOTE: Replace placeholder UUIDs after running auth seed below
-- ============================================================

-- ============================================================
-- STEP 1: Create admin user via Supabase Auth API
-- Run this in your terminal (replace values from .env):
--
--   curl -X POST 'https://YOUR-PROJECT.supabase.co/auth/v1/signup' \
--     -H 'apikey: YOUR_ANON_KEY' \
--     -H 'Content-Type: application/json' \
--     -d '{
--       "email": "helpingmechons@gmail.com",
--       "password": "HelpingMechons@2026",
--       "data": {
--         "full_name": "Admin",
--         "role": "admin",
--         "must_change_password": true
--       }
--     }'
--
-- OR use the Supabase Dashboard > Authentication > Add User
-- Then run STEP 2 below to elevate that user to admin.
-- ============================================================

-- STEP 2: After creating the user, elevate to admin role.
-- Find the user's UUID in Supabase Dashboard > Auth > Users,
-- then replace 'ADMIN_USER_UUID_HERE':

-- update public.profiles
-- set role = 'admin', must_change_password = true
-- where id = 'ADMIN_USER_UUID_HERE';


-- ============================================================
-- SAMPLE CAMPAIGNS
-- ============================================================
insert into public.campaigns (
  id, title, slug, description, goal_amount, current_amount,
  cover_image_url, category, active, featured,
  fundraiser_display_name, location, end_date
) values
(
  uuid_generate_v4(),
  'Emergency Medical Fund',
  'emergency-medical-fund',
  'Providing life-saving surgeries and primary care to families in need across Hyderabad. Every rupee goes directly toward medicines, doctor visits, and emergency procedures for those who cannot afford them.',
  500000, 145000,
  '/photos/medical-support.jpeg',
  'medical', true, true,
  null, 'Hyderabad, Telangana',
  (now() + interval '90 days')::date
),
(
  uuid_generate_v4(),
  'Daily Food for 500 Families',
  'daily-food-500-families',
  'Our nightly food distribution reaches 500+ homeless and destitute families on the streets of Hyderabad. Help us keep this mission running every single night.',
  200000, 87500,
  '/photos/food-distribution-1.jpg',
  'food', true, true,
  null, 'Hyderabad, Telangana',
  (now() + interval '60 days')::date
),
(
  uuid_generate_v4(),
  'Education Kits for 200 Children',
  'education-kits-200-children',
  'Supply school bags, books, stationery, and uniforms to 200 underprivileged children in government schools so they can attend with dignity.',
  150000, 62000,
  '/photos/education-support.jpg',
  'education', true, true,
  null, 'Visakhapatnam, Andhra Pradesh',
  (now() + interval '45 days')::date
),
(
  uuid_generate_v4(),
  'Monthly Grocery Kits — Elderly Care',
  'grocery-kits-elderly',
  'Provide monthly grocery kits containing rice, dal, oil, sugar, and hygiene essentials to elderly citizens living alone without family support.',
  100000, 23000,
  '/photos/grocery-support.jpeg',
  'grocery', true, false,
  null, 'Hyderabad, Telangana',
  (now() + interval '30 days')::date
),
(
  uuid_generate_v4(),
  'Orphanage Support — Vijayawada',
  'orphanage-support-vijayawada',
  'Monthly support for an orphanage caring for 45 children — covering food, clothing, school fees, and medical checkups.',
  250000, 78000,
  '/photos/orphanage-care.jpeg',
  'orphanage', true, false,
  null, 'Vijayawada, Andhra Pradesh',
  (now() + interval '120 days')::date
)
on conflict do nothing;


-- ============================================================
-- SAMPLE GALLERY ITEMS
-- ============================================================
insert into public.gallery_items (
  title, description, image_url, category, event_date, location, featured, sort_order
) values
('Nightly Food Distribution Drive',   'Volunteers distributing food packets to 300+ homeless on the streets of Hyderabad.',     '/photos/food-distribution-1.jpg',  'food',      '2024-01-15', 'Hyderabad', true, 1),
('Street Food Relief — Late Night',   'Our team reaches families on roadsides after 10pm when hunger is at its peak.',           '/photos/food-distribution-2.jpg',  'food',      '2024-02-20', 'Hyderabad', false, 2),
('Grocery Distribution to Families',  'Monthly grocery kit distribution covering rice, oil, dal, and essential commodities.',    '/photos/food-distribution-3.jpg',  'food',      '2024-03-10', 'Secunderabad', false, 3),
('School Supplies for Rural Children','Distributing blackboards, books, and stationery to children at a tribal school.',         '/photos/education-support.jpg',    'education', '2024-04-05', 'Visakhapatnam', true, 4),
('Grocery Kits for Elderly Citizens', 'Supporting senior citizens living alone with monthly grocery essentials.',                '/photos/grocery-support.jpeg',     'grocery',   '2024-05-12', 'Hyderabad', false, 5),
('Orphanage Visit & Donations',       'Visiting and supporting children at a local orphanage with meals and school supplies.',   '/photos/orphanage-care.jpeg',      'orphanage', '2024-06-01', 'Vijayawada', true, 6),
('Old Age Home Support Program',      'Monthly visits to provide groceries, medicines, and companionship to elderly residents.', '/photos/old-age-care.jpeg',        'medical',   '2024-06-15', 'Rajamahendravaram', false, 7),
('Medical Aid Distribution',          'Providing medicines and first-aid support at a community medical camp.',                  '/photos/medical-support.jpeg',     'medical',   '2024-07-01', 'Hyderabad', true, 8)
on conflict do nothing;


-- ============================================================
-- SAMPLE APPROVED DONATIONS (for dashboard demo)
-- ============================================================
-- These reference the campaigns; run after campaigns are inserted
-- They will auto-calculate in the UI from the campaigns table
-- (No donor user_id needed — these are anonymous manual donations)
