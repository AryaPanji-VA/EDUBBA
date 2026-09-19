-- Phase 20.4: Module 04 (Repetition) — For Loops, While Loops, Range & Loop Patterns.
-- REQUIRES database/phase20-3b-user-input.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- The legacy `loops` lesson keeps its persisted identity (slug, progress,
-- mastery evidence, Robin contracts) and is modernized IN PLACE as For Loops:
-- only its metadata (title, summary, estimated minutes) moves. While Loops
-- and Range & Loop Patterns are NEW lessons inserted after it; Functions
-- shifts down to close the module. Only lesson metadata moves — progress
-- rows are keyed by lesson slug, so existing completion is unaffected and
-- nothing is deleted or reset.

begin;

-- Modernize the legacy loops lesson in place (For Loops ownership).
update public.lessons l
set title = 'For Loops',
    summary = 'Ulangi kerja dengan for: sequence, loop variable, dan body yang menjorok.',
    estimated_minutes = 12
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'loops';

-- Shift Functions down (Repetition lessons insert at 11 and 12).
update public.lessons l
set position = 13
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'functions';

-- Insert lessons 17 and 18 (or refresh their metadata on repeated runs).
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
  ('while-loops', 'While Loops', 'Ulangi selama kondisi masih True — starting state, condition, update.', 12, 11),
  ('range-loop-patterns', 'Range & Loop Patterns', 'range() menghasilkan deret integer untuk loop — start, stop yang dikecualikan, dan step.', 12, 12)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-building-blocks'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
