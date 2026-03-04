-- Enables Row Level Security on public tables exposed to PostgREST.
--
-- Both tables are accessed exclusively via the service role key on the server,
-- which bypasses RLS. Enabling RLS with no permissive policies for anon/
-- authenticated roles blocks direct REST API access using the public anon key.

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.personal_posts ENABLE ROW LEVEL SECURITY;
