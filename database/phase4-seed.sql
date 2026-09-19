-- Seed only the first fully structured ROBIN course.
-- Every insert finds the existing course by slug, so no UUID is hardcoded.

-- This course now contains eleven lessons across three modules.
update public.courses
set total_lessons = 11
where slug = 'programming';

insert into public.modules (course_id, slug, title, description, position)
select
  c.id,
  module.slug,
  module.title,
  module.description,
  module.position
from public.courses c
cross join (
  values
    ('programming-fundamentals', 'Programming Fundamentals', 'Core ideas and vocabulary behind programming.', 1),
    ('how-programs-run', 'How Programs Run', 'Follow source code as a computer turns it into instructions.', 2),
    ('programming-building-blocks', 'Programming Building Blocks', 'The reusable pieces found in everyday programs.', 3)
) as module(slug, title, description, position)
where c.slug = 'programming'
on conflict (course_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  position = excluded.position;

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
    ('programming-fundamentals', 'what-is-programming', 'What is Programming?', 'Build a useful definition of programming.', 10, 1),
    ('programming-fundamentals', 'hello-python', 'Kenalan dengan Python', 'Kenali Python sebagai bahasa, tulis instruksi pertama, dan lihat code berubah jadi output.', 12, 2),
    ('programming-fundamentals', 'print-output', 'Output with print()', 'Minta Python menampilkan sesuatu dengan print(), dan bedakan code dari output.', 12, 3),
    ('programming-fundamentals', 'syntax-indentation', 'Syntax & Indentation', 'Python peduli bagaimana code ditulis dan disusun — kenal syntax dan indentation.', 12, 4),
    ('programming-fundamentals', 'comments', 'Comments', 'Tinggalkan catatan untuk manusia di dalam code — dan lihat Python melewatinya.', 10, 5),
    ('programming-fundamentals', 'understanding-errors', 'Understanding Errors', 'Error itu petunjuk, bukan kegagalan — baca pesannya, perbaiki, jalankan lagi.', 12, 6),
    ('programming-fundamentals', 'programming-languages', 'Programming Languages', 'See why different programming languages exist.', 12, 7),
    ('programming-fundamentals', 'syntax-vs-semantics', 'Syntax vs Semantics', 'Separate how code is written from what it means.', 12, 8),
    ('how-programs-run', 'compiler-vs-interpreter', 'Compiler vs Interpreter', 'Compare two ways source code becomes executable work.', 14, 1),
    ('how-programs-run', 'source-code-to-program-execution', 'Source Code to Program Execution', 'Trace the journey from a file to a running program.', 14, 2),
    ('programming-building-blocks', 'variables', 'Variables', 'Give values names so a program can reuse them.', 18, 1),
    ('programming-building-blocks', 'data-types', 'Data Types', 'Describe the kinds of values a program can handle.', 14, 2),
    ('programming-building-blocks', 'numbers', 'Numbers', 'int untuk bulat, float untuk desimal — dan angka yang bisa dihitung.', 12, 3),
    ('programming-building-blocks', 'casting', 'Casting', 'Ubah value ke type lain dengan int(), float(), dan str() — sengaja dan sadar.', 12, 4),
    ('programming-building-blocks', 'strings', 'Strings', 'Teks sebagai urutan character — index dari 0, len(), dan penggabungan dengan +.', 14, 5),
    ('programming-building-blocks', 'booleans', 'Booleans', 'Dua value untuk dua keadaan — True dan False sebagai data.', 12, 6),
    ('programming-building-blocks', 'operators', 'Operators', 'Transform and compare values with operators.', 12, 7),
    ('programming-building-blocks', 'conditionals', 'Conditionals', 'Let a program choose what happens next.', 16, 8),
    ('programming-building-blocks', 'loops', 'Loops', 'Repeat work without repeating code by hand.', 16, 9),
    ('programming-building-blocks', 'functions', 'Functions', 'Package reusable behavior behind a clear name.', 18, 10)
) as lesson(module_slug, slug, title, summary, estimated_minutes, position)
  on lesson.module_slug = m.slug
where c.slug = 'programming'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;
