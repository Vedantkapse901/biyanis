# 🔐 SUPABASE AUTH WITH CUSTOM UID

## Your UID: `4f4e926a-96a2-4119-9fdd-2f425695e2de`

Your admin login now uses **Supabase Auth** linked to your **custom UID system**!

---

## How It Works

```
┌─────────────────────────────────────────────────┐
│     Supabase Auth (Email + Password)            │
│     ↓ Verifies login credentials                │
├─────────────────────────────────────────────────┤
│     Auth User (System-generated ID)             │
│     ↓ Links to                                  │
├─────────────────────────────────────────────────┤
│     Profiles Table (Your Custom UID)            │
│     └─ uid: 4f4e926a-96a2-4119-9fdd-...       │
│     └─ email: admin@biyanis.com                 │
│     └─ role: admin                              │
└─────────────────────────────────────────────────┘
```

---

## Setup (15 minutes)

### Step 1️⃣: Create Profiles Table (5 min)

1. Go to **Supabase → SQL Editor**
2. Click **New Query**
3. Copy & paste from: `database/profiles_schema.sql`
4. Click **Run**

This creates:
- ✅ `profiles` table
- ✅ Links Supabase Auth users to custom UIDs
- ✅ Auto-triggers to create profile on signup
- ✅ RLS policies for security

---

### Step 2️⃣: Create Admin User in Supabase Auth (5 min)

1. Go to **Supabase → Authentication → Users**
2. Click **"Invite user"** or **"Create a new user"**
3. Enter:
   ```
   Email: admin@biyanis.com
   Password: SecureAdmin@2024
   ```
4. Click **Create user**

**Status should show:** ✅ Confirmed

---

### Step 3️⃣: Verify Profile Created (3 min)

1. Go to **Supabase → Tables**
2. Click **profiles** table
3. Should see one row:
   ```
   id: (Auth user ID)
   uid: 4f4e926a-96a2-4119-9fdd-2f425695e2de ✅
   email: admin@biyanis.com ✅
   role: admin ✅
   is_active: true ✅
   ```

If you see this, setup is complete! ✅

---

### Step 4️⃣: Test Login (2 min)

1. Open: `http://localhost:5173/#/admin`
2. Login:
   ```
   Email: admin@biyanis.com
   Password: SecureAdmin@2024
   ```
3. Header should show:
   ```
   Logged in as admin@biyanis.com • UID: 4f4e926a... • Supabase Auth
   ```

✅ **SUCCESS! Your UID is linked to your Supabase Auth account!**

---

## Console Output (Success)

When you login, you should see:

```
🔐 Attempting Supabase Auth login...
Email: admin@biyanis.com
✅ Supabase Auth successful for: admin@biyanis.com
✅ Session token: eyJhbGc...
✅ User UID: 4f4e926a-96a2-4119-9fdd-2f425695e2de
```

---

## Your UID System

### What Your UID Is Used For:

✅ **Unique identification** - In profiles table
✅ **Tracking** - Know which user did what
✅ **Future features** - Audit logs, permissions
✅ **Integration** - Link to other systems

### Where It's Stored:

```
Supabase Database
└─ profiles table
   └─ uid: 4f4e926a-96a2-4119-9fdd-2f425695e2de
```

### How It's Displayed:

```
Admin Panel Header:
"Logged in as admin@biyanis.com • UID: 4f4e926a... • Supabase Auth"
```

---

## Adding More Admins

### Create New Admin:

1. **Supabase Auth** - Create new user with email
2. **Profiles Auto-creates** - With new UID (auto-generated)
3. **They Can Login** - With their email & password

### Example:

```
Auth User:
├─ Email: bhavana@biyanis.com
│  Password: BhavanasPass@2024

Profile (Auto-created):
├─ uid: (new UUID auto-generated)
├─ email: bhavana@biyanis.com
├─ role: admin
└─ is_active: true
```

---

## Your Auth System Now Has:

| Component | Status | Details |
|-----------|--------|---------|
| Supabase Auth | ✅ Active | Email/password authentication |
| Profiles Table | ✅ Linked | Custom UID system |
| Your UID | ✅ Stored | 4f4e926a-96a2-4119-9fdd-2f425695e2de |
| Multiple Admins | ✅ Supported | Each gets own UID |
| Session Tokens | ✅ Secure | Encrypted authentication |

---

## Database Schema

```sql
-- Auth User (Supabase managed)
auth.users
├─ id: (UUID - Supabase generated)
├─ email: admin@biyanis.com
└─ password_hash: (encrypted)

-- Your Custom Profile
profiles
├─ id: (matches auth.users.id)
├─ uid: 4f4e926a-96a2-4119-9fdd-2f425695e2de (your custom ID)
├─ email: admin@biyanis.com
├─ full_name: Admin User
├─ role: admin
└─ is_active: true
```

---

## Security Flow

```
1. User enters email & password
   ↓
2. Supabase Auth verifies credentials
   ↓
3. Returns auth session
   ↓
4. Code fetches profile (includes your UID)
   ↓
5. Admin panel loads with UID displayed
   ↓
6. Session token stored for future requests
```

---

## Features

✅ **Supabase Auth** - Professional authentication
✅ **Custom UID** - Your tracking system
✅ **Session Tokens** - Secure sessions
✅ **Auto-profiles** - Triggers create profile on signup
✅ **Email Sync** - Email auto-updates in profile
✅ **Multiple Admins** - Unlimited users
✅ **RLS Policies** - Database-level security

---

## Troubleshooting

### Profile Not Created

**Check:**
1. Did you run `profiles_schema.sql`?
2. Is user confirmed in Supabase Auth?
3. Refresh Supabase → Tables → profiles

**Fix:**
1. Run profiles SQL script again
2. Create new user in Auth
3. Check if profile row appears

### UID Not Showing in Header

**Check Console (F12):**
```
✅ User UID: 4f4e926a-96a2-4119-9fdd-2f425695e2de
```

If missing:
1. Check profile exists in Supabase
2. Check uid field has value
3. Refresh browser

### Login Not Working

**Check:**
1. User exists in Supabase Auth Users?
2. User status = Confirmed?
3. Email/password correct?
4. profiles table created?

---

## Summary

✅ **Supabase Auth Setup** - Email/password login
✅ **Profiles Table** - Links to your custom UID
✅ **Your UID Linked** - 4f4e926a-96a2-4119-9fdd-2f425695e2de
✅ **Multiple Admins** - Each gets own credentials
✅ **Session Tracking** - Knows who logged in
✅ **Production Ready** - Enterprise security

**Your custom UID system is now integrated with Supabase Auth! 🎉**

---

## Files Updated

```
src/
├─ hooks/useSupabaseData.js      ✅ Fetches profile with UID
└─ components/AdminPanel.supabase.jsx ✅ Shows UID in header

database/
└─ profiles_schema.sql           ✅ New - Links Auth to UID
```

---

*Setup Time: ~15 minutes*
*Status: ✅ Ready*
*UID: 4f4e926a-96a2-4119-9fdd-2f425695e2de*
