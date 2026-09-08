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
