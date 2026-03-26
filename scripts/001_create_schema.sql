-- Golf Charity Subscription Platform Schema
-- 001_create_schema.sql

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "admin_select_all_profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "admin_update_all_profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- CHARITIES TABLE
-- =============================================
create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  logo_url text,
  cover_image_url text,
  website_url text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.charities enable row level security;

-- Everyone can view active charities
create policy "charities_select_public" on public.charities for select using (is_active = true);
-- Admins can do everything
create policy "admin_all_charities" on public.charities for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- CHARITY EVENTS TABLE (e.g., golf days)
-- =============================================
create table if not exists public.charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references public.charities(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz,
  location text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.charity_events enable row level security;

create policy "charity_events_select_public" on public.charity_events for select using (is_active = true);
create policy "admin_all_charity_events" on public.charity_events for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price_cents integer not null,
  interval text not null check (interval in ('monthly', 'yearly')),
  prize_pool_contribution_cents integer not null,
  min_charity_percentage integer default 10,
  is_active boolean default true,
  stripe_price_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscription_plans enable row level security;

create policy "plans_select_public" on public.subscription_plans for select using (is_active = true);
create policy "admin_all_plans" on public.subscription_plans for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
create type subscription_status as enum ('active', 'cancelled', 'lapsed', 'pending');

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  charity_id uuid references public.charities(id),
  charity_percentage integer default 10 check (charity_percentage >= 10 and charity_percentage <= 100),
  status subscription_status default 'pending',
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions for update using (auth.uid() = user_id);
create policy "admin_all_subscriptions" on public.subscriptions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- GOLF SCORES TABLE (Rolling 5 scores)
-- =============================================
create table if not exists public.golf_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 45),
  played_date date not null,
  created_at timestamptz default now()
);

alter table public.golf_scores enable row level security;

create policy "scores_select_own" on public.golf_scores for select using (auth.uid() = user_id);
create policy "scores_insert_own" on public.golf_scores for insert with check (auth.uid() = user_id);
create policy "scores_update_own" on public.golf_scores for update using (auth.uid() = user_id);
create policy "scores_delete_own" on public.golf_scores for delete using (auth.uid() = user_id);
create policy "admin_all_scores" on public.golf_scores for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- DRAWS TABLE
-- =============================================
create type draw_status as enum ('scheduled', 'simulated', 'published', 'completed');
create type draw_logic_type as enum ('random', 'algorithmic');

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_date date not null,
  draw_month integer not null,
  draw_year integer not null,
  logic_type draw_logic_type default 'random',
  status draw_status default 'scheduled',
  winning_numbers integer[] check (array_length(winning_numbers, 1) = 5),
  total_prize_pool_cents integer default 0,
  five_match_pool_cents integer default 0,
  four_match_pool_cents integer default 0,
  three_match_pool_cents integer default 0,
  jackpot_rollover_cents integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(draw_month, draw_year)
);

alter table public.draws enable row level security;

-- Everyone can see published draws
create policy "draws_select_published" on public.draws for select using (status = 'published' or status = 'completed');
create policy "admin_all_draws" on public.draws for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- DRAW ENTRIES TABLE (User participation)
-- =============================================
create table if not exists public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scores integer[] not null check (array_length(scores, 1) = 5),
  created_at timestamptz default now(),
  unique(draw_id, user_id)
);

alter table public.draw_entries enable row level security;

create policy "entries_select_own" on public.draw_entries for select using (auth.uid() = user_id);
create policy "entries_insert_own" on public.draw_entries for insert with check (auth.uid() = user_id);
create policy "admin_all_entries" on public.draw_entries for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- WINNERS TABLE
-- =============================================
create type winner_match_type as enum ('five_match', 'four_match', 'three_match');
create type winner_verification_status as enum ('pending', 'approved', 'rejected');
create type winner_payment_status as enum ('pending', 'paid');

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_id uuid not null references public.draw_entries(id) on delete cascade,
  match_type winner_match_type not null,
  matched_numbers integer[],
  prize_amount_cents integer not null,
  verification_status winner_verification_status default 'pending',
  verification_proof_url text,
  verification_notes text,
  payment_status winner_payment_status default 'pending',
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.winners enable row level security;

create policy "winners_select_own" on public.winners for select using (auth.uid() = user_id);
create policy "winners_update_own" on public.winners for update using (auth.uid() = user_id);
create policy "admin_all_winners" on public.winners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- CHARITY DONATIONS TABLE
-- =============================================
create table if not exists public.charity_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  charity_id uuid not null references public.charities(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount_cents integer not null,
  is_independent boolean default false,
  stripe_payment_id text,
  created_at timestamptz default now()
);

alter table public.charity_donations enable row level security;

create policy "donations_select_own" on public.charity_donations for select using (auth.uid() = user_id);
create policy "donations_insert_own" on public.charity_donations for insert with check (auth.uid() = user_id);
create policy "admin_all_donations" on public.charity_donations for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- JACKPOT ROLLOVER TRACKING
-- =============================================
create table if not exists public.jackpot_rollovers (
  id uuid primary key default gen_random_uuid(),
  from_draw_id uuid not null references public.draws(id) on delete cascade,
  to_draw_id uuid references public.draws(id) on delete set null,
  amount_cents integer not null,
  created_at timestamptz default now()
);

alter table public.jackpot_rollovers enable row level security;

create policy "rollovers_select_public" on public.jackpot_rollovers for select using (true);
create policy "admin_all_rollovers" on public.jackpot_rollovers for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- =============================================
-- TRIGGER: Auto-create profile on user signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================
-- TRIGGER: Maintain rolling 5 scores
-- =============================================
create or replace function public.maintain_rolling_scores()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  score_count integer;
begin
  -- Count current scores for this user
  select count(*) into score_count
  from public.golf_scores
  where user_id = new.user_id;

  -- If more than 5 scores, delete the oldest
  if score_count > 5 then
    delete from public.golf_scores
    where id in (
      select id from public.golf_scores
      where user_id = new.user_id
      order by played_date asc, created_at asc
      limit (score_count - 5)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists maintain_rolling_scores_trigger on public.golf_scores;

create trigger maintain_rolling_scores_trigger
  after insert on public.golf_scores
  for each row
  execute function public.maintain_rolling_scores();

-- =============================================
-- FUNCTION: Calculate matching numbers
-- =============================================
create or replace function public.count_matching_numbers(user_scores integer[], winning_numbers integer[])
returns integer
language plpgsql
as $$
declare
  match_count integer := 0;
  score integer;
begin
  foreach score in array user_scores loop
    if score = any(winning_numbers) then
      match_count := match_count + 1;
    end if;
  end loop;
  return match_count;
end;
$$;

-- =============================================
-- Insert default subscription plans
-- =============================================
insert into public.subscription_plans (name, slug, description, price_cents, interval, prize_pool_contribution_cents, min_charity_percentage)
values 
  ('Monthly Plan', 'monthly', 'Monthly subscription with full access to draws and charity giving', 1999, 'monthly', 1000, 10),
  ('Yearly Plan', 'yearly', 'Annual subscription with 2 months free - best value!', 19990, 'yearly', 10000, 10)
on conflict (slug) do nothing;

-- =============================================
-- Insert sample charities
-- =============================================
insert into public.charities (name, slug, description, short_description, is_featured, is_active)
values 
  ('Golf for Good Foundation', 'golf-for-good', 'Bringing the joy of golf to underserved communities worldwide. We provide equipment, training, and opportunities for young people to experience the game.', 'Bringing golf to underserved communities', true, true),
  ('Green Fairways Initiative', 'green-fairways', 'Dedicated to environmental sustainability in golf. We work with courses to reduce water usage, eliminate harmful chemicals, and protect local ecosystems.', 'Environmental sustainability in golf', true, true),
  ('Junior Golf Academy', 'junior-golf', 'Providing free golf lessons and mentorship to young players from low-income families. Building character through sport.', 'Free golf lessons for underprivileged youth', false, true),
  ('Veterans on the Green', 'veterans-green', 'Using golf as therapy and community building for military veterans. Helping heroes find peace and purpose on the course.', 'Golf therapy for military veterans', true, true)
on conflict (slug) do nothing;
