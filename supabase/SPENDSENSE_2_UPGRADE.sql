-- SpendSense 2.0 migration: optional purchase notes and 1–5 ratings.
-- Run in Supabase Dashboard -> SQL Editor on the existing project.
-- This does not delete or rewrite existing records.
alter table public.transactions add column if not exists note text check (char_length(note) <= 500);
alter table public.transactions add column if not exists rating smallint check (rating between 1 and 5);
