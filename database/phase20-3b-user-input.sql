-- Phase 20.3B: Module 03 lesson "User Input" (user-input).
-- REQUIRES database/phase20-2f-booleans.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- Module 03 (Program Logic) roadmap: operators (7 in this module's legacy
-- numbering: building-blocks position 7) · user-input (NEW, position 8) ·
-- conditionals follows. The three legacy block lessons after the insertion
-- point shift down one slot each. Only lesson metadata moves — progress rows
-- are keyed by lesson slug, so existing completion is unaffected.

begin;

-- Shift the legacy block lessons down (descending order avoids transient ties).
update public.lessons l
set position = 11
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'functions';

update public.lessons l
set position = 10
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'loops';

update public.lessons l
set position = 9
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'conditionals';

-- Insert lesson 14 (or refresh its metadata on repeated runs).
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
  ('user-input', 'User Input', 'Terima data dari orang yang menjalankan program — dan selalu sebagai string.', 12, 8)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-building-blocks'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
