-- Phase 20.6: Module 06 (Collections) — Lists, Dictionaries, Tuples, Sets.
-- REQUIRES database/phase20-5-module05.sql applied first.
-- Run manually in the Supabase SQL Editor. Idempotent on repeated runs.
--
-- Four NEW lessons appended after Scope Basics — no existing lesson moves,
-- no legacy identity is touched. Progress rows are keyed by lesson slug, so
-- existing completion is unaffected; nothing is deleted or reset.

begin;

-- Insert lessons 23-26 (or refresh their metadata on repeated runs).
insert into public.lessons (module_id, slug, title, summary, estimated_minutes, position)
select
  m.id,
  v.slug,
  v.title,
  v.summary,
  v.estimated_minutes,
  v.position
from public.modules m
cross join (values
  ('lists', 'Lists', 'Satu variable, banyak value berurutan — index mulai dari 0.', 12, 17),
  ('dictionaries', 'Dictionaries', 'Simpan value dengan key bermakna, bukan posisi angka.', 12, 18),
  ('tuples', 'Tuples', 'Kumpulan berurutan yang itemnya tidak berubah — fixed items.', 12, 19),
  ('sets', 'Sets', 'Kumpulan value unik — duplikat collapse, tanpa posisi.', 12, 20)
) as v(slug, title, summary, estimated_minutes, position)
where m.slug = 'programming-building-blocks'
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

commit;
