-- Phase 5 adds reusable sources and connects them to existing lessons.
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  publisher text,
  source_type text not null check (
    source_type in ('documentation', 'textbook', 'course', 'article')
  ),
  created_at timestamptz not null default now(),
  unique (url)
);

-- A lesson can use many sources, and one source can support many lessons.
-- The two foreign keys together form this table's composite primary key.
create table if not exists public.lesson_sources (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  relevance_note text,
  primary key (lesson_id, source_id)
);

alter table public.sources enable row level security;
alter table public.lesson_sources enable row level security;

-- Public lesson sources are readable, but the application cannot write them.
revoke all on table public.sources from anon, authenticated;
revoke all on table public.lesson_sources from anon, authenticated;
grant select on table public.sources to anon;
grant select on table public.lesson_sources to anon;

drop policy if exists "Lesson sources are publicly readable" on public.sources;
drop policy if exists "Lesson source links are publicly readable" on public.lesson_sources;

create policy "Lesson sources are publicly readable"
on public.sources
for select
to anon
using (true);

create policy "Lesson source links are publicly readable"
on public.lesson_sources
for select
to anon
using (true);
