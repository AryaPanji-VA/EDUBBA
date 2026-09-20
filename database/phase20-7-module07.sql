-- Phase 20.7: Module 07 (Putting It Together) — Errors / Try Except Basics,
-- Problem Decomposition, Mini Project, Course Review / Final Practice.
-- REQUIRES database/phase20-6-module06.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- One NEW module plus four NEW lessons appended after the Collections module —
-- no existing lesson moves, no legacy identity is touched. Progress rows are
-- keyed by lesson slug, so existing completion is unaffected; nothing is
-- deleted or reset.

begin;

-- Insert the Module 07 row (or refresh its metadata on repeated runs).
insert into public.modules (course_id, slug, title, description, position)
select
  c.id,
  v.slug,
  v.title,
  v.description,
  v.position
from public.courses c
cross join (values
  ('programming-putting-it-together', 'Putting It Together', 'Handle expected failures, decompose problems, and combine the pieces into a working program.', 4)
) as v(slug, title, description, position)
where c.slug = 'programming'
on conflict (course_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  position = excluded.position;

-- Insert lessons 27-30 (or refresh their metadata on repeated runs).
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
  ('try-except-basics', 'Errors / Try Except Basics', 'Tangani kegagalan runtime yang diharapkan: try, except ValueError, dan fallback yang bermakna.', 12, 1),
  ('problem-decomposition', 'Problem Decomposition', 'Pecah masalah jadi INPUT → PROCESS → OUTPUT dan langkah kecil yang bisa diselesaikan satu per satu.', 12, 2),
  ('mini-project', 'Mini Project', 'Rakit Student Score Checker: input, konversi aman, keputusan, output, dan error handling.', 16, 3),
  ('course-review', 'Course Review / Final Practice', 'Panggil balik enam keluarga konsep dan buktikan lewat final challenge — course complete.', 14, 4)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-putting-it-together'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
