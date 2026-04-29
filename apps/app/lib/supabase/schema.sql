-- FILE: supabase/schema.sql

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  temperature_unit text not null default 'F' check (temperature_unit in ('C', 'F')),
  thermometer_location text not null default 'mouth',
  timezone text not null default 'UTC',
  onboarding_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  waking_temp_value numeric,
  waking_temp_unit text not null default 'F' check (waking_temp_unit in ('C', 'F')),
  waking_pulse_bpm integer,
  post_meal_temp_value numeric,
  post_meal_temp_unit text not null default 'F' check (post_meal_temp_unit in ('C', 'F')),
  post_meal_pulse_bpm integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;

drop policy if exists "Profiles can be read by owner" on public.profiles;
create policy "Profiles can be read by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles can be inserted by owner" on public.profiles;
create policy "Profiles can be inserted by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Entries can be read by owner" on public.daily_entries;
create policy "Entries can be read by owner"
on public.daily_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Entries can be inserted by owner" on public.daily_entries;
create policy "Entries can be inserted by owner"
on public.daily_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Entries can be updated by owner" on public.daily_entries;
create policy "Entries can be updated by owner"
on public.daily_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();