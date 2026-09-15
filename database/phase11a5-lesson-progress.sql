-- Phase 11A.5: Lesson Progress table.
-- Run manually in Supabase SQL Editor. No seed data.
-- SINGLE-USER LOCAL/PERSONAL only: no user_id required yet, auth not implemented.
begin;

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  course_slug text not null check (length(course_slug) between 1 and 60),
  lesson_slug text not null check (length(lesson_slug) between 1 and 60),
  current_activity_id text,
  completed_activity_ids text[] not null default '{}',
  progress_state jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_progress
  add column if not exists progress_state jsonb not null default '{}'::jsonb;

drop index if exists public.lesson_progress_unique;

-- Phase 11A.5 is single-user/local, so course + lesson is the concrete upsert key.
-- Replace this with a per-user unique constraint when authentication is introduced.
alter table public.lesson_progress
  drop constraint if exists lesson_progress_course_lesson_key;
alter table public.lesson_progress
  add constraint lesson_progress_course_lesson_key unique (course_slug, lesson_slug);

create or replace function public.set_lesson_progress_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lesson_progress_updated_at on public.lesson_progress;
create trigger lesson_progress_updated_at before update on public.lesson_progress
for each row execute function public.set_lesson_progress_updated_at();

-- No anonymous or authenticated-user policies. Server-only service_role bypasses RLS.
alter table public.lesson_progress enable row level security;
revoke all on table public.lesson_progress from public, anon, authenticated;
grant select, insert, update, delete on table public.lesson_progress to service_role;

do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lesson_progress') then
    raise exception 'lesson_progress must have no public policies. Review existing policies manually.';
  end if;
end $$;

commit;
