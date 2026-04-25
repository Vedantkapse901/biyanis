-- Biyanis EdTech Platform - Supabase Schema
-- Run this in Supabase SQL editor to set up the database

-- =====================
-- SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tagline TEXT,
  whatsapp VARCHAR(20),
  review_link VARCHAR(500),
  gemini_api_key VARCHAR(500),
  made_by TEXT,
  vedant_designation VARCHAR(255),
  bhushan_designation VARCHAR(255),
  vedant_phone VARCHAR(20),
  vedant_email VARCHAR(255),
  bhushan_phone VARCHAR(20),
  bhushan_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- SLIDES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS slides (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(10) CHECK (type IN ('image', 'video')) NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  headline VARCHAR(255),
  subheadline TEXT,
  cta_text VARCHAR(100),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- COURSES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(100),
  duration VARCHAR(50),
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- RESULTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS results (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  score VARCHAR(100),
  exam VARCHAR(50),
  year INT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- BRANCHES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS branches (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  map_link VARCHAR(500),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- TESTIMONIALS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- GALLERY FOLDERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS gallery_folders (
  id BIGSERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  event_date DATE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- GALLERY ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS gallery_items (
  id BIGSERIAL PRIMARY KEY,
  folder_id BIGINT REFERENCES gallery_folders(id) ON DELETE CASCADE,
  title VARCHAR(255),
  type VARCHAR(10) CHECK (type IN ('image', 'video')) NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  drive_link VARCHAR(500),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- FREE DOWNLOADS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS free_downloads (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(20),
  url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================
-- STUDENT PORTAL TABLE
-- =====================
CREATE TABLE IF NOT EXISTS student_portal (
  id BIGSERIAL PRIMARY KEY,
  exam_type VARCHAR(50) CHECK (exam_type IN ('JEE', 'NEET', 'MHT-CET')),
  class_level VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- STUDENT PORTAL STUDENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS student_portal_students (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT REFERENCES student_portal(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50),
  marks INT,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- AI CHAT HISTORY TABLE (Optional)
-- =====================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT,
  tokens_used INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_slides_display_order ON slides(display_order);
CREATE INDEX idx_courses_display_order ON courses(display_order);
CREATE INDEX idx_branches_display_order ON branches(display_order);
CREATE INDEX idx_gallery_folders_event_date ON gallery_folders(event_date);
CREATE INDEX idx_gallery_items_folder_id ON gallery_items(folder_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS for all tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_portal ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_portal_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Public content - everyone can read
CREATE POLICY "Settings are readable by all" ON settings FOR SELECT USING (true);
CREATE POLICY "Slides are readable by all" ON slides FOR SELECT USING (true);
CREATE POLICY "Courses are readable by all" ON courses FOR SELECT USING (true);
CREATE POLICY "Results are readable by all" ON results FOR SELECT USING (true);
CREATE POLICY "Branches are readable by all" ON branches FOR SELECT USING (true);
CREATE POLICY "Testimonials are readable by all" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Gallery folders are readable by all" ON gallery_folders FOR SELECT USING (true);
CREATE POLICY "Gallery items are readable by all" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "Free downloads are readable by all" ON free_downloads FOR SELECT USING (true);

-- Admin-only modifications
CREATE POLICY "Only admins can update settings" ON settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage slides" ON slides
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage courses" ON courses
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage results" ON results
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage branches" ON branches
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage testimonials" ON testimonials
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage gallery" ON gallery_folders
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage gallery items" ON gallery_items
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage free downloads" ON free_downloads
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);

-- Users can read student portal
CREATE POLICY "Student portal is readable by all" ON student_portal FOR SELECT USING (true);
CREATE POLICY "Student portal students are readable by all" ON student_portal_students FOR SELECT USING (true);

-- Only admins can modify student portal
CREATE POLICY "Only admins can manage student portal" ON student_portal
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Only admins can manage student portal students" ON student_portal_students
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Users can read own conversations
CREATE POLICY "Users can read own conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own conversations
CREATE POLICY "Users can insert conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================
-- INITIAL DATA
-- =====================

-- Insert default settings
INSERT INTO settings (tagline, whatsapp, review_link, made_by)
VALUES (
  'Building confidence, consistency & character since 2020.',
  '917208324505',
  'https://maps.app.goo.gl/Aqxz5M7ZpJ9Vir3XA',
  'Made with love by Vedant Kapse and Bhushan Naikwade'
) ON CONFLICT DO NOTHING;

-- You can insert more initial data here as needed
-- INSERT INTO courses VALUES (...);
-- INSERT INTO slides VALUES (...);
-- etc.
