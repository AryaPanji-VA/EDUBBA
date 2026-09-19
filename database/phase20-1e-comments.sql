-- Phase 20.1E: beginner onboarding lesson "Comments" (comments).
-- REQUIRES database/phase20-1d-syntax-indentation.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- Roadmap alignment for the Programming Fundamentals module:
--   1 what-is-programming · 2 hello-python · 3 print-output ·
--   4 syntax-indentation · 5 comments (NEW) · 6 reserved for
--   Understanding Errors. The legacy placeholders stay at 7-8 (per Phase
--   20.1D) — never deleted. Only lesson metadata is written: progress rows
--   are keyed by lesson slug, so existing completion is unaffected.

begin;

-- Insert lesson 05 (or refresh its metadata on repeated runs).
insert into public.lessons (module_id, slug, title, summary, estimated_minutes, position)
select
  m.id,
  v.slug,
  v.title,
  v.summary,
  v.estimated_minutes,
  v.position
from public.modules m
cross join (values
  ('comments', 'Comments', 'Tinggalkan catatan untuk manusia di dalam code — dan lihat Python melewatinya.', 10, 5)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-fundamentals'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
