-- Phase 12.3: Functions lesson sources.
-- The functions lesson row already exists from phase4-seed.sql (position 6).
-- Run manually in Supabase SQL Editor. Idempotent on repeated runs.

insert into public.sources (title, url, publisher, source_type)
values
  (
    'Python Tutorial: Defining Functions',
    'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
    'Python Software Foundation',
    'documentation'
  ),
  (
    'CS50 Python: Functions and Variables',
    'https://cs50.harvard.edu/python/notes/0/',
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
    ('https://docs.python.org/3/tutorial/controlflow.html#defining-functions', 'Authoritative reference for def, calls, parameters, arguments, local variables, and return values.'),
    ('https://cs50.harvard.edu/python/notes/0/', 'Beginner-oriented examples of defining, calling, and composing functions.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'programming'
  and m.slug = 'programming-building-blocks'
  and l.slug = 'functions'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
