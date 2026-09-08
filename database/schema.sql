-- Create the first ROBIN database table.
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  total_lessons integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS controls which rows each Supabase role may access.
alter table public.courses enable row level security;

-- Keep the application read-only at the database permission level too.
revoke all on table public.courses from anon, authenticated;
grant select on table public.courses to anon;

-- Recreating this policy makes the setup script safe to run again.
drop policy if exists "Course metadata is publicly readable" on public.courses;

create policy "Course metadata is publicly readable"
on public.courses
for select
to anon
using (true);
