-- Phase 4 extends the existing courses table. It does not recreate or delete it.
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  position integer not null,
  created_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (course_id, position)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  estimated_minutes integer not null default 10,
  position integer not null,
  created_at timestamptz not null default now(),
  unique (module_id, slug),
  unique (module_id, position)
);

-- Public course content is readable, but the application cannot write it.
alter table public.modules enable row level security;
alter table public.lessons enable row level security;

revoke all on table public.modules from anon, authenticated;
revoke all on table public.lessons from anon, authenticated;
grant select on table public.modules to anon;
grant select on table public.lessons to anon;

-- Dropping first makes this setup safe to run again.
drop policy if exists "Module content is publicly readable" on public.modules;
drop policy if exists "Lesson content is publicly readable" on public.lessons;

create policy "Module content is publicly readable"
on public.modules
for select
to anon
using (true);

create policy "Lesson content is publicly readable"
on public.lessons
for select
to anon
using (true);
