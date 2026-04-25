# Firebase to Supabase Migration Guide

## Overview

This guide walks you through migrating the Biyanis platform from Firebase to Supabase with zero downtime.

## Pre-Migration Checklist

- [ ] Backup current Firebase data
- [ ] Create Supabase account and project
- [ ] Test Supabase credentials locally
- [ ] Create database schema in Supabase
- [ ] Plan migration window (30 min)
- [ ] Notify team/users of the change

---

## Phase 1: Setup (30 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create project: `biyanis-edtech`
3. Keep credentials safe
4. Wait for project to fully initialize

### 1.2 Set Up Database

1. Open Supabase SQL Editor
2. Copy `database/schema.sql` entirely
3. Paste and run in SQL Editor
4. Verify all tables created successfully

### 1.3 Configure Credentials

Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### 1.4 Install Package

```bash
npm install @supabase/supabase-js
```

---

## Phase 2: Data Migration (15-30 minutes)

### Option A: Manual Migration (for small datasets)

Export from Firebase:
```javascript
// scripts/export-firebase.js
import { db } from './src/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

async function exportData() {
  const docRef = doc(db, 'artifacts', 'biyani-edtech-app', 'public', 'data', 'biyani_data', 'main_state')
  const snapshot = await getDoc(docRef)
  const data = snapshot.data()
  
  // Save to file
  console.log(JSON.stringify(data, null, 2))
  return data
}

exportData()
```

Insert into Supabase:
```javascript
// scripts/migrate-to-supabase.js
import { supabase } from './src/lib/supabase'

async function migrateData(firebaseData) {
  try {
    // Migrate Slides
    if (firebaseData.slides && firebaseData.slides.length > 0) {
      const slides = firebaseData.slides.map((slide, idx) => ({
        type: slide.type || 'image',
        url: slide.url,
        headline: slide.headline,
        subheadline: slide.sub,
        cta_text: slide.cta,
        display_order: idx,
      }))

      const { error: slideError } = await supabase
        .from('slides')
        .insert(slides)
      if (slideError) console.error('Slides error:', slideError)
      else console.log('✅ Slides migrated')
    }

    // Migrate Courses
    if (firebaseData.courses && firebaseData.courses.length > 0) {
      const courses = firebaseData.courses.map((course, idx) => ({
        title: course.title,
        badge: course.badge,
        duration: course.duration,
        description: course.desc,
        display_order: idx,
      }))

      const { error: courseError } = await supabase
        .from('courses')
        .insert(courses)
      if (courseError) console.error('Courses error:', courseError)
      else console.log('✅ Courses migrated')
    }

    // Migrate Results
    if (firebaseData.results && firebaseData.results.length > 0) {
      const results = firebaseData.results.map(result => ({
        name: result.name,
        score: result.score,
        exam: result.exam,
        year: result.year,
        image_url: result.image,
      }))

      const { error: resultError } = await supabase
        .from('results')
        .insert(results)
      if (resultError) console.error('Results error:', resultError)
      else console.log('✅ Results migrated')
    }

    // Migrate Branches
    if (firebaseData.branches && firebaseData.branches.length > 0) {
      const branches = firebaseData.branches.map((branch, idx) => ({
        name: branch.name,
        phone: branch.phone,
        address: branch.address,
        map_link: branch.mapLink,
        display_order: idx,
      }))

      const { error: branchError } = await supabase
        .from('branches')
        .insert(branches)
      if (branchError) console.error('Branches error:', branchError)
      else console.log('✅ Branches migrated')
    }

    // Migrate Testimonials
    if (firebaseData.testimonials && firebaseData.testimonials.length > 0) {
      const testimonials = firebaseData.testimonials.map(testimonial => ({
        name: testimonial.name,
        rating: testimonial.rating,
        text: testimonial.text,
      }))

      const { error: testimonialError } = await supabase
        .from('testimonials')
        .insert(testimonials)
      if (testimonialError) console.error('Testimonials error:', testimonialError)
      else console.log('✅ Testimonials migrated')
    }

    // Migrate Gallery
    if (firebaseData.gallery && firebaseData.gallery.length > 0) {
      // First create folders
      const folderMap = {}
      const uniqueFolders = [...new Set(firebaseData.gallery.map(g => g.folder))]

      for (const folderName of uniqueFolders) {
        const { data, error } = await supabase
          .from('gallery_folders')
          .insert({ folder_name: folderName })
          .select()

        if (error) {
          console.error('Folder error:', error)
        } else {
          folderMap[folderName] = data[0].id
        }
      }

      // Then insert items
      const items = firebaseData.gallery.map(gallery => ({
        folder_id: folderMap[gallery.folder],
        title: gallery.title,
        type: gallery.type || 'image',
        url: gallery.url,
        thumbnail_url: gallery.thumbnail,
        drive_link: gallery.driveLink,
      }))

      const { error: itemError } = await supabase
        .from('gallery_items')
        .insert(items)

      if (itemError) console.error('Gallery items error:', itemError)
      else console.log('✅ Gallery migrated')
    }

    // Migrate Free Downloads
    if (firebaseData.freeDownloads && firebaseData.freeDownloads.length > 0) {
      const downloads = firebaseData.freeDownloads.map((dl, idx) => ({
        title: dl.title,
        file_type: dl.fileType,
        url: dl.url,
        display_order: idx,
      }))

      const { error: downloadError } = await supabase
        .from('free_downloads')
        .insert(downloads)
      if (downloadError) console.error('Downloads error:', downloadError)
      else console.log('✅ Free downloads migrated')
    }

    // Migrate Settings
    const { error: settingsError } = await supabase
      .from('settings')
      .update({
        tagline: firebaseData.settings?.tagline,
        whatsapp: firebaseData.settings?.whatsapp,
        review_link: firebaseData.settings?.reviewLink,
        gemini_api_key: firebaseData.settings?.geminiApiKey,
        made_by: firebaseData.settings?.madeBy,
        vedant_designation: firebaseData.settings?.vedantDesignation,
        bhushan_designation: firebaseData.settings?.bhushanDesignation,
        vedant_phone: firebaseData.settings?.vedantPhone,
        vedant_email: firebaseData.settings?.vedantEmail,
        bhushan_phone: firebaseData.settings?.bhushanPhone,
        bhushan_email: firebaseData.settings?.bhushanEmail,
      })
      .eq('id', (await supabase.from('settings').select('id').limit(1)).data[0]?.id)

    if (settingsError) console.error('Settings error:', settingsError)
    else console.log('✅ Settings migrated')

    console.log('\n✅ ALL DATA MIGRATED SUCCESSFULLY!')
  } catch (error) {
    console.error('Migration error:', error)
  }
}

// Run migration
const firebaseData = { /* exported data from Firebase */ }
migrateData(firebaseData)
```

### Option B: Automated Firebase Import

Use Firebase backup/export tools:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Export from Firebase
firebase firestore:export ./backup --project=biyanis-8af2e

# Then transform and import the data using the script above
```

---

## Phase 3: Update Code (1-2 hours)

### 3.1 Update main.jsx / index.jsx

Change App import:
```javascript
// Before
import App from './App'

// After - use Supabase version
import App from './App.supabase'
// or rename App.supabase.jsx to App.jsx after testing
```

### 3.2 Update Components Incrementally

Replace Firebase/Context with Supabase hooks:

**Before (Firebase + Context)**:
```javascript
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export function Courses() {
  const { data } = useContext(AppContext)
  return data.courses.map(course => ...)
}
```

**After (Supabase)**:
```javascript
import { useCourses } from '../hooks/useSupabaseData'

export function Courses() {
  const { data: courses, loading, error } = useCourses()
  
  if (loading) return <Spinner />
  if (error) return <Error />
  return courses.map(course => ...)
}
```

### 3.3 Update Pages One by One

1. **Courses.jsx**
   ```bash
   cp src/pages/Courses.supabase.jsx src/pages/Courses.jsx
   # Or manually update using hooks
   ```

2. **Results.jsx**
   ```javascript
   import { useResults } from '../hooks/useSupabaseData'
   
   export function Results() {
     const { data: results } = useResults()
     // Update JSX to use results instead of context data
   }
   ```

3. **Branches.jsx**
   ```javascript
   import { useBranches } from '../hooks/useSupabaseData'
   ```

4. **Gallery.jsx**
   ```javascript
   import { useGalleryFolders } from '../hooks/useSupabaseData'
   ```

5. **StudyMaterial.jsx**
   ```javascript
   import { useFreeDownloads } from '../hooks/useSupabaseData'
   ```

### 3.4 Update Admin Panel

Replace Firebase with Supabase mutations:

```javascript
import { useSupabaseMutation } from '../hooks/useSupabaseData'

export function AdminPanel() {
  const { insert, update, remove, loading } = useSupabaseMutation()

  // Replace admin operations with these methods
  
  const saveToWebsite = async () => {
    // Update Supabase instead of Firebase
    for (const course of draftData.courses) {
      if (course.id && course.id < 0) {
        // New course
        await insert('courses', {
          title: course.title,
          badge: course.badge,
          duration: course.duration,
          description: course.desc,
        })
      } else {
        // Update existing
        await update('courses', course.id, {
          title: course.title,
          // ... other fields
        })
      }
    }
  }
}
```

### 3.5 Update Chatbot (if storing history)

```javascript
import { supabase } from '../lib/supabase'

const handleSend = async (e) => {
  e.preventDefault()
  // ... existing chat logic ...
  
  // Store conversation in Supabase
  if (user) {
    await supabase.from('ai_conversations').insert({
      user_id: user.id,
      query: userMsg.content,
      response: res,
      tokens_used: estimatedTokens,
    })
  }
}
```

---

## Phase 4: Testing (30 minutes)

### 4.1 Local Testing

```bash
npm run dev
```

Check:
- [ ] Data loads correctly
- [ ] No console errors
- [ ] All pages work
- [ ] Admin panel functions
- [ ] File uploads work
- [ ] Chatbot sends messages

### 4.2 Verify Data Integrity

In Supabase SQL Editor:
```sql
-- Check counts match Firebase
SELECT 'slides' as table_name, COUNT(*) as count FROM slides
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'results', COUNT(*) FROM results
UNION ALL
SELECT 'branches', COUNT(*) FROM branches
-- etc.
```

### 4.3 Test RLS Policies

- [ ] Public users can view all content
- [ ] Only admins can edit content
- [ ] Users can only see their own chat history

---

## Phase 5: Deployment (15 minutes)

### 5.1 Production Build

```bash
npm run build
# Test locally first
npm run preview
```

### 5.2 Deploy

```bash
# Deploy to your hosting (Vercel, Netlify, GitHub Pages, etc.)
# Ensure .env.local variables are set in deployment platform
```

### 5.3 Verify Production

- [ ] Site loads correctly
- [ ] All data displays
- [ ] Admin panel works
- [ ] Forms submit correctly
- [ ] No CORS errors

---

## Phase 6: Cleanup (Optional)

### 6.1 Keep Firebase as Backup (Recommended)

Keep Firebase project running for 1-2 weeks as backup, then delete.

### 6.2 Remove Firebase Code

Once fully migrated:
```bash
# Remove Firebase files (if not using)
rm src/lib/firebase.js

# Remove Firebase from package.json
npm uninstall firebase
```

### 6.3 Cleanup Old Files

```bash
# Backup original files
mv src/App.jsx src/App.firebase.backup.jsx
mv src/App.supabase.jsx src/App.jsx

# Keep .supabase versions as reference
```

---

## Rollback Plan (if needed)

If migration fails:

1. Keep Firebase data intact
2. Revert `src/App.jsx` to original
3. Redeploy from previous Git commit
4. Investigate issue in local environment
5. Fix and retry migration

```bash
# Rollback code
git revert HEAD

# Or manually restore from backup
cp src/App.firebase.backup.jsx src/App.jsx
npm run build
npm run preview
```

---

## Common Issues & Solutions

### Issue: "Column does not exist"
**Solution**: Verify all tables created in schema.sql. Check SQL execution output.

### Issue: "Permission denied" on update
**Solution**: Check user role is 'admin' in users table. Test RLS policy in SQL Editor.

### Issue: Data not loading
**Solution**: Check browser console for errors. Verify VITE_SUPABASE_URL and KEY are correct.

### Issue: CORS errors
**Solution**: Supabase should auto-handle CORS. If persists, check allowed domains in Supabase Settings.

### Issue: Large files uploading slowly
**Solution**: Use resumable uploads (already configured in hooks). Consider image optimization.

---

## Post-Migration Checklist

- [ ] All data migrated and verified
- [ ] Supabase project configured
- [ ] All components updated to use Supabase
- [ ] Admin panel fully functional
- [ ] Testing complete - no errors
- [ ] Production deployed
- [ ] Users notified
- [ ] Firebase kept as backup for 2 weeks
- [ ] Monitoring set up for Supabase
- [ ] Documentation updated

---

## Support & Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## Estimated Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup | 30 min | Create project, schema, credentials |
| Migration | 30 min | Export/import data |
| Code Updates | 1-2 hrs | Update components & admin panel |
| Testing | 30 min | Local + staging verification |
| Deployment | 15 min | Build and deploy to production |
| **Total** | **~3-4 hrs** | Can be done in one session |

---

*Last updated: April 19, 2026*
