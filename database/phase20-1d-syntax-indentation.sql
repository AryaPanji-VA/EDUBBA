-- Phase 20.1D: beginner onboarding lesson "Syntax & Indentation" (syntax-indentation).
-- REQUIRES database/phase20-1c-print-output.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- Roadmap alignment for the Programming Fundamentals module:
--   1 what-is-programming · 2 hello-python · 3 print-output ·
--   4 syntax-indentation (NEW) · 5–6 reserved for the next Phase 20 lessons.
-- The legacy curriculum placeholders (programming-languages,
-- syntax-vs-semantics) are MOVED to positions 7–8 — out of the active
-- roadmap window, but never deleted. Only lesson metadata moves: progress
-- rows are keyed by lesson slug, so existing completion is unaffected.

begin;

-- Move the legacy placeholders below the reserved roadmap slots
-- (descending order avoids transient position ties).
update public.lessons l
set position = 8
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-fundamentals'
  and l.slug = 'syntax-vs-semantics';

update public.lessons l
set position = 7
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-fundamentals'
  and l.slug = 'programming-languages';

-- Insert lesson 04 (or refresh its metadata on repeated runs).
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
  ('syntax-indentation', 'Syntax & Indentation', 'Python peduli bagaimana code ditulis dan disusun — kenal syntax dan indentation.', 12, 4)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-fundamentals'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
