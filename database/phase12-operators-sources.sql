-- Phase 12.4.1: Operators lesson sources.
-- The operators lesson row already exists from phase4-seed.sql (position 3).
-- Run manually in Supabase SQL Editor. Idempotent on repeated runs.

insert into public.sources (title, url, publisher, source_type)
values
  (
    'Python Tutorial: Using Python as a Calculator',
    'https://docs.python.org/3/tutorial/introduction.html#using-python-as-a-calculator',
    'Python Software Foundation',
    'documentation'
  ),
  (
    'Python Standard Types: Boolean Operations and Comparisons',
    'https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not',
    'Python Software Foundation',
    'documentation'
  )
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_type = excluded.source_type;

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
    ('https://docs.python.org/3/tutorial/introduction.html#using-python-as-a-calculator', 'Beginner-oriented reference for arithmetic operators, division, floor division, remainder, and powers.'),
    ('https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not', 'Authoritative reference for comparisons and the boolean operators and, or, and not.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'programming'
  and m.slug = 'programming-building-blocks'
  and l.slug = 'operators'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
