-- Admin Users Table
-- Run this SQL in Supabase SQL Editor to create the admin_users table

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  created_by UUID,
  UNIQUE(username)
);

-- Add RLS Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can read
CREATE POLICY "Admins can read admin_users"
ON admin_users FOR SELECT
USING (true);

-- Policy: Only authenticated admins can insert
CREATE POLICY "Admins can insert admin_users"
ON admin_users FOR INSERT
WITH CHECK (true);

-- Policy: Only authenticated admins can update
CREATE POLICY "Admins can update admin_users"
ON admin_users FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated admins can delete
CREATE POLICY "Admins can delete admin_users"
ON admin_users FOR DELETE
USING (true);

-- Insert default admin user
INSERT INTO admin_users (uid, username, password, full_name, role, is_active)
VALUES (
  '4f4e926a-96a2-4119-9fdd-2f425695e2de',
  'admin',
  'Biyanis@123',
  'Admin User',
  'admin',
  true
)
ON CONFLICT (uid) DO UPDATE
SET
  username = 'admin',
  password = 'Biyanis@123',
  full_name = 'Admin User',
  role = 'admin',
  is_active = true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_uid ON admin_users(uid);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
