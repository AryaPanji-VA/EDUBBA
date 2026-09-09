-- Run manually in Supabase SQL Editor. No personal memories are seeded.
begin;
create table if not exists public.robin_memories (
  id uuid primary key default gen_random_uuid(), -- stable identity for exact deletion
  category text not null check (category in ('preference', 'learning')),
  key text not null check (length(key) between 1 and 40),
  value text not null check (length(value) between 1 and 40),
  status text,
  confidence numeric check (confidence between 0 and 1),
  source text not null default 'explicit' check (source = 'explicit'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, key), -- UPSERT replaces a value instead of duplicating it
  check (
    (category = 'preference' and status is null and (
      (key = 'explanation_style' and value in ('analogy-first', 'code-first', 'formal-first')) or
      (key = 'answer_length' and value in ('concise', 'detailed'))
    )) or
    (category = 'learning' and key in ('variables', 'name_binding', 'assignment_vs_comparison')
      and status is not null and status = value and value in ('understood', 'shaky', 'struggling'))
  )
);

create or replace function public.set_robin_memory_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists robin_memory_updated_at on public.robin_memories;
create trigger robin_memory_updated_at before update on public.robin_memories
for each row execute function public.set_robin_memory_updated_at();

-- No anonymous or authenticated-user policies. Server-only service_role bypasses RLS.
-- This is NOT per-user authorization: use only in local/personal development.
alter table public.robin_memories enable row level security;
revoke all on table public.robin_memories from public, anon, authenticated;
grant select, insert, update, delete on table public.robin_memories to service_role;
-- Fail closed if someone previously created policies on this table; do not alter them silently.
do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'robin_memories') then
    raise exception 'robin_memories must have no public policies. Review existing policies manually.';
  end if;
end $$;
commit;
