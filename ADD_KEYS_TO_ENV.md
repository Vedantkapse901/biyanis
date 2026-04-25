# How to Add Your Keys to .env.local

## File Location
```
biyanis-main/
├── .env.local          ← File created for you ✅
├── package.json
├── src/
└── ...
```

---

## 3 Keys to Add

### 1️⃣ VITE_SUPABASE_URL

**Where to get it:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **Settings** (gear icon, bottom left)
3. Click **API** tab
4. Copy **Project URL** (looks like: `https://abc123xyz.supabase.co`)

**Paste in .env.local:**
```env
VITE_SUPABASE_URL=https://your-copied-url-here
```

**Example:**
```env
VITE_SUPABASE_URL=https://btqjkfqvwxyzabcd.supabase.co
```

---

### 2️⃣ VITE_SUPABASE_ANON_KEY

**Where to get it:**
1. Same page (**Supabase Dashboard → Settings → API**)
2. Find **API Keys** section
3. Look for **anon public** row
4. Click copy icon (📋)
5. Long string starting with `eyJ...`

**Paste in .env.local:**
```env
VITE_SUPABASE_ANON_KEY=your-copied-key-here
```

**Example:**
```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMzU2NzAwMCwiZXhwIjoxODAxMDAwMDAwLCJpc3MiOiJzdXBhYmFzZSIsInN1YiI6InVzZXJzLXR5cGUifQ.xxxxx
```

---

### 3️⃣ VITE_GEMINI_API_KEY (Optional)

**Only needed if using old Gemini chatbot - NOT needed for backend FAQ chatbot**

**Where to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key

**Paste in .env.local:**
```env
VITE_GEMINI_API_KEY=your-copied-key-here
```

**Example:**
```env
VITE_GEMINI_API_KEY=AIzaSyD1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m
```

---

## Complete .env.local After Adding Keys

Your file should look like:

```env
# Biyanis EdTech - Environment Variables
# Last Updated: April 19, 2026

# ============================================
# SUPABASE CONFIGURATION (REQUIRED)
# ============================================
VITE_SUPABASE_URL=https://btqjkfqvwxyzabcd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMzU2NzAwMCwiZXhwIjoxODAxMDAwMDAwLCJpc3MiOiJzdXBhYmFzZSIsInN1YiI6InVzZXJzLXR5cGUifQ.xxxxx

# ============================================
# GOOGLE GEMINI API (OPTIONAL)
# ============================================
VITE_GEMINI_API_KEY=AIzaSyD1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m
```

---

## After Adding Keys

### Step 1: Save the file
```
File → Save (Ctrl+S or Cmd+S)
```

### Step 2: Restart dev server
```bash
# Stop the server
Ctrl+C

# Restart
npm run dev
```

### Step 3: Check console
Open browser → DevTools → Console

Should see:
```
✅ Data loaded from Supabase successfully
```

OR

```
Supabase initialized successfully
```

---

## ✅ Checklist

- [ ] Opened `.env.local` file
- [ ] Got VITE_SUPABASE_URL from Supabase
- [ ] Got VITE_SUPABASE_ANON_KEY from Supabase
- [ ] Pasted both values in `.env.local`
- [ ] Saved file
- [ ] Restarted dev server (`npm run dev`)
- [ ] Checked browser console for success message
- [ ] ✅ Ready to use!

---

## Troubleshooting

### Still seeing "Supabase credentials missing"

**Check:**
1. File is named `.env.local` (not `.env`)
2. It's in project root (same level as package.json)
3. Variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Values are pasted completely (full strings)
5. No extra spaces or quotes
6. Dev server restarted

### Keys are blank in file

1. Copy from Supabase again
2. Paste carefully (full string)
3. Verify nothing got cut off
4. Restart server

### Still not working?

Check that you have:
```env
VITE_SUPABASE_URL=https://...      ← Must start with https://
VITE_SUPABASE_ANON_KEY=eyJ...     ← Must start with eyJ
```

Both must have values (not blank).

---

## Security Reminders

✅ **DO:**
- Keep .env.local private
- Never commit to Git (it's in .gitignore)
- Never share these keys
- Rotate keys if compromised

❌ **DON'T:**
- Post keys in screenshots
- Share in emails/Slack
- Commit to GitHub
- Use in public code

---

## Quick Reference

| Variable | Source | Required |
|----------|--------|----------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Google AI Studio | ❌ No* |

*Only needed for old Gemini chatbot, not for backend FAQ chatbot

---

That's it! Your `.env.local` file is ready. Just add the keys and you're good to go! 🚀
