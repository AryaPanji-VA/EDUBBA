-- Phase 20.2D: Module 02 lesson "Casting" (casting).
-- REQUIRES database/phase20-2c-numbers.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- Module 02 (Values & Data) roadmap inside the programming-building-blocks
-- module: 1 variables · 2 data-types · 3 numbers · 4 casting (NEW) ·
-- [5-6 reserved for Strings / Booleans]. The four legacy block lessons shift
-- down one slot each. Only lesson metadata moves — progress rows are keyed
-- by lesson slug, so existing completion is unaffected.

begin;

-- Shift the legacy block lessons down (descending order avoids transient ties).
update public.lessons l
set position = 8
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'functions';

update public.lessons l
set position = 7
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'loops';

update public.lessons l
set position = 6
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'conditionals';

update public.lessons l
set position = 5
from public.modules m
where l.module_id = m.id
  and m.slug = 'programming-building-blocks'
  and l.slug = 'operators';

-- Insert lesson 10 (or refresh its metadata on repeated runs).
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
  ('casting', 'Casting', 'Ubah value ke type lain dengan int(), float(), dan str() — sengaja dan sadar.', 12, 4)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-building-blocks'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
