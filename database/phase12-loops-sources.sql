-- Phase 12.2: Loops lesson sources.
-- The loops lesson row already exists from phase4-seed.sql (position 5);
-- this file links authoritative sources so the lesson page can display references.
-- Run manually in Supabase SQL Editor. Idempotent: repeated runs change nothing.

insert into public.sources (title, url, publisher, source_type)
values
  (
    'Python Tutorial: More Control Flow Tools — for Statements',
    'https://docs.python.org/3/tutorial/controlflow.html#for-statements',
    'Python Software Foundation',
    'documentation'
  ),
  (
    'Python Reference: The while Statement',
    'https://docs.python.org/3/reference/compound_stmts.html#the-while-statement',
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
    ('https://docs.python.org/3/tutorial/controlflow.html#for-statements', 'Authoritative reference for for loops and range semantics.'),
    ('https://docs.python.org/3/reference/compound_stmts.html#the-while-statement', 'Authoritative reference for while loop conditions and termination.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'programming'
  and m.slug = 'programming-building-blocks'
  and l.slug = 'loops'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
