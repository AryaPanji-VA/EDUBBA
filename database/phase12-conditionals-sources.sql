-- Phase 12.1: Conditionals lesson sources.
-- The conditionals lesson row already exists from phase4-seed.sql (position 4);
-- this file links authoritative sources so the lesson page can display references.
-- Run manually in Supabase SQL Editor. Idempotent: repeated runs change nothing.

insert into public.sources (title, url, publisher, source_type)
values
  (
    'Python Tutorial: More Control Flow Tools — if Statements',
    'https://docs.python.org/3/tutorial/controlflow.html#if-statements',
    'Python Software Foundation',
    'documentation'
  ),
  (
    'CS50 Python: Conditionals',
    'https://cs50.harvard.edu/python/notes/2/',
    'Harvard University',
    'course'
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
    ('https://docs.python.org/3/tutorial/controlflow.html#if-statements', 'Authoritative reference for if, elif, and else semantics.'),
    ('https://cs50.harvard.edu/python/notes/2/', 'University course examples of conditions and branching.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'programming'
  and m.slug = 'programming-building-blocks'
  and l.slug = 'conditionals'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
