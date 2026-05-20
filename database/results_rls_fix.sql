-- Results admin: optional RLS fix (browser can still use /api/admin-results with service role)
-- Run in Supabase SQL Editor if direct client updates are needed

DROP POLICY IF EXISTS "Only admins can manage results" ON results;
DROP POLICY IF EXISTS "Authenticated admins manage results" ON results;

-- Simplest fix: any logged-in user can manage results (admin panel uses Supabase Auth)
CREATE POLICY "Authenticated users manage results"
ON results
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE results
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'hallOfFame',
  ADD COLUMN IF NOT EXISTS photo TEXT,
  ADD COLUMN IF NOT EXISTS achievement TEXT,
  ADD COLUMN IF NOT EXISTS remark TEXT,
  ADD COLUMN IF NOT EXISTS college TEXT,
  ADD COLUMN IF NOT EXISTS rank TEXT,
  ADD COLUMN IF NOT EXISTS exam TEXT;

INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

INSERT INTO public.profiles (id, email, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;
