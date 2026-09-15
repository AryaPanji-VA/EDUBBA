-- Phase 11B: Practice Lab progress table.
-- Run manually in Supabase SQL Editor. No seed data.
-- SINGLE-USER LOCAL/PERSONAL only: no user_id required yet, auth not implemented.
begin;

create table if not exists public.practice_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  course_slug text not null check (length(course_slug) between 1 and 60),
  current_exercise_id text,
  completed_exercise_ids text[] not null default '{}',
  progress_state jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practice_progress
  add column if not exists progress_state jsonb not null default '{}'::jsonb;

drop index if exists public.practice_progress_unique;

-- Phase 11B is single-user/local, so course (practice track) is the concrete upsert key.
-- Replace this with a per-user unique constraint when authentication is introduced.
alter table public.practice_progress
  drop constraint if exists practice_progress_course_key;
alter table public.practice_progress
  add constraint practice_progress_course_key unique (course_slug);

create or replace function public.set_practice_progress_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists practice_progress_updated_at on public.practice_progress;
create trigger practice_progress_updated_at before update on public.practice_progress
for each row execute function public.set_practice_progress_updated_at();

-- No anonymous or authenticated-user policies. Server-only service_role bypasses RLS.
alter table public.practice_progress enable row level security;
revoke all on table public.practice_progress from public, anon, authenticated;
grant select, insert, update, delete on table public.practice_progress to service_role;

do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'practice_progress') then
    raise exception 'practice_progress must have no public policies. Review existing policies manually.';
  end if;
end $$;

commit;
