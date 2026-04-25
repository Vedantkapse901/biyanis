# Biyanis EdTech Platform - Architecture Analysis

## Executive Summary

The Biyanis platform is a React + Vite frontend with Firebase backend integration. This document provides a detailed analysis of the current frontend architecture, database requirements, storage needs, and recommendations for implementing Supabase as an alternative backend solution.

---

## 1. FRONTEND ARCHITECTURE

### Stack Overview
- **Framework**: React 18 with Vite bundler
- **Routing**: React Router v6 (HashRouter for static hosting)
- **Styling**: Tailwind CSS with PostCSS
- **Animations**: Framer Motion for UI transitions
- **Icons**: Lucide React
- **State Management**: React Context API + localStorage fallback

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AdminPanel       # CMS for content management
│   ├── DoubtChatbot     # AI tutor using Gemini API
│   ├── SmartReviewModal # Review modal component
│   ├── HeroSlider       # Image/video carousel
│   ├── GlobalWhatsApp   # WhatsApp integration
│   ├── Navbar           # Navigation header
│   └── ui/              # Basic UI elements (GlassCard, ThemeButton, etc.)
├── pages/               # Page-level components
│   ├── Home            # Landing page
│   ├── Courses         # Course offerings
│   ├── StudyMaterial   # Study resources
│   ├── Gallery         # Event gallery (folder-first structure)
│   ├── Results         # Student results showcase
│   ├── Branches        # Location branches
│   ├── About           # About page
│   ├── StudentLogin    # Authentication entry
│   ├── StudentPortal   # Student dashboard
│   └── Contact         # Contact form
├── context/             # React Context API
│   └── AppContext.jsx  # Central state container
├── data/                # Static data & defaults
│   └── defaultData.js  # Initial data structure
├── lib/                 # Utility libraries
│   └── firebase.js     # Firebase configuration & exports
└── api/                 # API integration
    └── gemini.js       # Gemini AI integration
```

### Frontend Features
1. **Dynamic Content Management**: Admin panel to edit all website content
2. **Media Handling**: Image/video uploads stored as base64 data URLs
3. **AI Integration**: Doubt chatbot powered by Google Gemini API
4. **Responsive Design**: Mobile-first with glass-morphism UI
5. **Client-side Routing**: Hash-based routing for static hosting (no backend server needed)
6. **Two-tier Editor**: Draft mode + "Save to Website" for content changes

### Key Frontend Components

#### AdminPanel.jsx
- Password-protected admin interface (password: `Biyanis@123`)
- Manages: slides, courses, results, branches, gallery, downloads, settings
- Client-side data editing with draft/save workflow
- Firebase Storage integration for file uploads (resumable uploads)
- Falls back to localStorage if Firebase fails

#### DoubtChatbot.jsx
- Real-time AI tutor chat widget
- Uses Google Gemini API for responses
- Accessible via floating button
- Stores conversation history in component state (not persisted)
- Requires `geminiApiKey` in settings

#### Gallery.jsx
- Folder-first structure (shows folder cards first)
- Modal preview system
- Drive link integration for downloads

---

## 2. CURRENT BACKEND - FIREBASE

### Current Setup
```
Firebase Services Used:
├── Authentication (Anonymous + Custom Token)
├── Firestore Database (NoSQL document store)
├── Cloud Storage (File uploads)
└── Fallback: localStorage (if Firebase fails)
```

### Firestore Data Structure
**Document Path**: `artifacts/{appId}/public/data/biyani_data/main_state`

**Data Model**:
```javascript
{
  settings: {
    tagline: string,
    whatsapp: string,
    reviewLink: string,
    geminiApiKey: string,
    madeBy: string,
    vedantDesignation: string,
    bhushanDesignation: string,
    vedantPhone: string,
    vedantEmail: string,
    bhushanPhone: string,
    bhushanEmail: string
  },
  slides: Array<{id, type: 'image'|'video', url, headline, sub, cta}>,
  courses: Array<{id, title, badge, duration, desc}>,
  results: Array<{id, name, score, exam, year, image}>,
  branches: Array<{id, name, phone, address, mapLink}>,
  testimonials: Array<{id, name, rating, text}>,
  gallery: Array<{id, folder, title, type, url, thumbnail, eventDate, driveLink}>,
  freeDownloads: Array<{id, title, fileType, url}>,
  studentPortal: Array<student data>,
  studentPortalStudents: Array<student records>
}
```

### Firebase Configuration
```javascript
Project ID: biyanis-8af2e
Storage Bucket: biyanis-8af2e.appspot.com
Auth Domain: biyanis-8af2e.firebaseapp.com
```

### Current Issues & Limitations
1. **Media Storage**: Files stored as base64 data URLs increase document size
2. **No User Authentication**: Currently anonymous access only
3. **Limited Real-time Features**: Real-time updates work but no complex querying
4. **Vendor Lock-in**: Hard-coded Firebase config
5. **Scalability**: Firestore pricing based on read/write operations (can become expensive)

---

## 3. DATABASE REQUIREMENTS ANALYSIS

### Data Entities Needed

#### 1. Website Content (Static/Admin-Managed)
- **Slides/Hero Banner**: Images, videos, text
- **Courses**: Course details, descriptions, metadata
- **Results**: Student achievements, photos, rankings
- **Branches**: Location info, contact details, maps
- **Testimonials**: Student reviews, ratings
- **Gallery**: Event images, folders, metadata
- **Free Downloads**: Resource PDFs, file links
- **Settings**: Global configuration, API keys

**Characteristics**: Low write frequency, high read frequency, ~5-10 updates/week

#### 2. User Management
- **Student Accounts**: Email, password, enrollment status
- **Admin Accounts**: Access control, roles
- **Student Portal Data**: Individual student progress

**Characteristics**: Medium write frequency, medium read frequency

#### 3. AI Chatbot History (Optional)
- **Conversation Logs**: User queries, AI responses, timestamps
- **Useful for**: Analytics, improving responses, user engagement tracking

**Characteristics**: High write frequency (if enabled), sequential access

#### 4. Media Assets
- **Images**: Hero slides, result photos, gallery items
- **Videos**: Hero banner videos
- **Documents**: PDF downloads

**Characteristics**: Large files, need CDN/cloud storage

### Recommended Database Schema

```sql
-- Core Tables
CREATE TABLE settings (
  id UUID PRIMARY KEY,
  tagline TEXT,
  whatsapp VARCHAR(20),
  review_link VARCHAR(500),
  gemini_api_key VARCHAR(255), -- encrypted
  made_by TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(100),
  duration VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE slides (
  id UUID PRIMARY KEY,
  type VARCHAR(10) CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  headline VARCHAR(255),
  subheadline TEXT,
  cta_text VARCHAR(100),
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE results (
  id UUID PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  score VARCHAR(100),
  exam_type VARCHAR(50),
  exam_year INTEGER,
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE branches (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  map_link VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE gallery_folders (
  id UUID PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  event_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE gallery_items (
  id UUID PRIMARY KEY,
  folder_id UUID REFERENCES gallery_folders(id),
  title VARCHAR(255),
  type VARCHAR(10) CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  drive_link VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  query TEXT NOT NULL,
  response TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP
);
```

### Query Patterns
- **Read-heavy**: Website content retrieval (no filters needed usually)
- **Admin writes**: Batch updates to courses, slides, results
- **Real-time**: Gallery browsing, chatbot conversations
- **Analytical**: AI conversation logs, user engagement

---

## 4. B2B STORAGE REQUIREMENTS

### Current Media Storage Issues
- Base64-encoded files in Firestore increase document size
- Can hit Firestore limits (1MB per document)
- Poor performance for large videos
- Not suitable for scalability

### Recommended Storage Solutions

#### Option 1: Firebase Cloud Storage (Current Setup)
**Pros**:
- Already integrated
- Resumable uploads
- Direct integration with frontend
- Good for small to medium files

**Cons**:
- Vendor lock-in
- Pricing scales with bandwidth

**Use Case**: If staying with Firebase

#### Option 2: AWS S3
**Pros**:
- Industry standard
- Excellent performance
- Cost-effective at scale
- Multi-region support
- CDN integration (CloudFront)

**Cons**:
- Requires backend API for signed URLs
- More complex setup

**Use Case**: Large-scale deployments

#### Option 3: Supabase Storage (PostgreSQL + Supabase Storage)
**Pros**:
- Integrates perfectly with Supabase PostgreSQL
- S3-compatible API
- Built-in access control
- Simpler than raw S3

**Cons**:
- Newer platform
- Less ecosystem than AWS

**Use Case**: Recommended if using Supabase

#### Option 4: Cloudinary
**Pros**:
- Image optimization built-in
- Automatic formats & sizes
- CDN included
- Easy integration

**Cons**:
- Additional vendor dependency
- Pricing per image transformations

**Use Case**: If image optimization is priority

### Recommended Architecture
```
Frontend (React)
    ↓
Backend API (Node.js/Express)
    ↓
Supabase Storage (S3-compatible)
    ↓ (CDN)
    ↓
Client Browser (cached assets)
```

---

## 5. SUPABASE AS BACKEND ALTERNATIVE

### Why Supabase?

| Feature | Firebase | Supabase | AWS |
|---------|----------|----------|-----|
| Database | NoSQL (Firestore) | PostgreSQL | RDS |
| Authentication | Built-in | Built-in (Auth0) | Cognito |
| Storage | Cloud Storage | S3-compatible | S3 |
| Real-time | Firestore listeners | PostgreSQL subscriptions | Not native |
| Cost Predictability | Usage-based | Usage-based | Usage-based |
| SQL Support | No | Yes (full SQL) | Yes |
| Vector DB | No | pgvector (AI) | OpenSearch |
| Hosting | Managed | Self/Managed | Self |

### Supabase Architecture for Biyanis

```javascript
// supabase.js configuration
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

### Migration Path from Firebase to Supabase

#### Phase 1: Setup Supabase Project
1. Create Supabase project
2. Enable PostgreSQL database
3. Set up authentication (email/password + OAuth)
4. Configure Row-Level Security (RLS) policies
5. Set up storage buckets

#### Phase 2: Migrate Data
```sql
-- Create tables in Supabase
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(100),
  duration VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bulk insert from Firebase export
INSERT INTO courses (title, badge, duration, description)
VALUES 
  ('JEE Advanced', 'Popular', '2 Years', '...'),
  ('JEE Main', 'Core', '1 Year', '...'),
  ...;
```

#### Phase 3: Update Frontend
```javascript
// Instead of Firebase
// import { db } from '../lib/firebase'
// const docRef = doc(db, 'artifacts', appId, ...)

// Use Supabase
import { supabase } from '../lib/supabase'

const { data, error } = await supabase
  .from('courses')
  .select('*')
```

#### Phase 4: Media Migration
```javascript
// Upload from Firebase to Supabase Storage
const bucket = supabase.storage.from('media')
await bucket.upload(`slides/${id}`, file)
```

### Supabase Implementation Example

#### 1. Create Tables
```sql
-- Courses table
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  badge VARCHAR,
  duration VARCHAR,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides table
CREATE TABLE slides (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(10) CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  headline VARCHAR,
  subheadline TEXT,
  cta_text VARCHAR,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Slides are viewable by everyone" ON slides
  FOR SELECT USING (true);
```

#### 2. Frontend Integration
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// pages/Courses.jsx - using Supabase instead of Context
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) console.error(error)
      else setCourses(data)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="courses-grid">
      {courses.map(course => (
        <div key={course.id} className="course-card">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  )
}
```

#### 3. Admin Panel with Supabase
```javascript
// For admin updates (with authentication)
async function updateCourse(courseId, updates) {
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)

  if (error) console.error('Update failed:', error)
  return !error
}

async function insertCourse(courseData) {
  const { data, error } = await supabase
    .from('courses')
    .insert([courseData])
    .select()

  return { data, error }
}
```

#### 4. Storage Setup
```javascript
// Upload media to Supabase Storage
async function uploadSlideMedia(file, slideId) {
  const fileName = `slides/${slideId}/${file.name}`
  
  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) console.error('Upload error:', error)
  
  // Get public URL
  const { data: publicURL } = supabase.storage
    .from('media')
    .getPublicUrl(fileName)

  return publicURL.publicUrl
}
```

### Supabase Pricing Estimate (Monthly)

| Component | Free | Pro |
|-----------|------|-----|
| Database | 500MB | 8GB |
| Storage | 1GB | 100GB |
| Bandwidth | 2GB | 100GB |
| Concurrent Connections | Limited | 200+ |
| Monthly Cost | $0 | $25-100 |

**Estimated for Biyanis**: 
- Free tier sufficient for launch
- Pro tier ($25-100/month) for production with media

---

## 6. COMPARISON & RECOMMENDATIONS

### Firebase vs Supabase vs Custom Backend

| Metric | Firebase | Supabase | Custom (Node+Postgres) |
|--------|----------|----------|------------------------|
| Setup Time | 1 day | 2-3 days | 2+ weeks |
| Maintenance | Minimal | Minimal | Ongoing |
| Cost (Small) | $5-20/month | $0-25/month | $5-10/month |
| Cost (Scale) | $100-500/month | $25-100/month | $10-50/month |
| Learning Curve | Medium | Medium | High |
| Flexibility | Low (NoSQL only) | High (SQL) | Very High |
| Real-time | Good | Good | Complex |
| Built-in Auth | Yes | Yes | Manual |
| Admin Panel | Manual build | Manual build | Manual build |
| Vendor Lock-in | High | Medium | None |

### Recommendation: **Supabase**

**Reasons**:
1. ✅ Better long-term cost predictability
2. ✅ SQL queries (future complexity)
3. ✅ More control than Firebase
4. ✅ Easy migration path (PostgreSQL standard)
5. ✅ Built-in storage (S3-compatible)
6. ✅ Auth system compatible with growth
7. ✅ Vector DB ready for future AI features

**Timeline**:
- Phase 1 (Setup): 1 week
- Phase 2 (Migration): 1-2 weeks
- Phase 3 (Testing): 1 week
- Phase 4 (Deployment): 1-2 days

---

## 7. IMPLEMENTATION ROADMAP

### Week 1-2: Research & Setup
- [ ] Create Supabase project
- [ ] Design database schema (finalize ERD)
- [ ] Set up authentication
- [ ] Configure storage buckets
- [ ] Set up RLS policies

### Week 3-4: Frontend Integration
- [ ] Create Supabase React hooks
- [ ] Refactor components to use Supabase
- [ ] Update AdminPanel for Supabase
- [ ] Test all CRUD operations
- [ ] Set up error handling

### Week 5-6: Data Migration
- [ ] Export data from Firebase
- [ ] Transform data for PostgreSQL
- [ ] Bulk insert into Supabase
- [ ] Verify data integrity
- [ ] Migrate media files

### Week 7: Testing & Optimization
- [ ] Performance testing
- [ ] Load testing
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Documentation

### Week 8: Deployment
- [ ] Blue-green deployment
- [ ] Rollback plan
- [ ] Monitoring setup
- [ ] Go live

---

## 8. CHECKLIST FOR MOVING FORWARD

### Current State (Firebase)
- [x] React frontend working
- [x] Firebase configured
- [x] Admin panel functional
- [x] AI chatbot integrated
- [ ] Supabase evaluated

### Migration Checklist
- [ ] Supabase project created
- [ ] Database design finalized
- [ ] Supabase SDK integrated
- [ ] All components refactored
- [ ] Data migrated & verified
- [ ] Tests passing
- [ ] Performance benchmarked
- [ ] Deployment to production
- [ ] Firebase shut down
- [ ] Documentation updated

---

## 9. APPENDIX: Key Files to Update

When migrating to Supabase:

1. **src/lib/supabase.js** - New file
2. **src/context/AppContext.jsx** - Add Supabase hooks
3. **src/components/AdminPanel.jsx** - Replace Firebase with Supabase calls
4. **src/components/DoubtChatbot.jsx** - Update to use Supabase for chat history (optional)
5. **src/App.jsx** - Replace Firebase initialization with Supabase
6. **package.json** - Add `@supabase/supabase-js` dependency
7. **.env.local** - Add Supabase credentials

---

## 10. NEXT STEPS

1. **Review this analysis** with the team
2. **Create Supabase account** and explore dashboard
3. **Design detailed database schema** with migrations
4. **Set up development environment** with Supabase local (optional)
5. **Create feature branches** for incremental migration
6. **Build comprehensive tests** before production deployment

---

*Generated: April 19, 2026*
*Project: Biyanis EdTech Platform*
*Status: Architecture Analysis Complete*
