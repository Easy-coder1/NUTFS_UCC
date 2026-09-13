-- ============================================================
-- NUTFS UCC — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the students table
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text not null,
  program_of_study text not null,
  level text not null,
  hall_of_affiliation text not null,
  residence_type text not null check (residence_type in ('Hall', 'Hostel')),
  room_number text default '',
  passport_photo_url text default '',
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.students enable row level security;

-- 3. RLS Policies

-- Anyone (anon) can INSERT (public registration form)
create policy "Anyone can register"
  on public.students for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users can SELECT (admin dashboard)
create policy "Authenticated users can view all students"
  on public.students for select
  to authenticated
  using (true);

-- Only authenticated users can DELETE
create policy "Authenticated users can delete students"
  on public.students for delete
  to authenticated
  using (true);

-- Only authenticated users can UPDATE
create policy "Authenticated users can update students"
  on public.students for update
  to authenticated
  using (true);

-- 4. Create the passport-photos storage bucket
insert into storage.buckets (id, name, public)
values ('passport-photos', 'passport-photos', true)
on conflict (id) do nothing;

-- 5. Storage Policies

-- Anyone can upload to passport-photos (for public registration)
create policy "Anyone can upload passport photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'passport-photos');

-- Anyone can read passport photos (public bucket)
create policy "Anyone can view passport photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'passport-photos');

-- Only authenticated users can delete passport photos
create policy "Authenticated users can delete passport photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'passport-photos');
