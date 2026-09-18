-- Phase 17.1: local identity isolation for learning state.
-- Run manually in Supabase SQL Editor before testing a second local user.
-- This is identity partitioning for a personal/local app, NOT authentication
-- or authorization suitable for a public multi-user deployment.
begin;

-- Existing single-user rows belong to the migrated Arya local identity.
-- This UUID matches ARYA_LOCAL_USER_ID in lib/local-user/local-users.ts.
alter table public.lesson_progress add column if not exists local_user_id uuid;
alter table public.practice_progress add column if not exists local_user_id uuid;
alter table public.concept_mastery add column if not exists local_user_id uuid;
alter table public.learning_logs add column if not exists local_user_id uuid;

update public.lesson_progress set local_user_id = '00000000-0000-4000-8000-000000000001' where local_user_id is null;
update public.practice_progress set local_user_id = '00000000-0000-4000-8000-000000000001' where local_user_id is null;
update public.concept_mastery set local_user_id = '00000000-0000-4000-8000-000000000001' where local_user_id is null;
update public.learning_logs set local_user_id = '00000000-0000-4000-8000-000000000001' where local_user_id is null;

alter table public.lesson_progress alter column local_user_id set not null;
alter table public.practice_progress alter column local_user_id set not null;
alter table public.concept_mastery alter column local_user_id set not null;
alter table public.learning_logs alter column local_user_id set not null;

alter table public.lesson_progress drop constraint if exists lesson_progress_course_lesson_key;
alter table public.lesson_progress drop constraint if exists lesson_progress_local_user_course_lesson_key;
alter table public.lesson_progress add constraint lesson_progress_local_user_course_lesson_key
  unique (local_user_id, course_slug, lesson_slug);

alter table public.practice_progress drop constraint if exists practice_progress_course_key;
alter table public.practice_progress drop constraint if exists practice_progress_local_user_course_key;
alter table public.practice_progress add constraint practice_progress_local_user_course_key
  unique (local_user_id, course_slug);

alter table public.concept_mastery drop constraint if exists concept_mastery_lesson_slug_concept_key_key;
alter table public.concept_mastery drop constraint if exists concept_mastery_local_user_lesson_concept_key;
alter table public.concept_mastery add constraint concept_mastery_local_user_lesson_concept_key
  unique (local_user_id, lesson_slug, concept_key);

create index if not exists learning_logs_local_user_created_idx
  on public.learning_logs (local_user_id, created_at desc);

-- Keep the existing server-only model: RLS stays enabled and no anon or
-- authenticated policies are added. The service credential still bypasses
-- RLS, so every server query MUST retain its local_user_id filter.
alter table public.lesson_progress enable row level security;
alter table public.practice_progress enable row level security;
alter table public.concept_mastery enable row level security;
alter table public.learning_logs enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['lesson_progress', 'practice_progress', 'concept_mastery', 'learning_logs']
  loop
    if exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name) then
      raise exception '% must have no public policies. Review existing policies manually.', table_name;
    end if;
  end loop;
end $$;

commit;
