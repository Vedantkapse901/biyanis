# Biyanis Backend Setup & Development

This document covers the complete backend setup for the Biyanis EdTech platform using Supabase.

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install @supabase/supabase-js

# 2. Set up .env.local (copy from .env.example)
cp .env.example .env.local
# Edit with your Supabase credentials

# 3. Run development server
npm run dev

# 4. Visit http://localhost:5173
```

---

## Backend Architecture

```
┌─────────────────────────┐
│   React Frontend        │
│  (src/components/)      │
└────────────┬────────────┘
             │
    ┌────────▼────────┐
    │  Supabase SDK   │
    │  (supabase-js)  │
    └────────┬────────┘
             │
    ┌────────▼─────────────────┐
    │     Supabase Backend      │
    ├───────────────────────────┤
    │  PostgreSQL Database      │
    │  - Tables for all data    │
    │  - RLS Policies           │
    │  - Indexes                │
    ├───────────────────────────┤
    │  Authentication           │
    │  - Email/Password         │
    │  - OAuth (optional)       │
    ├───────────────────────────┤
    │  Storage                  │
    │  - S3-compatible buckets  │
    │  - Media assets           │
    └───────────────────────────┘
```

---

## File Structure

```
biyanis-main/
├── src/
│   ├── lib/
│   │   ├── firebase.js          (Legacy - being replaced)
│   │   └── supabase.js          (NEW - Supabase client)
│   ├── hooks/
│   │   └── useSupabaseData.js   (NEW - Custom hooks for data)
│   ├── components/
│   │   └── AdminPanel.jsx       (Needs Supabase integration)
│   └── pages/
│       ├── Courses.jsx
│       ├── Courses.supabase.jsx (NEW - Example implementation)
│       └── ... other pages
├── database/
│   └── schema.sql              (NEW - Database schema)
├── App.jsx                     (Original - Firebase version)
├── App.supabase.jsx            (NEW - Supabase version)
├── .env.example                (NEW - Environment template)
├── SUPABASE_SETUP.md           (NEW - Setup guide)
├── MIGRATION_GUIDE.md          (NEW - Migration instructions)
├── BACKEND_README.md           (NEW - This file)
└── ARCHITECTURE_ANALYSIS.md    (Documentation)
```

---

## Core Backend Components

### 1. Supabase Client (`src/lib/supabase.js`)

Initializes the Supabase connection:

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

**Environment Variables Required**:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous public key

### 2. Custom Hooks (`src/hooks/useSupabaseData.js`)

Reusable React hooks for data operations:

**Fetch Hooks**:
- `useSupabaseTable()` - Generic fetch from any table
- `useSlides()` - Get all hero slides
- `useCourses()` - Get all courses
- `useResults()` - Get student results
- `useBranches()` - Get location branches
- `useTestimonials()` - Get testimonials
- `useGalleryFolders()` - Get gallery with nested items
- `useFreeDownloads()` - Get downloadable resources
- `useSettings()` - Get app settings

**Mutation Hooks**:
- `useSupabaseMutation()` - Insert, update, delete operations
- `useSupabaseStorage()` - File upload/delete

### 3. Database Schema (`database/schema.sql`)

Complete PostgreSQL schema with:
- 13 tables covering all features
- Row-Level Security (RLS) policies
- Indexes for performance
- Foreign key relationships

**Tables**:
- `settings` - Global app configuration
- `slides` - Hero banner slides
- `courses` - Course offerings
- `results` - Student achievements
- `branches` - Location information
- `testimonials` - Student reviews
- `gallery_folders` - Event folders
- `gallery_items` - Gallery media
- `free_downloads` - PDF resources
- `users` - User accounts + roles
- `student_portal` - Portal programs
- `student_portal_students` - Student records
- `ai_conversations` - Chat history (optional)

---

## Implementation Guide

### Step 1: Set Up Supabase Project

Follow `SUPABASE_SETUP.md` for:
1. Creating project
2. Configuring database
3. Setting up storage
4. Getting credentials

### Step 2: Add Environment Variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyD...
```

### Step 3: Install Package

```bash
npm install @supabase/supabase-js
```

### Step 4: Update Components

Replace Firebase/Context with Supabase hooks:

**Example: Update Courses Page**

Before:
```javascript
import { AppContext } from '../context/AppContext'

export function Courses() {
  const { data } = useContext(AppContext)
  const courses = data.courses
}
```

After:
```javascript
import { useCourses } from '../hooks/useSupabaseData'

export function Courses() {
  const { data: courses, loading, error } = useCourses()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <CoursesList courses={courses} />
}
```

### Step 5: Test Locally

```bash
npm run dev
# Check browser console for successful data loading
```

---

## Common Patterns

### Pattern 1: Display Data

```javascript
import { useCourses } from '../hooks/useSupabaseData'

export function CoursesList() {
  const { data, loading, error } = useCourses()
  
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  
  return (
    <ul>
      {data.map(course => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  )
}
```

### Pattern 2: Create Item (Admin)

```javascript
import { useSupabaseMutation } from '../hooks/useSupabaseData'

export function AddCourseForm() {
  const { insert, loading, error } = useSupabaseMutation()
  const [title, setTitle] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await insert('courses', {
      title,
      badge: 'New',
      display_order: 0,
    })
    if (result.success) {
      alert('Course added!')
      setTitle('')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course title"
      />
      <button disabled={loading}>Add Course</button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

### Pattern 3: Update Item (Admin)

```javascript
const { update, loading } = useSupabaseMutation()

const handleSave = async (courseId, newData) => {
  const result = await update('courses', courseId, {
    title: newData.title,
    description: newData.description,
  })
  
  if (result.success) {
    alert('Course updated!')
  }
}
```

### Pattern 4: Delete Item (Admin)

```javascript
const { remove, loading } = useSupabaseMutation()

const handleDelete = async (courseId) => {
  if (confirm('Delete this course?')) {
    const result = await remove('courses', courseId)
    if (result.success) {
      alert('Course deleted!')
    }
  }
}
```

### Pattern 5: Upload Files

```javascript
import { useSupabaseStorage } from '../hooks/useSupabaseData'

export function FileUpload() {
  const { uploadFile, loading } = useSupabaseStorage()
  
  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    const result = await uploadFile(
      'media',
      `slides/${Date.now()}-${file.name}`,
      file
    )
    
    if (result.success) {
      console.log('File URL:', result.url)
      // Save result.url to database
    }
  }
  
  return (
    <input
      type="file"
      onChange={handleFileSelect}
      disabled={loading}
    />
  )
}
```

---

## Admin Panel Integration

The AdminPanel needs updating to use Supabase. Key areas:

### 1. Load Data on Mount
```javascript
import { useSlides, useCourses, useResults } from '../hooks/useSupabaseData'

export function AdminPanel() {
  const { data: slides } = useSlides()
  const { data: courses } = useCourses()
  const { data: results } = useResults()
  // Use these instead of context data
}
```

### 2. Save Changes
```javascript
const { update, insert, remove } = useSupabaseMutation()

const saveToWebsite = async () => {
  // For new items (no id or negative id)
  for (const course of draftData.courses) {
    if (!course.id || course.id < 0) {
      await insert('courses', course)
    }
  }
  
  // For modified items
  for (const course of modifiedCourses) {
    await update('courses', course.id, course)
  }
  
  // For deleted items
  for (const id of deletedIds) {
    await remove('courses', id)
  }
}
```

### 3. Handle Media Uploads
```javascript
const { uploadFile } = useSupabaseStorage()

const handleMediaUpload = async (file, type) => {
  const path = `${type}/${Date.now()}-${file.name}`
  const result = await uploadFile('media', path, file)
  
  if (result.success) {
    return result.url // Use in database
  }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 React Component                         │
│  (e.g., Courses.jsx)                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Supabase Hook            │
        │   (useCourses)             │
        │   - Fetches data           │
        │   - Manages loading        │
        │   - Handles errors         │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Supabase JS Client       │
        │   - Makes HTTP requests    │
        │   - Handles auth tokens    │
        │   - Manages sessions       │
        └────────────┬───────────────┘
                     │
         ┌───────────┴───────────────┐
         │                           │
         ▼                           ▼
    ┌─────────────┐         ┌──────────────┐
    │  REST API   │         │  Realtime    │
    │  (queries)  │         │  (listeners) │
    └────┬────────┘         └──────┬───────┘
         │                         │
         └───────────┬─────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Supabase PostgreSQL       │
        │  - Execute queries         │
        │  - Apply RLS policies      │
        │  - Return results          │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Hook Returns State        │
        │  - data                    │
        │  - loading                 │
        │  - error                   │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Component Re-renders      │
        │  with updated data         │
        └────────────────────────────┘
```

---

## Security Considerations

### Row Level Security (RLS)

Policies are set up in `schema.sql`:

1. **Public Read**: Everyone can view content
2. **Admin Only Write**: Only users with `role='admin'` can modify

### Authentication

```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Check if admin
const isAdmin = user?.user_metadata?.role === 'admin'

// Protected operation
if (isAdmin) {
  await insert('courses', data)
}
```

### API Keys

- **Anon Key**: Public, used in frontend (read-only by default)
- **Service Key**: Secret, used in backend (full access)
- Never commit keys to git (.gitignore handles .env.local)

---

## Performance Optimization

### 1. Pagination

```javascript
const { data, error } = await supabase
  .from('gallery_items')
  .select('*')
  .range(0, 19) // First 20 items
  .order('created_at', { ascending: false })
```

### 2. Selective Columns

```javascript
const { data } = await supabase
  .from('courses')
  .select('id, title, description') // Not all columns
  .limit(10)
```

### 3. Caching

```javascript
const { data, loading, error } = useCourses()
// Hook automatically caches while component is mounted
```

### 4. Indexes

Already configured in `schema.sql` for:
- `display_order` (sorting)
- `folder_id` (joins)
- `user_id` (filtering)
- `created_at` (chronological queries)

---

## Troubleshooting

### Data Not Loading

1. Check `.env.local` has correct credentials
2. Verify Supabase project is running
3. Check RLS policies allow SELECT
4. Look at browser console for errors

```javascript
// Debug in console
const { data, error } = await supabase.from('courses').select('*')
console.log(data, error)
```

### Mutations Failing

1. Verify user is authenticated (for admin operations)
2. Check user role is 'admin'
3. Verify RLS policy allows operation
4. Check data types match schema

### Slow Queries

1. Add indexes for frequently filtered columns
2. Use `.select()` with only needed columns
3. Implement pagination for large datasets
4. Check Supabase dashboard for slow queries

---

## Development Workflow

### Adding a New Feature

1. Design database schema
2. Add table and RLS policies to `schema.sql`
3. Create custom hook in `useSupabaseData.js`
4. Use hook in component
5. Test locally with `npm run dev`

### Example: Adding Student Reviews

```sql
-- Add to schema.sql
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  student_name VARCHAR(255),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  course_id BIGINT REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are readable by all" ON reviews FOR SELECT USING (true);
CREATE POLICY "Only admins can manage reviews" ON reviews
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
```

```javascript
// Add to useSupabaseData.js
export function useReviews(courseId) {
  return useSupabaseTable('reviews', {
    filters: { course_id: courseId },
    orderBy: 'created_at',
    ascending: false,
  })
}
```

```javascript
// Use in component
export function ReviewsList({ courseId }) {
  const { data: reviews } = useReviews(courseId)
  return <div>{reviews.map(r => <Review key={r.id} {...r} />)}</div>
}
```

---

## Deployment Checklist

- [ ] All environment variables set in deployment platform
- [ ] Database schema applied in production Supabase
- [ ] Storage buckets created and public
- [ ] Authentication configured
- [ ] RLS policies verified
- [ ] All components updated to use Supabase
- [ ] Admin panel tested
- [ ] File uploads tested
- [ ] Error handling in place
- [ ] Monitoring/logging set up

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Test queries in Supabase SQL Editor
4. Check RLS policies in Auth section

---

*Last Updated: April 19, 2026*
*Status: Backend setup complete and ready for integration*
