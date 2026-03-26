-- Seed Test Data for Golf Charity Platform
-- 002_seed_test_data.sql

-- =============================================
-- ENSURE SUBSCRIPTION PLANS EXIST
-- =============================================
INSERT INTO public.subscription_plans (id, name, slug, description, price_cents, interval, prize_pool_contribution_cents, min_charity_percentage, is_active, stripe_price_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Birdie Plan', 'birdie-monthly', 'Entry level - 1 draw entry per month', 1900, 'monthly', 500, 10, true, 'price_birdie_monthly'),
  ('22222222-2222-2222-2222-222222222222', 'Eagle Plan', 'eagle-monthly', 'Most popular - 3 draw entries per month + bonus features', 3900, 'monthly', 1500, 10, true, 'price_eagle_monthly'),
  ('33333333-3333-3333-3333-333333333333', 'Albatross Plan', 'albatross-monthly', 'Premium - 5 draw entries per month + VIP benefits', 7900, 'monthly', 3500, 10, true, 'price_albatross_monthly'),
  ('44444444-4444-4444-4444-444444444444', 'Birdie Annual', 'birdie-yearly', 'Entry level - Annual (2 months free)', 19000, 'yearly', 5000, 10, true, 'price_birdie_yearly'),
  ('55555555-5555-5555-5555-555555555555', 'Eagle Annual', 'eagle-yearly', 'Most popular - Annual (2 months free)', 39000, 'yearly', 15000, 10, true, 'price_eagle_yearly'),
  ('66666666-6666-6666-6666-666666666666', 'Albatross Annual', 'albatross-yearly', 'Premium - Annual (2 months free)', 79000, 'yearly', 35000, 10, true, 'price_albatross_yearly')
ON CONFLICT (slug) DO UPDATE SET
  price_cents = EXCLUDED.price_cents,
  prize_pool_contribution_cents = EXCLUDED.prize_pool_contribution_cents,
  description = EXCLUDED.description;

-- =============================================
-- UPDATE/ADD CHARITIES WITH MORE DETAILS
-- =============================================
UPDATE public.charities SET 
  logo_url = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200&h=200&fit=crop',
  cover_image_url = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop',
  website_url = 'https://example.com/golf-for-good'
WHERE slug = 'golf-for-good';

UPDATE public.charities SET 
  logo_url = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=200&fit=crop',
  cover_image_url = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=400&fit=crop',
  website_url = 'https://example.com/green-fairways'
WHERE slug = 'green-fairways';

UPDATE public.charities SET 
  logo_url = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200&h=200&fit=crop',
  cover_image_url = 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=400&fit=crop',
  website_url = 'https://example.com/junior-golf'
WHERE slug = 'junior-golf';

UPDATE public.charities SET 
  logo_url = 'https://images.unsplash.com/photo-1529956997-6c1cf193b803?w=200&h=200&fit=crop',
  cover_image_url = 'https://images.unsplash.com/photo-1529956997-6c1cf193b803?w=800&h=400&fit=crop',
  website_url = 'https://example.com/veterans-green'
WHERE slug = 'veterans-green';

-- Add more charities
INSERT INTO public.charities (name, slug, description, short_description, logo_url, cover_image_url, website_url, is_featured, is_active)
VALUES 
  ('First Tee Foundation', 'first-tee', 'Building game changers by integrating golf and life skills education. We help young people build strength of character through the game of golf.', 'Life skills through golf for youth', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop', 'https://example.com/first-tee', true, true),
  ('Golf Course Wildlife Preserve', 'wildlife-preserve', 'Protecting and enhancing wildlife habitats on and around golf courses. Every fairway can be a sanctuary.', 'Wildlife conservation on golf courses', 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=400&fit=crop', 'https://example.com/wildlife', false, true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- CREATE DRAWS (Current and Past)
-- =============================================
-- Past completed draw (last month)
INSERT INTO public.draws (id, draw_date, draw_month, draw_year, status, logic_type, winning_numbers, total_prize_pool_cents, five_match_pool_cents, four_match_pool_cents, three_match_pool_cents, jackpot_rollover_cents, published_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
   (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date,
   EXTRACT(MONTH FROM DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::integer,
   EXTRACT(YEAR FROM DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::integer,
   'completed', 'random', 
   ARRAY[7, 14, 21, 28, 35], 
   5000000, 2000000, 1750000, 1250000, 0,
   DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')
ON CONFLICT (draw_month, draw_year) DO NOTHING;

-- Current month draw (scheduled/simulated)
INSERT INTO public.draws (id, draw_date, draw_month, draw_year, status, logic_type, total_prize_pool_cents, five_match_pool_cents, four_match_pool_cents, three_match_pool_cents, jackpot_rollover_cents)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date,
   EXTRACT(MONTH FROM CURRENT_DATE)::integer,
   EXTRACT(YEAR FROM CURRENT_DATE)::integer,
   'scheduled', 'random',
   7500000, 3000000, 2625000, 1875000, 0)
ON CONFLICT (draw_month, draw_year) DO NOTHING;

-- Next month draw (scheduled)
INSERT INTO public.draws (id, draw_date, draw_month, draw_year, status, logic_type, total_prize_pool_cents, five_match_pool_cents, four_match_pool_cents, three_match_pool_cents, jackpot_rollover_cents)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 months' - INTERVAL '1 day')::date,
   EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 month')::integer,
   EXTRACT(YEAR FROM CURRENT_DATE + INTERVAL '1 month')::integer,
   'scheduled', 'random',
   0, 0, 0, 0, 0)
ON CONFLICT (draw_month, draw_year) DO NOTHING;

-- =============================================
-- CREATE CHARITY EVENTS
-- =============================================
INSERT INTO public.charity_events (charity_id, title, description, event_date, location, is_active)
SELECT 
  c.id,
  'Annual Golf for Good Tournament',
  'Join us for our flagship charity tournament! All proceeds go to supporting youth golf programs.',
  CURRENT_DATE + INTERVAL '30 days',
  'Pebble Beach Golf Links, CA',
  true
FROM public.charities c WHERE c.slug = 'golf-for-good'
ON CONFLICT DO NOTHING;

INSERT INTO public.charity_events (charity_id, title, description, event_date, location, is_active)
SELECT 
  c.id,
  'Veterans Appreciation Day',
  'A special day honoring our veteran golfers with complimentary rounds and lunch.',
  CURRENT_DATE + INTERVAL '45 days',
  'TPC Sawgrass, FL',
  true
FROM public.charities c WHERE c.slug = 'veterans-green'
ON CONFLICT DO NOTHING;
