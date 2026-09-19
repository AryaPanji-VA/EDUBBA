-- Phase 20.5: Module 05 (Reusable Code) — Functions, Parameters & Arguments,
-- Return Values, Scope Basics.
-- REQUIRES database/phase20-4-module04.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- The legacy `functions` lesson keeps its persisted identity (slug, progress,
-- mastery evidence, Robin contracts) and is modernized IN PLACE: only its
-- metadata (summary, estimated minutes) moves. Parameters & Arguments,
-- Return Values, and Scope Basics are NEW lessons inserted after it — no
-- other lesson moves. Progress rows are keyed by lesson slug, so existing
-- completion is unaffected; nothing is deleted or reset.

begin;

-- Modernize the legacy functions lesson in place (definition + call ownership).
update public.lessons l
set title = 'Functions',
    summary = 'Bungkus langkah jadi satu nama — definisikan sekali, panggil berkali-kali.',
    estimated_minutes = 14
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'functions';

-- Insert lessons 20-22 (or refresh their metadata on repeated runs).
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
  ('parameters-arguments', 'Parameters & Arguments', 'Function menerima data: parameter di definition, argument di call.', 12, 14),
  ('return-values', 'Return Values', 'print menampilkan, return mengembalikan value ke program.', 12, 15),
  ('scope-basics', 'Scope Basics', 'Variable di dalam function hidup di area kerja lokalnya sendiri.', 12, 16)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-building-blocks'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
