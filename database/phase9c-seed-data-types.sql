-- Phase 9C: ensure the data-types lesson row and its source links exist.
-- The lesson body lives in TypeScript; the database stores metadata and references only.
-- Idempotent: every insert uses ON CONFLICT ... DO UPDATE with the same values,
-- so running this file twice (or after phase4-seed.sql) changes nothing.

-- 1. The lesson row. phase4-seed.sql already inserts this row; this upsert
--    guarantees it exists with the expected metadata even on older databases.
insert into public.lessons (module_id, slug, title, summary, estimated_minutes, position)
select
  m.id,
  lesson.slug,
  lesson.title,
  lesson.summary,
  lesson.estimated_minutes,
  lesson.position
from public.courses c
join public.modules m on m.course_id = c.id
join (
  values
    ('programming-building-blocks', 'data-types', 'Data Types', 'Describe the kinds of values a program can handle.', 14, 2)
) as lesson(module_slug, slug, title, summary, estimated_minutes, position)
  on lesson.module_slug = m.slug
where c.slug = 'programming'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

-- 2. One new authoritative source for Python's built-in types.
--    The tutorial source below already exists from phase5-seed.sql and is reused,
--    because the sources table is designed for reusable references.
insert into public.sources (title, url, publisher, source_type)
values
  (
    'Python Language Reference: The Standard Type Hierarchy',
    'https://docs.python.org/3/reference/datamodel.html#the-standard-type-hierarchy',
    'Python Software Foundation',
    'documentation'
  )
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_type = excluded.source_type;

-- 3. Link sources to the data-types lesson only. The where clause restricts
--    this to l.slug = 'data-types'; the Variables links are never touched.
insert into public.lesson_sources (lesson_id, source_id, relevance_note)
select
  l.id,
  s.id,
  source_link.relevance_note
from public.courses c
join public.modules m on m.course_id = c.id
join public.lessons l on l.module_id = m.id
cross join (
  values
    ('https://docs.python.org/3/reference/datamodel.html#the-standard-type-hierarchy', 'Authoritative reference for Python''s built-in types.'),
    ('https://docs.python.org/3/tutorial/introduction.html', 'Beginner introduction to numbers, strings, and basic types.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'programming'
  and m.slug = 'programming-building-blocks'
  and l.slug = 'data-types'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
