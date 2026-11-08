-- Run once in Supabase SQL Editor if anonymous submissions return a permission error.
-- This grants visitors INSERT only; RLS still blocks public reads and updates.
grant usage on schema public to anon;
grant insert on table public.applications to anon;
