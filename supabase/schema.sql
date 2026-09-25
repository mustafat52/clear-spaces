-- ============================================================
-- ClearSpaces — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- ============================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- One row per user (patient or staff). Created automatically on signup
-- by the trigger below — never insert into this manually except when
-- promoting a user to staff (see bottom of this file).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'staff')),
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- Patient-visible session data. shared_notes is written by staff after a
-- session and is readable by the patient it belongs to.
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('regular', 'urgent')),
  session_date date not null,
  time_slot text not null,
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'completed')),
  txn_ref text,
  client_notes text,
  shared_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clinical / process notes. Deliberately a SEPARATE table with its own
-- RLS so a patient's access token can never read this data, even if a
-- future query mistakenly selects "select * from sessions".
create table public.session_clinical_notes (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  clinical_notes text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- Slots staff have manually blocked out (Munira unavailable).
create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  time_slot text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (block_date, time_slot)
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone, email)
  values (
    new.id,
    'patient',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- HELPER: is the current user staff?
-- ============================================================

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'staff'
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_clinical_notes enable row level security;
alter table public.blocked_slots enable row level security;

-- profiles: a user reads/updates their own row; staff read everyone's
create policy "read own or staff read all profiles"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

create policy "update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- sessions: patient reads/creates their own; staff read + update all
create policy "read own sessions or staff read all"
  on public.sessions for select
  using (patient_id = auth.uid() or public.is_staff());

create policy "patient creates own session request"
  on public.sessions for insert
  with check (patient_id = auth.uid());

create policy "staff update any session"
  on public.sessions for update
  using (public.is_staff());

-- session_clinical_notes: staff only, full stop
create policy "staff only clinical notes"
  on public.session_clinical_notes for all
  using (public.is_staff())
  with check (public.is_staff());

-- blocked_slots: anyone can read (needed to show availability before
-- booking); only staff can create/remove blocks
create policy "anyone reads blocked slots"
  on public.blocked_slots for select
  using (true);

create policy "staff create blocked slots"
  on public.blocked_slots for insert
  with check (public.is_staff());

create policy "staff delete blocked slots"
  on public.blocked_slots for delete
  using (public.is_staff());

-- ============================================================
-- AVAILABILITY RPC
-- Returns which date/time_slot combinations are unavailable, without
-- exposing any patient's identity — safe to call from anyone, logged
-- in or not, so the booking calendar can grey out taken slots.
-- ============================================================

create or replace function public.get_taken_slots(from_date date, to_date date)
returns table (session_date date, time_slot text)
language sql
stable
security definer set search_path = public
as $$
  select session_date, time_slot
  from public.sessions
  where status in ('pending', 'confirmed')
    and session_date between from_date and to_date
  union
  select block_date, time_slot
  from public.blocked_slots
  where block_date between from_date and to_date;
$$;

grant execute on function public.get_taken_slots(date, date) to anon, authenticated;

-- ============================================================
-- ONE-TIME MANUAL STEP — promote a staff account
-- ============================================================
-- There is no self-signup for staff. To create the manager/assistant
-- login:
--   1. Go to the live site and sign up as a normal patient using the
--      email you want the staff account to use.
--   2. Come back here and run:
--
--      update public.profiles set role = 'staff' where email = 'manager@example.com';
--
-- That account can now log in at /staff/login instead of /login.