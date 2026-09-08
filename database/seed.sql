-- Add ROBIN's Semester 1 courses.
-- ON CONFLICT updates an existing matching slug instead of creating a duplicate.
insert into public.courses (slug, title, description, total_lessons)
values
  ('programming', 'Foundations of Programming Language', 'Build the mental model behind code, from values and variables to functions.', 10),
  ('design-thinking', 'Design Thinking', 'Turn fuzzy human problems into ideas you can test and improve.', 8),
  ('discrete-math', 'Discrete Mathematics', 'Logic, sets, relations, and the mathematical language of computing.', 12),
  ('hci', 'Human-Computer Interaction', 'Understand how people experience, use, and sometimes fight with software.', 9),
  ('algorithms', 'Algorithms Foundations', 'Learn to describe, compare, and reason about problem-solving procedures.', 11),
  ('parallel', 'Parallel and Distributed Computing', 'Explore how many computers and processes coordinate useful work.', 10),
  ('networking', 'Networking and Communication', 'Follow data as it moves between devices, protocols, and people.', 10)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  total_lessons = excluded.total_lessons;
