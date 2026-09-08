-- Add a small, trustworthy source set for the Variables lesson.
-- ON CONFLICT makes both the sources and their lesson links safe to rerun.
insert into public.sources (title, url, publisher, source_type)
values
  (
    'An Informal Introduction to Python',
    'https://docs.python.org/3/tutorial/introduction.html',
    'Python Software Foundation',
    'documentation'
  ),
  (
    'Python Language Reference: Assignment Statements',
    'https://docs.python.org/3/reference/simple_stmts.html#assignment-statements',
    'Python Software Foundation',
    'documentation'
  ),
  (
    'Introduction to Python Programming: Variables',
    'https://openstax.org/books/introduction-python-programming/pages/1-3-variables',
    'OpenStax',
    'textbook'
  ),
  (
    'CS50''s Introduction to Programming with Python: Lecture 0',
    'https://cs50.harvard.edu/python/notes/0/#variables',
    'Harvard CS50',
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
    ('https://docs.python.org/3/tutorial/introduction.html', 'Beginner examples of names, values, and assignment.'),
    ('https://docs.python.org/3/reference/simple_stmts.html#assignment-statements', 'Authoritative assignment and rebinding semantics.'),
    ('https://openstax.org/books/introduction-python-programming/pages/1-3-variables', 'Beginner explanations, naming rules, and practice.'),
    ('https://cs50.harvard.edu/python/notes/0/#variables', 'University course examples using variables and expressions.')
) as source_link(url, relevance_note)
join public.sources s on s.url = source_link.url
where c.slug = 'programming'
  and m.slug = 'programming-building-blocks'
  and l.slug = 'variables'
on conflict (lesson_id, source_id) do update set
  relevance_note = excluded.relevance_note;
