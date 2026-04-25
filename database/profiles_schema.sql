-- Profiles Table - Links Supabase Auth users to custom UUIDs
-- This bridges Supabase Auth with your custom admin UID system

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
ON profiles
USING (true)
WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_uid ON profiles(uid);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create trigger to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_email_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_email_trigger
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION sync_email_to_profiles();

-- Create trigger to create profile on signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, uid, role, is_active)
  VALUES (NEW.id, NEW.email, '4f4e926a-96a2-4119-9fdd-2f425695e2de', 'admin', true)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_on_signup();
