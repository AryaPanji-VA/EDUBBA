-- Phase 14B: Propositions lesson sources.
-- REQUIRES database/phase14b-propositions-structure.sql first (module + lesson rows).
-- Run manually in Supabase SQL Editor. Idempotent on repeated runs.
-- These sources support ROBIN's lesson content; they do NOT make the lesson
-- an official university lesson (provenance remains: robin).

insert into public.sources (title, url, publisher, source_type)
values
  (
    'Book of Proof',
    'https://www.people.vcu.edu/~rhammack/BookOfProof/',
    'Richard Hammack, Virginia Commonwealth University',
    'textbook'
  ),
  (
    'forall x: Calgary, An Introduction to Formal Logic',
    'https://forallx.openlogicproject.org/',
    'P.D. Magnus and Tim Button, Open Logic Project',
    'textbook'
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
    ('https://www.people.vcu.edu/~rhammack/BookOfProof/', 'Chapter 2 (Logic) introduces statements, negation, and the connectives and/or with truth tables.'),
    ('https://forallx.openlogicproject.org/', 'Open introduction to formal logic covering propositional connectives and truth-table reasoning.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'discrete-math'
  and m.slug = 'logic-foundations'
  and l.slug = 'propositions'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
