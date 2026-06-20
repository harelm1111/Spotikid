-- =========================================================
--  "What To Do Today" — Database setup
--  Run this entire file once in: Supabase Dashboard -> SQL Editor -> New Query
-- =========================================================

-- 1. PROFILES (extra info per user, on top of Supabase's built-in auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- Automatically create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ACTIVITIES
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  city text not null,
  address text,
  description text not null,
  hours text not null,
  age_min int not null default 0,
  age_max int not null default 14,
  category text not null,
  photo_url text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- 3. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references public.activities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  text text,
  photo_url text,
  created_at timestamptz default now()
);

-- =========================================================
--  ROW LEVEL SECURITY
--  Everyone can READ. Only logged-in users can WRITE.
-- =========================================================

alter table public.activities enable row level security;
alter table public.reviews enable row level security;
alter table public.profiles enable row level security;

-- Activities: anyone can view, only logged-in users can insert
create policy "Activities are viewable by everyone"
  on public.activities for select
  using (true);

create policy "Logged-in users can add activities"
  on public.activities for insert
  with check (auth.uid() = created_by);

-- Reviews: anyone can view, only logged-in users can insert their own
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Logged-in users can add their own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Profiles: anyone can view basic profile info
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- =========================================================
--  STORAGE (for activity photos + review photos)
-- =========================================================

insert into storage.buckets (id, name, public)
values ('activity-photos', 'activity-photos', true)
on conflict (id) do nothing;

create policy "Anyone can view activity photos"
  on storage.objects for select
  using (bucket_id = 'activity-photos');

create policy "Logged-in users can upload activity photos"
  on storage.objects for insert
  with check (bucket_id = 'activity-photos' and auth.role() = 'authenticated');
