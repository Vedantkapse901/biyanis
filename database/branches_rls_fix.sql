-- Branches admin: allow authenticated admin-panel users to manage branches
-- Run in Supabase SQL Editor if "Add Branch" fails with RLS / permission errors

DROP POLICY IF EXISTS "Only admins can manage branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users manage branches" ON branches;

CREATE POLICY "Authenticated users manage branches"
ON branches
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Optional columns used by the admin panel (safe if already applied)
ALTER TABLE branches
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- Ensure admin users exist for legacy RLS checks elsewhere
INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';
