-- Fix: "column uid does not exist" when profiles table already exists (e.g. Supabase default)
-- Run this in Supabase SQL Editor, then re-run profiles_schema.sql if needed.

-- 1) Add columns missing from default/template profiles tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS uid UUID UNIQUE DEFAULT gen_random_uuid();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2) Backfill uid for any existing rows
UPDATE profiles SET uid = gen_random_uuid() WHERE uid IS NULL;

-- 3) Admin profile row (adjust email if yours differs)
INSERT INTO profiles (id, email, uid, role, is_active, full_name)
SELECT id, email, '4f4e926a-96a2-4119-9fdd-2f425695e2de'::uuid, 'admin', true, 'Admin User'
FROM auth.users
WHERE email = 'admin@biyanis.com'
ON CONFLICT (id) DO UPDATE SET
  uid = EXCLUDED.uid,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email = EXCLUDED.email;
