-- Phase 9C migration: relax concept_key and lesson_slug CHECK constraints
-- to support lessons beyond Variables. Run manually in Supabase SQL Editor.
-- Existing Variables rows are preserved. No schema redesign.
begin;

-- Drop the Variables-specific CHECK constraints so any registered lesson
-- can store its own concept keys. The application validates concepts via
-- the lesson registry; the DB keeps the state and evidence_type constraints.
alter table public.concept_mastery drop constraint if exists concept_mastery_lesson_slug_check;
alter table public.concept_mastery drop constraint if exists concept_mastery_concept_key_check;

commit;
