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
