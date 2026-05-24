-- Allow admin login sync into public.users (fixes RLS warning on admin panel login)
-- Run in Supabase SQL Editor

DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Only admins can manage users" ON users;
DROP POLICY IF EXISTS "Authenticated users manage users" ON users;

CREATE POLICY "Authenticated users manage users"
ON users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';
