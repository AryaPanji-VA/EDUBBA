-- Phase 11A: Learning Logs table.
-- Run manually in Supabase SQL Editor. No seed data.
-- SINGLE-USER LOCAL/PERSONAL only: no user_id required yet, auth not implemented.
begin;

create table if not exists public.learning_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  course_slug text not null check (length(course_slug) between 1 and 60),
  lesson_slug text not null check (length(lesson_slug) between 1 and 60),
  summary text not null check (length(summary) between 1 and 2000),
  concepts_learned text[] check (coalesce(array_length(concepts_learned, 1), 0) <= 20),
  weak_concepts text[] check (coalesce(array_length(weak_concepts, 1), 0) <= 20),
  misconceptions text[] check (coalesce(array_length(misconceptions, 1), 0) <= 10),
  next_step text check (length(coalesce(next_step, '')) <= 500),
  mastery_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No per-day unique index in v1: multiple sessions per lesson per day are allowed.
-- Dedup/consolidation is a later-phase concern; insert failures would break the Save flow.

create or replace function public.set_learning_logs_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_logs_updated_at on public.learning_logs;
create trigger learning_logs_updated_at before update on public.learning_logs
for each row execute function public.set_learning_logs_updated_at();

-- No anonymous or authenticated-user policies. Server-only service_role bypasses RLS.
alter table public.learning_logs enable row level security;
revoke all on table public.learning_logs from public, anon, authenticated;
grant select, insert, update, delete on table public.learning_logs to service_role;

do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'learning_logs') then
    raise exception 'learning_logs must have no public policies. Review existing policies manually.';
  end if;
end $$;

commit;
