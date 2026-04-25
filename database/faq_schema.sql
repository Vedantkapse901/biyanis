-- FAQ Table for Website-Based Chatbot
-- Add this to your existing schema.sql

CREATE TABLE IF NOT EXISTS faqs (
  id BIGSERIAL PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100), -- e.g., 'Courses', 'Admissions', 'General', 'Results'
  keywords VARCHAR(500), -- Comma-separated keywords for search
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "FAQs are viewable by all" ON faqs FOR SELECT USING (is_active = true);

-- Admin only write
CREATE POLICY "Only admins can manage FAQs" ON faqs
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Create index for search performance
CREATE INDEX idx_faqs_keywords ON faqs USING GIN(to_tsvector('english', keywords || ' ' || question || ' ' || answer));
CREATE INDEX idx_faqs_category ON faqs(category);

-- Sample FAQ data
INSERT INTO faqs (question, answer, category, keywords, display_order) VALUES
(
  'What courses do you offer?',
  'We offer JEE Advanced, JEE Main, NEET UG, and MHT-CET courses. Each course is designed with a specific duration and approach tailored to help you succeed in your exam.',
  'Courses',
  'courses, exam, JEE, NEET, MHT-CET',
  1
),
(
  'What is the duration of each course?',
  'JEE Advanced and NEET UG are 2-year programs. JEE Main and MHT-CET are 1-year intensive programs.',
  'Courses',
  'duration, course length, how long, time',
  2
),
(
  'How do I enroll?',
  'You can enroll through our website or visit any of our branches in Mira Road, Borivali, Bhayandar, Kandivali, or Thane. Contact us on WhatsApp at 917208324505 for enrollment details.',
  'Admissions',
  'enroll, register, admission, join, how to start',
  3
),
(
  'What is your teaching methodology?',
  'We follow a Kota-style coaching approach with rigorous practice, personal mentorship, and conceptual clarity. Our teaching focuses on disciplined practice routines and holistic learning.',
  'General',
  'methodology, teaching style, approach, how do you teach',
  4
),
(
  'Do you provide study materials?',
  'Yes! We provide comprehensive study materials including practice papers, mock tests, formula sheets, and revision notes. Many are available as free downloads on our website.',
  'Study Material',
  'study material, notes, resources, downloads, sheets',
  5
),
(
  'How can I contact your branches?',
  'We have branches in: Mira Road (+91 98765 43210), Borivali (+91 98765 43211), Bhayandar (+91 98765 43212), Kandivali (+91 98765 43213), and Thane (+91 98765 43214). You can also reach us on WhatsApp.',
  'General',
  'contact, phone, address, location, branch',
  6
),
(
  'Can I see student results?',
  'Yes! We display our top achievers on our website including AIR rankings for JEE, NEET scores, and MHT-CET ranks. Visit our Results page to see our student achievements.',
  'Results',
  'results, achievements, students, scores, AIR',
  7
),
(
  'What is the admission process?',
  'Our admission process is simple and transparent. You can visit any branch, fill the registration form, complete a placement test, and get counseled by our experts to choose the right course.',
  'Admissions',
  'admission, process, requirements, eligibility',
  8
),
(
  'Do you have a student portal?',
  'Yes, we have a student portal where enrolled students can access their progress, marks, and portal-specific resources. Login with your credentials to access it.',
  'General',
  'portal, student, login, access, dashboard',
  9
),
(
  'How do I download study materials?',
  'Visit our Study Material page and click on the course you\'re interested in. You\'ll find downloadable PDFs for formula sheets, revision notes, and more.',
  'Study Material',
  'download, materials, PDF, notes, resources',
  10
);
