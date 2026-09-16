-- CERVICARE schema
-- Run in the Supabase SQL editor after creating a project.
-- Then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.healthcare_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  resource_type text not null check (
    resource_type in ('screening_centre', 'hospital', 'ngo', 'government_scheme')
  ),
  city text,
  region text,
  description text,
  contact text,
  website text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.healthcare_resources enable row level security;

create policy "Public can read healthcare resources"
  on public.healthcare_resources
  for select
  to anon, authenticated
  using (true);

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);
