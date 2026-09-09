-- Return every column and every course.
select * from public.courses;

-- Return only the columns you need.
select title, total_lessons from public.courses;

-- Return one course whose slug matches this value.
select * from public.courses
where slug = 'programming';

-- Sort courses from the largest lesson count to the smallest.
select title, total_lessons from public.courses
order by total_lessons desc;

-- Count how many course rows exist.
select count(*) from public.courses;

-- PHASE 4: RELATIONAL QUERIES

-- A. Read the modules that belong to one course.
select m.title, m.position
from public.modules m
join public.courses c on c.id = m.course_id
where c.slug = 'programming'
order by m.position;

-- B. Read lessons together with the module each lesson belongs to.
select
  m.title as module,
  l.title as lesson,
  l.position
from public.lessons l
join public.modules m on m.id = l.module_id
join public.courses c on c.id = m.course_id
where c.slug = 'programming'
order by m.position, l.position;

-- C. Join courses, modules, and lessons into one readable result.
select
  c.title as course,
  m.title as module,
  l.title as lesson,
  m.position as module_position,
  l.position as lesson_position
from public.courses c
join public.modules m on m.course_id = c.id
join public.lessons l on l.module_id = m.id
where c.slug = 'programming'
order by m.position, l.position;

-- D. Count the lesson rows inside each module.
-- GROUP BY makes one group per module; COUNT counts rows in each group.
select
  m.title as module,
  count(l.id) as lesson_count
from public.modules m
left join public.lessons l on l.module_id = m.id
join public.courses c on c.id = m.course_id
where c.slug = 'programming'
group by m.id, m.title, m.position
order by m.position;

-- PHASE 5: MANY-TO-MANY SOURCE QUERIES

-- A. Read every source linked to the Variables lesson.
select
  s.title,
  s.publisher,
  s.url,
  ls.relevance_note
from public.lessons l
join public.lesson_sources ls on ls.lesson_id = l.id
join public.sources s on s.id = ls.source_id
join public.modules m on m.id = l.module_id
join public.courses c on c.id = m.course_id
where c.slug = 'programming'
  and l.slug = 'variables'
order by s.title;

-- B. See both sides of the many-to-many relationship.
select
  l.title as lesson,
  s.title as source,
  s.publisher
from public.lesson_sources ls
join public.lessons l on l.id = ls.lesson_id
join public.sources s on s.id = ls.source_id
order by l.title, s.title;

-- C. Count how many sources are attached to each lesson.
select
  l.title as lesson,
  count(ls.source_id) as source_count
from public.lessons l
left join public.lesson_sources ls on ls.lesson_id = l.id
group by l.id, l.title
order by l.title;

-- D. Travel in reverse: find lessons that use one source.
select
  s.title as source,
  l.title as lesson
from public.sources s
join public.lesson_sources ls on ls.source_id = s.id
join public.lessons l on l.id = ls.lesson_id
where s.url = 'https://docs.python.org/3/reference/simple_stmts.html#assignment-statements'
order by l.title;

-- Phase 7: optional learning exercises, AFTER phase7-memory.sql.
-- Read structured facts rather than chat transcripts.
select * from public.robin_memories order by category, key;
select * from public.robin_memories where category = 'preference';
select * from public.robin_memories where category = 'learning';

-- Practice mutations inside a transaction; ROLLBACK keeps real memory unchanged.
-- Do not replace ROLLBACK with COMMIT unless you intentionally want these changes.
begin;
insert into public.robin_memories (category, key, value, status)
values ('learning', 'variables', 'shaky', 'shaky')
on conflict (category, key) do update
set value = excluded.value, status = excluded.status;
-- UPSERT: one category/key pair, not another duplicate row.
update public.robin_memories set value = 'understood', status = 'understood'
where category = 'learning' and key = 'variables';
-- Exact pair only; the app uses the stable row UUID for deletion.
delete from public.robin_memories
where category = 'learning' and key = 'variables';
rollback;
