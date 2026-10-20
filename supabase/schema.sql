-- Run this entire file in Supabase Dashboard -> SQL Editor.
-- IMPORTANT: inspect the policies before inviting real users.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  monthly_income numeric(12,2) not null default 0 check (monthly_income >= 0),
  currency text not null default 'INR' check (currency in ('INR','USD','GBP','EUR')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR',
  category text not null default 'Other',
  type text not null check (type in ('income','expense')),
  transaction_date date not null default current_date,
  note text check (char_length(note) <= 500),
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_date_idx on public.transactions(user_id, transaction_date desc);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  monthly_limit numeric(12,2) not null check (monthly_limit >= 0),
  currency text not null default 'INR',
  month_start date not null,
  created_at timestamptz not null default now(),
  unique(user_id, category, month_start)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  billing_cycle text not null check (billing_cycle in ('weekly','monthly','quarterly','yearly')),
  next_renewal date,
  category text not null default 'Other',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (char_length(event_type) <= 80),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_events_created_idx on public.activity_events(created_at desc);
create index if not exists activity_events_user_idx on public.activity_events(user_id, created_at desc);

-- Create a profile when an auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "transactions own all" on public.transactions;
create policy "transactions own all" on public.transactions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "budgets own all" on public.budgets;
create policy "budgets own all" on public.budgets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions own all" on public.subscriptions;
create policy "subscriptions own all" on public.subscriptions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "events own select" on public.activity_events;
create policy "events own select" on public.activity_events for select to authenticated using (auth.uid() = user_id);
drop policy if exists "events own insert" on public.activity_events;
create policy "events own insert" on public.activity_events for insert to authenticated with check (auth.uid() = user_id);

-- No client-facing admin policy exists. The server-only admin key is used after
-- checking auth user app_metadata.role === 'admin'. Never expose that key in the browser.


-- Upgrade existing installs safely with optional transaction context fields.
alter table public.transactions add column if not exists note text check (char_length(note) <= 500);
alter table public.transactions add column if not exists rating smallint check (rating between 1 and 5);
