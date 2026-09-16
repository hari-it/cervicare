-- Persistent educational progress for authenticated CERVICARE users.
-- Run manually in the Supabase SQL Editor. This file is not executed by the app.

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null check (
    topic in (
      'cervical-cancer',
      'hpv-vaccination',
      'prevention',
      'screening',
      'symptoms-risk-factors'
    )
  ),
  completed_steps integer not null default 0,
  total_steps integer not null default 3,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, topic)
);

alter table public.learning_progress enable row level security;

create policy "Users can read own learning progress"
  on public.learning_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own learning progress"
  on public.learning_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own learning progress"
  on public.learning_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own learning progress"
  on public.learning_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);
