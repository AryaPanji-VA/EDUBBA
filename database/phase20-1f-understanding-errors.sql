-- Phase 20.1F: beginner onboarding lesson "Understanding Errors" (understanding-errors).
-- REQUIRES database/phase20-1e-comments.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- This closes the ACTIVE roadmap of Module 01 (Programming Fundamentals):
--   1 what-is-programming · 2 hello-python · 3 print-output ·
--   4 syntax-indentation · 5 comments · 6 understanding-errors (NEW).
-- The legacy placeholders stay parked at 7-8 (per Phase 20.1D) — never
-- deleted. Only lesson metadata is written: progress rows are keyed by
-- lesson slug, so existing completion is unaffected.

begin;

-- Insert lesson 06 (or refresh its metadata on repeated runs).
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
  ('understanding-errors', 'Understanding Errors', 'Error itu petunjuk, bukan kegagalan — baca pesannya, perbaiki, jalankan lagi.', 12, 6)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-fundamentals'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
