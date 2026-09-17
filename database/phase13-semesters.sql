-- Phase 13.1: Semester foundation for the official curriculum.
-- Run manually in Supabase SQL Editor. Idempotent and additive.
-- The official Semester 1-8 curriculum is authoritative: this migration only
-- adds the structural semester representation. No new courses are created.
begin;

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  number integer not null check (number >= 1),
  title text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists semesters_number_unique on public.semesters (number);

-- Semester metadata is public curriculum metadata, like courses/modules/lessons.
alter table public.semesters enable row level security;
revoke all on table public.semesters from public, anon, authenticated;
grant select on table public.semesters to anon;

drop policy if exists "Semester metadata is publicly readable" on public.semesters;
create policy "Semester metadata is publicly readable"
on public.semesters
for select
to anon
using (true);

-- Link courses to their semester. Nullable: existing course rows keep working
-- before they are placed, and course reads do not change shape.
alter table public.courses
  add column if not exists semester_id uuid references public.semesters(id);

-- Seed the eight semester shells with neutral titles. The official curriculum
-- owns all naming and course placement. ON CONFLICT keeps re-runs safe.
insert into public.semesters (number, title)
values
  (1, 'Semester 1'),
  (2, 'Semester 2'),
  (3, 'Semester 3'),
  (4, 'Semester 4'),
  (5, 'Semester 5'),
  (6, 'Semester 6'),
  (7, 'Semester 7'),
  (8, 'Semester 8')
on conflict (number) do update set
  title = excluded.title;

-- Place only the seven already-seeded Semester 1 courses. Semesters 2-8 stay
-- empty until the official course lists are supplied. Re-runs do not move a
-- course that was already placed.
update public.courses
set semester_id = (select id from public.semesters where number = 1)
where slug in ('programming', 'design-thinking', 'discrete-math', 'hci', 'algorithms', 'parallel', 'networking')
  and semester_id is null;

commit;
