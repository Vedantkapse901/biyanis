# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose a name: `biyanis-edtech`
5. Create a strong database password
6. Select region closest to your users
7. Click "Create new project" (takes ~2 minutes)

## Step 2: Create Database Schema

1. In Supabase dashboard, click "SQL Editor" on the left
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click "Run"
6. Wait for tables to be created successfully

## Step 3: Set Up Storage Buckets

1. In Supabase dashboard, click "Storage" on the left
2. Click "New Bucket"
3. Name it: `media`
4. Make it **Public** (toggle on)
5. Click "Create bucket"

**Storage Structure**:
```
media/
├── slides/
│   ├── {slideId}/
│   │   └── {filename}
├── gallery/
│   ├── {itemId}/
│   │   └── {filename}
├── results/
│   ├── {resultId}/
│   │   └── {filename}
└── downloads/
    └── {filename}
```

## Step 4: Configure Authentication

1. Click "Authentication" on the left
2. Click "Providers"
3. Enable "Email" (should be on by default)
4. Optional: Enable "Google", "GitHub" for OAuth

### For Email Auth:
- Confirm email: Keep ON (users must verify email)
- Auto confirm new user: OFF (for security)

## Step 5: Get Your Credentials

1. Click "Settings" → "API" on the left
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (under API Keys) → `VITE_SUPABASE_ANON_KEY`

3. Create `.env.local` file in project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=your_gemini_key_here
```

## Step 6: Install Supabase Package

```bash
npm install @supabase/supabase-js
```

## Step 7: Update package.json

Your `package.json` should include:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "framer-motion": "^11.0.8",
    "lucide-react": "^0.358.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.3",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

Run: `npm install`

## Step 8: Migrate Existing Data (if needed)

### From Firebase to Supabase:

1. **Export data from Firebase**:
```bash
# Use Firebase Console or firestore-export tool
firebase firestore:export ./backup --project=biyanis-8af2e
```

2. **Transform data format**:
- Firebase: Nested JSON with arrays
- Supabase: Normalized tables with foreign keys

3. **Insert into Supabase**:
```javascript
// scripts/migrate.js
import { supabase } from './src/lib/supabase.js'

async function migrate() {
  // Insert slides
  const slides = [
    {
      type: 'image',
      url: 'https://...',
      headline: 'Kota-Style Coaching, Now in Mumbai',
      subheadline: 'Conceptual clarity. Disciplined practice. Holistic learning.',
      cta_text: 'Enroll Now',
      display_order: 0
    },
    // ... more slides
  ]
  
  const { error } = await supabase.from('slides').insert(slides)
  if (error) console.error(error)
  else console.log('Slides migrated successfully')
}

migrate()
```

## Step 9: Test Connection

1. In your project, test the connection:

```javascript
// src/lib/supabase.test.js
import { supabase } from './supabase'

async function testConnection() {
  try {
    const { data, error } = await supabase.from('courses').select('count')
    if (error) throw error
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

export default testConnection
```

2. Run test:
```bash
npm run dev
# Visit http://localhost:5173 and check console for success message
```

## Step 10: Update Components

Replace Firebase calls with Supabase hooks:

### Before (Firebase):
```javascript
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export function Courses() {
  const { data } = useContext(AppContext)
  return <div>{data.courses.map(c => ...)}</div>
}
```

### After (Supabase):
```javascript
import { useCourses } from '../hooks/useSupabaseData'

export function Courses() {
  const { data: courses, loading, error } = useCourses()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{courses.map(c => ...)}</div>
}
```

## Step 11: Admin Panel with Supabase

Update AdminPanel to use Supabase mutations:

```javascript
import { useSupabaseMutation } from '../hooks/useSupabaseData'

export function AdminPanel() {
  const { insert, update, remove, loading } = useSupabaseMutation()
  
  const handleAddCourse = async (courseData) => {
    const result = await insert('courses', courseData)
    if (result.success) {
      alert('Course added!')
      // Refresh list
    }
  }
  
  const handleEditCourse = async (id, updates) => {
    const result = await update('courses', id, updates)
    if (result.success) {
      alert('Course updated!')
    }
  }
  
  const handleDeleteCourse = async (id) => {
    const result = await remove('courses', id)
    if (result.success) {
      alert('Course deleted!')
    }
  }
  
  // JSX with form using these handlers...
}
```

## Step 12: File Uploads to Supabase Storage

```javascript
import { useSupabaseStorage } from '../hooks/useSupabaseData'

export function AdminUploadMedia() {
  const { uploadFile, loading } = useSupabaseStorage()
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    const result = await uploadFile('media', `slides/${Date.now()}-${file.name}`, file)
    
    if (result.success) {
      console.log('File uploaded:', result.url)
      // Use result.url in your database
    }
  }
  
  return (
    <input 
      type="file" 
      onChange={handleFileChange}
      disabled={loading}
    />
  )
}
```

## Security: Row Level Security (RLS)

Your `schema.sql` includes RLS policies:

- **Public read**: Everyone can view slides, courses, gallery, etc.
- **Admin-only write**: Only authenticated users with `role='admin'` can modify content

To test admin access:
1. Create a test user in Auth
2. In Supabase, update their role:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'
```

## Troubleshooting

### "Supabase credentials missing" warning
- Check `.env.local` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Restart dev server: `npm run dev`

### "Database error: 42P01 - relation does not exist"
- Check all tables were created in Step 2
- Go to SQL Editor and run schema.sql again
- Verify no errors in SQL output

### "Permission denied" when updating
- Check user is authenticated
- Verify user `role` is set to `'admin'` in database
- Test RLS policy with `SELECT * FROM users WHERE id = auth.uid();`

### Storage uploads failing
- Check bucket name is `media` (case-sensitive)
- Verify bucket is set to **Public**
- Ensure file size < 50MB

## Next Steps

1. ✅ Run `npm install @supabase/supabase-js`
2. ✅ Complete setup steps 1-6 above
3. ✅ Update components (step 10)
4. ✅ Migrate admin panel (step 11)
5. ✅ Test file uploads (step 12)
6. Deploy to production

## Reference

- [Supabase Docs](https://supabase.com/docs)
- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
