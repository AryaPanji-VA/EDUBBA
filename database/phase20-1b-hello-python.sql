-- Phase 20.1B: beginner onboarding lesson "Kenalan dengan Python" (hello-python).
-- REQUIRES database/phase4-seed.sql first (course + programming-fundamentals module).
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
-- Position: inserted after 'what-is-programming' as the second lesson of the
-- Programming Fundamentals module; the two later lessons shift down one slot.
-- Only lesson metadata moves — progress rows are keyed by lesson, never by
-- position, so existing lesson progress is unaffected.

begin;

-- Shift the two later lessons down (descending order avoids transient ties).
update public.lessons l
set position = 4
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-fundamentals'
  and l.slug = 'syntax-vs-semantics';

update public.lessons l
set position = 3
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-fundamentals'
  and l.slug = 'programming-languages';

-- Insert the new lesson (or refresh its metadata on repeated runs).
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
  ('hello-python', 'Kenalan dengan Python', 'Kenali Python sebagai bahasa, tulis instruksi pertama, dan lihat code berubah jadi output.', 12, 2)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-fundamentals'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
