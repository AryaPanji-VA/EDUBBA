-- Run manually in Supabase SQL Editor. No mastery data is seeded.
-- SINGLE-USER LOCAL/PERSONAL only: no user_id yet because auth is not implemented.
begin;

create table if not exists public.concept_mastery (
  id uuid primary key default gen_random_uuid(),
  lesson_slug text not null check (lesson_slug in ('variables')),
  concept_key text not null check (concept_key in ('variable', 'assignment', 'reassignment', 'expression', 'name_binding', 'identifier_naming')),
  state text not null default 'unseen' check (state in ('unseen', 'shaky', 'developing', 'strong')),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  success_count integer not null default 0 check (success_count >= 0),
  struggle_count integer not null default 0 check (struggle_count >= 0),
  last_evidence_type text check (last_evidence_type in ('correct_prediction', 'incorrect_prediction', 'correct_practice', 'incorrect_practice', 'robin_check_strong', 'robin_check_developing', 'robin_check_shaky')),
  last_evidence_at timestamptz,
  last_attempt_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_slug, concept_key)
);

-- A CHECK constraint limits state to the four allowed values.
-- CHECK rejects any INSERT or UPDATE that would store a different string.
-- This is a database-level guarantee: even server code cannot bypass it.

create or replace function public.set_concept_mastery_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists concept_mastery_updated_at on public.concept_mastery;
create trigger concept_mastery_updated_at before update on public.concept_mastery
for each row execute function public.set_concept_mastery_updated_at();

-- No anonymous or authenticated-user policies. Server-only service_role bypasses RLS.
-- This is NOT per-user authorization: use only in local/personal development.
alter table public.concept_mastery enable row level security;
revoke all on table public.concept_mastery from public, anon, authenticated;
grant select, insert, update on table public.concept_mastery to service_role;

-- Fail closed if someone previously created policies on this table; do not alter them silently.
do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'concept_mastery') then
    raise exception 'concept_mastery must have no public policies. Review existing policies manually.';
  end if;
end $$;

commit;
