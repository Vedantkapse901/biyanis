# Backend Setup Checklist & Quick Reference

## 📋 What's Been Created

Your Supabase backend is ready to integrate! Here's what's in place:

### Core Backend Files ✅
- **`src/lib/supabase.js`** - Supabase client initialization
- **`src/hooks/useSupabaseData.js`** - All custom React hooks for data operations
- **`database/schema.sql`** - Complete PostgreSQL schema with RLS policies
- **`.env.example`** - Environment variables template

### Implementation Examples ✅
- **`src/App.supabase.jsx`** - Updated App component using Supabase
- **`src/pages/Courses.supabase.jsx`** - Example page using Supabase hooks

### Documentation ✅
- **`SUPABASE_SETUP.md`** - Step-by-step Supabase project setup
- **`MIGRATION_GUIDE.md`** - Firebase to Supabase migration
- **`BACKEND_README.md`** - Complete backend development guide
- **`ARCHITECTURE_ANALYSIS.md`** - System architecture overview

### Updated Files ✅
- **`package.json`** - Added `@supabase/supabase-js` dependency

---

## 🚀 Quick Start (30 minutes)

### Step 1: Create Supabase Project (5 min)
```
1. Visit https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Name: biyanis-edtech
5. Set strong database password
6. Select region near you
7. Wait for creation (2 minutes)
```

### Step 2: Set Up Database (5 min)
```
1. In Supabase, go to SQL Editor
2. Click "New Query"
3. Copy entire contents of database/schema.sql
4. Paste and click "Run"
5. Verify all tables created ✓
```

### Step 3: Configure Storage (2 min)
```
1. In Supabase, click "Storage"
2. Click "New Bucket"
3. Name: media
4. Toggle "Make public" ON
5. Create bucket ✓
```

### Step 4: Get Credentials (3 min)
```
1. Click Settings → API
2. Copy Project URL → VITE_SUPABASE_URL
3. Copy anon key → VITE_SUPABASE_ANON_KEY
4. Create .env.local file with these values
```

### Step 5: Install & Test (10 min)
```bash
# Install package
npm install

# Run dev server
npm run dev

# Check browser console for success message
# Should see: "✅ Data loaded from Supabase successfully"
```

---

## 📁 File Guide

### Where to Find What

| Task | File(s) |
|------|---------|
| Set up Supabase project | `SUPABASE_SETUP.md` |
| Migrate from Firebase | `MIGRATION_GUIDE.md` |
| Develop features | `BACKEND_README.md` |
| Understand architecture | `ARCHITECTURE_ANALYSIS.md` |
| Add Supabase to component | See "Adding Supabase to Components" below |

### Key Files to Know

**Backend Core**:
- `src/lib/supabase.js` - Supabase client (initialize once, use everywhere)
- `src/hooks/useSupabaseData.js` - All data fetching & mutation hooks

**Database**:
- `database/schema.sql` - Full schema (13 tables, RLS policies, indexes)

**Components** (Update in this order):
1. `Courses.jsx` - Uses `useCourses()`
2. `Results.jsx` - Uses `useResults()`
3. `Branches.jsx` - Uses `useBranches()`
4. `Gallery.jsx` - Uses `useGalleryFolders()`
5. `StudyMaterial.jsx` - Uses `useFreeDownloads()`
6. `AdminPanel.jsx` - Uses `useSupabaseMutation()`

**Environment**:
- `.env.local` - YOUR credentials (never commit this!)
- `.env.example` - Template for reference

---

## 🔧 Common Tasks

### Task 1: Display Data in a Component

```javascript
// 1. Import hook
import { useCourses } from '../hooks/useSupabaseData'

// 2. Use in component
export function Courses() {
  const { data, loading, error } = useCourses()
  
  // 3. Handle states
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  
  // 4. Render data
  return (
    <div>
      {data.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  )
}
```

### Task 2: Add New Item (Admin)

```javascript
import { useSupabaseMutation } from '../hooks/useSupabaseData'

export function AdminAddCourse() {
  const { insert, loading } = useSupabaseMutation()
  
  const handleAdd = async () => {
    const result = await insert('courses', {
      title: 'New Course',
      badge: 'New',
      display_order: 0,
    })
    
    if (result.success) {
      alert('Course added!')
    }
  }
  
  return <button onClick={handleAdd} disabled={loading}>Add</button>
}
```

### Task 3: Update Item

```javascript
const { update } = useSupabaseMutation()

const handleUpdate = async (courseId) => {
  const result = await update('courses', courseId, {
    title: 'Updated Title',
  })
  
  if (result.success) alert('Updated!')
}
```

### Task 4: Delete Item

```javascript
const { remove } = useSupabaseMutation()

const handleDelete = async (courseId) => {
  const result = await remove('courses', courseId)
  if (result.success) alert('Deleted!')
}
```

### Task 5: Upload File

```javascript
import { useSupabaseStorage } from '../hooks/useSupabaseData'

export function UploadImage() {
  const { uploadFile, loading } = useSupabaseStorage()
  
  const handleUpload = async (file) => {
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
      onChange={(e) => handleUpload(e.target.files[0])}
      disabled={loading}
    />
  )
}
```

---

## 📚 Learning Path

Follow in this order:

1. **SUPABASE_SETUP.md** (15 min) - Get Supabase running
2. **BACKEND_README.md** (20 min) - Understand architecture
3. **Common Tasks above** (30 min) - Implement features
4. **MIGRATION_GUIDE.md** (when ready) - Migrate from Firebase

---

## ✅ Implementation Checklist

### Phase 1: Core Setup
- [ ] Supabase project created
- [ ] Database schema imported
- [ ] Storage bucket configured
- [ ] Environment variables set
- [ ] `npm install` run
- [ ] Dev server starts without errors

### Phase 2: Component Updates
- [ ] Courses page updated with `useCourses()`
- [ ] Results page updated with `useResults()`
- [ ] Branches page updated with `useBranches()`
- [ ] Gallery page updated with `useGalleryFolders()`
- [ ] Study Material page updated with `useFreeDownloads()`
- [ ] Each page tested locally

### Phase 3: Admin Panel
- [ ] AdminPanel imports hooks
- [ ] Add functionality working
- [ ] Edit functionality working
- [ ] Delete functionality working
- [ ] Media upload working
- [ ] Error handling in place

### Phase 4: Testing & Deployment
- [ ] All data displays correctly
- [ ] No console errors
- [ ] Admin panel fully functional
- [ ] File uploads work
- [ ] Fallback works if Supabase down
- [ ] Production build passes
- [ ] Deploy to hosting

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Create Supabase project
2. ✅ Set up database & storage
3. ✅ Configure .env.local
4. ✅ Run `npm install`
5. ✅ Test with `npm run dev`

### Short Term (This Week)
1. Update Courses component
2. Update Results component
3. Update Branches component
4. Update Gallery component
5. Test all pages

### Medium Term (Next Week)
1. Update AdminPanel fully
2. Migrate data from Firebase (if needed)
3. Test all admin operations
4. User acceptance testing
5. Deploy to production

---

## 🐛 Troubleshooting Quick Answers

**"Module not found: supabase-js"**
- Run: `npm install @supabase/supabase-js`

**"Supabase credentials missing warning"**
- Create `.env.local` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

**"Data not loading"**
1. Check `.env.local` values are correct
2. Verify database schema was created (check Supabase SQL Editor)
3. Check RLS policies allow SELECT (should by default)
4. Open browser DevTools → check console for errors

**"Permission denied on update"**
- Check user is authenticated
- Verify user `role` is 'admin' in Supabase users table
- Check RLS policy allows UPDATE for admin role

**"File upload failing"**
- Verify storage bucket named `media` exists
- Check bucket is set to Public
- File size < 50MB

**"Slow queries"**
- Check if indexes exist (they should from schema.sql)
- Try using .select() with only needed columns
- Implement pagination for large datasets

---

## 📖 Key Hooks Reference

```javascript
// Fetch Hooks
useCourses()              // Get all courses
useSlides()               // Get hero slides
useResults()              // Get student results
useBranches()             // Get location branches
useTestimonials()         // Get testimonials
useGalleryFolders()       // Get gallery with items
useFreeDownloads()        // Get downloadable resources
useSettings()             // Get app configuration

// Generic Hook
useSupabaseTable(table, options)  // Fetch from any table

// Mutation Hook
const { insert, update, remove, loading, error } = useSupabaseMutation()

// Storage Hook
const { uploadFile, deleteFile, loading, error } = useSupabaseStorage()
```

---

## 🔐 Security Reminders

1. **Never commit `.env.local`** - It's in .gitignore
2. **RLS policies are on** - Only admins can modify content
3. **Public read by default** - Website content visible to everyone
4. **Authentication required** - For admin operations
5. **Storage is public** - Images/files are publicly accessible by design

---

## 📞 Support Resources

- Supabase Docs: https://supabase.com/docs
- React Guide: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- Storage Guide: https://supabase.com/docs/guides/storage

---

## 💡 Pro Tips

1. **Local Development**: Use Supabase local setup for offline development
2. **Drafts**: Add `is_draft` column to tables for draft/publish workflow
3. **Soft Delete**: Add `deleted_at` column instead of hard delete
4. **Real-time**: Enable real-time subscriptions for live updates
5. **Analytics**: Log all admin actions for audit trail

---

## 📊 Status

```
Backend Setup:     ✅ COMPLETE
Documentation:     ✅ COMPLETE
Code Examples:     ✅ COMPLETE
Hooks Created:     ✅ COMPLETE
Schema Ready:      ✅ COMPLETE

Ready to Integrate: ✅ YES
```

---

## 🎬 Getting Started NOW

```bash
# 1. Install dependencies
npm install

# 2. Follow SUPABASE_SETUP.md to create project
# Takes ~15 minutes

# 3. Create .env.local with credentials
# Takes ~2 minutes

# 4. Start dev server
npm run dev

# 5. Check browser console
# Should see success message or connection error

# If successful, you're ready to integrate components!
```

---

*Last Updated: April 19, 2026*
*Backend Status: Ready for Integration*
*Estimated time to production: 3-4 hours*
