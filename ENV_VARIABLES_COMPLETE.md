# Complete Environment Variables Guide

## ⚠️ IMPORTANT: Variable Names Matter

**Frontend (Vite) variables must start with `VITE_`**

---

## For Development (.env.local)

Create `.env.local` in your project root:

```env
# SUPABASE - Required for frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GEMINI API - Optional (for old chatbot only)
VITE_GEMINI_API_KEY=AIzaSyD...
```

---

## For Production (Vercel/Netlify/etc)

Set these exact variable names:

### **Frontend Variables** (Vite)
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your anon key
- `VITE_GEMINI_API_KEY` = (Optional)

### **Backend Variables** (Node.js)
- `SUPABASE_SERVICE_ROLE_KEY` = Service role key (if using backend server)
- `SUPABASE_URL` = Supabase URL (if using backend server)

⚠️ **Note:** You only need the backend variables if you build a Node.js/Express backend server. For your current setup (frontend only), you only need the `VITE_` prefixed variables.

---

## Where to Get Each Value

### VITE_SUPABASE_URL

1. Go to **Supabase Dashboard**
2. Click **Settings** (gear icon, bottom left)
3. Click **API** tab
4. Copy **Project URL**
5. Example: `https://btqjkfqvwxyzabcd.supabase.co`

```env
VITE_SUPABASE_URL=https://btqjkfqvwxyzabcd.supabase.co
```

---

### VITE_SUPABASE_ANON_KEY

1. Same page (**Settings → API**)
2. Find **API Keys** section
3. Look for row labeled **anon public**
4. Click copy icon (📋)
5. Long string starting with `eyJ...`

```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMzU2NzAwMCwiZXhwIjoxODAxMDAwMDAwLCJpc3MiOiJzdXBhYmFzZSIsInN1YiI6InVzZXJzLXR5cGUifQ.xxxxxxxxxxxxxxxxxxxxx
```

---

### SUPABASE_SERVICE_ROLE_KEY (Optional - Backend only)

Same page (**Settings → API**):
- Find row labeled **service_role secret**
- Copy the key
- ⚠️ **KEEP SECRET - Never expose in frontend**
- Only needed if building a backend server

```env
# Backend only - not needed for frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### VITE_GEMINI_API_KEY (Optional - Old chatbot only)

Only needed if using the Gemini AI chatbot (not backend FAQ chatbot):

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key

```env
VITE_GEMINI_API_KEY=AIzaSyD1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m
```

---

## Complete .env.local Template

```env
# ============================================
# SUPABASE - REQUIRED
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# GEMINI API - OPTIONAL (old chatbot only)
# ============================================
VITE_GEMINI_API_KEY=AIzaSyD...

# ============================================
# DO NOT ADD THESE FOR FRONTEND ONLY
# ============================================
# These are BACKEND ONLY variables - not needed for React frontend
# SUPABASE_SERVICE_ROLE_KEY=...
# SUPABASE_URL=...
```

---

## For Vercel Deployment

### Step 1: Go to Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Variables

Add these variables:

| Name | Value | Scope |
|------|-------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | Your Gemini key (optional) | Production, Preview, Development |

### Step 3: Save & Redeploy

1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on latest deployment
4. Wait for build to complete

---

## For Netlify Deployment

### Step 1: Go to Site Settings

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click your site
3. Click **Site settings** tab
4. Click **Build & deploy** → **Environment**

### Step 2: Add Variables

Click **Edit variables** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyD... (optional)
```

### Step 3: Trigger Deploy

1. Go to **Deployments** tab
2. Click **Trigger deploy**
3. Select **Deploy site**

---

## Verify Variables Are Set

### Local Development

```bash
# .env.local should have
cat .env.local
# Output:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

### Production (Vercel/Netlify)

After deploying, check in:
- **Vercel:** Settings → Environment Variables
- **Netlify:** Site settings → Build & deploy → Environment

---

## Common Mistakes

### ❌ WRONG
```env
# Missing VITE_ prefix
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

### ✅ CORRECT
```env
# Must have VITE_ prefix for Vite/React frontend
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### ❌ WRONG
```env
# Service role key exposed in frontend
SUPABASE_SERVICE_ROLE_KEY=... (in .env.local)
```

### ✅ CORRECT
```env
# Service role key only in backend server
# Don't include in frontend .env.local at all
```

---

## Troubleshooting

### "Supabase credentials missing" warning

**Check:**
1. `.env.local` file exists
2. Variable names have `VITE_` prefix
3. Values are correct (copy full string)
4. Restart dev server: `npm run dev`

### Production not connecting

**Check:**
1. Environment variables set in Vercel/Netlify
2. Names match exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Site redeployed after adding variables
4. Check browser DevTools → Network → check for failed requests

### Variables not showing in build

**Solutions:**
1. Vite only exposes `VITE_*` prefixed variables
2. Other variables must use `import.meta.env.VITE_*`
3. Restart dev server after changing .env.local
4. Build must complete successfully

---

## Summary

### For Frontend (React/Vite)
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=... (optional)
```

### For Backend (Node.js) - Only if building API server
```env
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=...
```

### For Your Current Setup
**Just use the frontend variables above.**

---

## Quick Checklist

- [ ] Created `.env.local` in project root
- [ ] Added `VITE_SUPABASE_URL`
- [ ] Added `VITE_SUPABASE_ANON_KEY`
- [ ] Restarted `npm run dev`
- [ ] Check console for success message
- [ ] For production, added to Vercel/Netlify settings
- [ ] Redeployed after adding environment variables

---

*Last Updated: April 19, 2026*
