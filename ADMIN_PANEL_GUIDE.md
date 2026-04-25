# Admin Panel - Complete Guide

## How to Enable New Admin Panel

### Step 1: Update App.jsx

In your `src/App.jsx`, change the import:

**FROM:**
```javascript
import { AdminPanel } from './components/AdminPanel'
```

**TO:**
```javascript
import { AdminPanel } from './components/AdminPanel.supabase'
```

---

### Step 2: Restart Dev Server

```bash
npm run dev
```

---

### Step 3: Login to Admin Panel

1. Go to http://localhost:5173/#/admin
2. Enter password: `Biyanis@123`
3. Click Login

---

## Features

✅ **Full CRUD Operations**
- Create new items
- Read/view all items
- Update existing items
- Delete items with confirmation

✅ **File Uploads**
- Upload images for slides
- Upload photos for student results
- Direct upload to Supabase Storage

✅ **Real-time Sync**
- Changes save to database immediately
- No "Save to Website" button needed
- Live updates across all instances

✅ **Inline Editing**
- Click Edit button to edit inline
- Click Done to save
- Click X to cancel edit

✅ **Organized Tabs**
- Slides
- Courses
- Results
- Branches
- Testimonials
- Downloads

---

## Managing Each Section

### 📸 Slides

**Add Slide:**
1. Click "Add Slide" button
2. New slide created with defaults
3. Click Edit to modify

**Edit Slide:**
1. Click Edit button
2. Change type (Image/Video)
3. Edit headline, subheadline, CTA
4. Upload media file
5. Click Done

**Delete Slide:**
1. Click Trash icon
2. Confirm deletion
3. Slide removed from database

---

### 📚 Courses

**Add Course:**
1. Click "Add Course"
2. Fill in: title, badge, duration, description
3. Click Done

**Edit Course:**
1. Click Edit button
2. Update any field
3. Click Done

**Example Course:**
```
Title: JEE Advanced
Badge: Popular
Duration: 2 Years
Description: Kota-style rigorous preparation...
```

---

### 🏆 Results

**Add Result:**
1. Click "Add Result"
2. Fill in student name, score/rank, exam, year
3. Upload photo
4. Click Done

**Student Result Fields:**
- Name: Student name
- Score/Rank: AIR 45, 710/720, 99.98%ile, etc.
- Exam: JEE Adv, NEET, JEE Main, MHT-CET
- Year: 2025, 2024, etc.
- Photo: Student profile picture

---

### 🏢 Branches

**Add Branch:**
1. Click "Add Branch"
2. Fill in name, phone, address
3. Add Google Maps link (optional)
4. Click Done

**Branch Fields:**
- Name: HEAD OFFICE - MIRA ROAD EAST
- Phone: +91 9876543210
- Address: Full address with landmarks
- Map Link: Google Maps URL

---

### ⭐ Testimonials

**Add Testimonial:**
1. Click "Add Testimonial"
2. Fill in student name
3. Select rating (1-5 stars)
4. Enter feedback text
5. Click Done

**Example Testimonial:**
```
Name: Vikram Singh
Rating: 5 stars
Text: "The faculty here is top-notch. The AI doubt solver changed how I study."
```

---

### 📥 Downloads

**Add Download:**
1. Click "Add Download"
2. Enter title (e.g., "JEE Physics Formula Sheet")
3. Select file type (PDF, DOCX, ZIP, etc.)
4. Paste file URL
5. Click Done

**File URL Sources:**
- Google Drive share link
- Direct PDF link
- CloudStorage URL

---

## Upload Files

### Image Uploads (Slides, Results)

1. Click Edit on slide or result
2. Select file type (image or video)
3. Click "Media Upload" input
4. Choose file from your computer
5. File uploads automatically
6. Click Done

**Supported Formats:**
- Images: JPG, PNG, WebP, GIF
- Videos: MP4, WebM, Ogg

**File Size Limits:**
- Images: <5MB recommended
- Videos: <50MB recommended

---

### PDF/Document Uploads

For downloads section:

1. Upload PDF to external service (Google Drive, Dropbox)
2. Get shareable link
3. In Downloads tab, paste the link in "File URL" field
4. Click Done

**Example:**
```
Google Drive Link: https://drive.google.com/file/d/1abc...
Direct Download: https://example.com/file.pdf
```

---

## Understanding the Interface

### Editing States

**View Mode:**
```
[Content Preview]
[Edit] [Delete]
```

**Edit Mode:**
```
[Input Fields]
[Inline Editing]
[Done] [Cancel]
```

### Status Messages

```
✅ Slide added!
✅ Course updated!
✅ Result deleted!
✅ Media uploaded!
```

---

## Tips & Best Practices

### 1. Before Adding Content

- Have all text ready (copy-paste from document)
- Have images prepared (correct size, format)
- Have URLs ready (for downloads)

### 2. Image Best Practices

**Slides:**
- Recommended: 1600x900 px
- Format: JPG or WebP
- Compressed: <2MB

**Results Photos:**
- Recommended: 256x256 px
- Format: JPG or PNG
- Portrait orientation

**Gallery:**
- Recommended: 1600x1200 px
- Format: JPG or WebP
- Compressed: <3MB

### 3. Text Best Practices

- Keep headlines short (< 60 characters)
- Use clear, simple language
- Proofread before saving
- Test display on mobile

### 4. Ordering

- Use display_order field to arrange items
- Lower numbers appear first
- Manually reorder by editing order values

---

## Common Tasks

### Task 1: Add New Course

```
1. Click Courses tab
2. Click "Add Course"
3. Edit fields:
   - Title: Course Name
   - Badge: Popular/Core/Trending
   - Duration: Time period
   - Description: Full details
4. Click Done
5. ✅ Course added to website
```

### Task 2: Upload Student Photo

```
1. Click Results tab
2. Find student result
3. Click Edit
4. Click "Photo Upload"
5. Select JPG from computer
6. Wait for upload
7. Click Done
8. ✅ Photo appears on website
```

### Task 3: Update Branch Info

```
1. Click Branches tab
2. Find branch
3. Click Edit
4. Change phone/address
5. Click Done
6. ✅ Updated live on website
```

### Task 4: Add Download Resource

```
1. Click Downloads tab
2. Click "Add Download"
3. Title: JEE Physics Notes
4. Type: PDF
5. URL: Paste Google Drive link
6. Click Done
7. ✅ Download available on site
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Ctrl+F (browser) |
| Submit Form | Enter |
| Cancel Edit | Escape |
| Logout | Click Logout button |

---

## Storage Information

### Where Files Are Stored

- **Media Bucket:** `media/`
- **Slides:** `media/slides/{id}/`
- **Results:** `media/results/{id}/`
- **Gallery:** `media/gallery/{id}/`

### File Access

- All files: Public (visible to everyone)
- Direct URLs: Returned after upload
- CDN: Automatic (fast delivery)

---

## Troubleshooting

### "Upload Failed"

**Causes:**
- File too large
- Network error
- Wrong file type

**Solutions:**
- Compress image first
- Check internet connection
- Use supported file type

### "Can't Delete Item"

**Check:**
- Confirm deletion popup
- Item might be referenced elsewhere
- Try again - might be network issue

### "Edit Not Saving"

**Check:**
- Click "Done" button (required)
- Item appears in list = saved
- Check status message

### "Images Not Showing"

**Check:**
- URL is correct
- Image file exists
- File is public (not private)
- Refresh browser cache

---

## Security

### Admin Password

- Current: `Biyanis@123`
- Change by editing `AdminPanel.supabase.jsx` line 69

### Database Security

- Only admins can edit (RLS policies)
- Public can view all content
- File uploads go to public bucket

### Best Practices

- Don't share admin password
- Logout when done
- Use strong password if changing it

---

## Deployment

### Before Going Live

- [ ] Test all CRUD operations
- [ ] Test file uploads
- [ ] Verify all content displays
- [ ] Check on mobile device
- [ ] Test in production environment

### After Deployment

- [ ] Verify admin login works
- [ ] Test adding/editing content
- [ ] Verify uploads still work
- [ ] Check website displays updates

---

## FAQs

**Q: Can multiple admins access at once?**
A: Yes, but changes will override each other. Wait for one to finish before the other edits.

**Q: What happens if I close without clicking Done?**
A: Changes are not saved. Edit state is discarded.

**Q: Can I bulk upload multiple files?**
A: No, one at a time. Drag & drop coming soon.

**Q: Are deleted items recoverable?**
A: No, soft delete not implemented. Be careful with delete!

**Q: Can I add custom fields?**
A: Yes, but requires database schema changes. Contact developer.

---

*Last Updated: April 19, 2026*
*Status: Fully Functional ✅*
