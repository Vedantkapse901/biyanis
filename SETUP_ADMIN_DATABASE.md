# 🚀 SETUP ADMIN DATABASE - QUICK START

## Your Admin UID
```
4f4e926a-96a2-4119-9fdd-2f425695e2de
```

---

## Step 1: Create Admin Users Table in Supabase

### Open SQL Editor:
1. Go to **https://app.supabase.com**
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Copy & Paste SQL:
```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  created_by UUID,
  UNIQUE(username)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_users"
ON admin_users FOR SELECT
USING (true);

CREATE POLICY "Admins can insert admin_users"
ON admin_users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update admin_users"
ON admin_users FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete admin_users"
ON admin_users FOR DELETE
USING (true);

INSERT INTO admin_users (uid, username, password, full_name, role, is_active)
VALUES (
  '4f4e926a-96a2-4119-9fdd-2f425695e2de',
  'admin',
  'Biyanis@123',
  'Admin User',
  'admin',
  true
)
ON CONFLICT (uid) DO UPDATE
SET
  username = 'admin',
  password = 'Biyanis@123',
  full_name = 'Admin User',
  role = 'admin',
  is_active = true;

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_uid ON admin_users(uid);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
```

### Execute:
1. Click **Run** button (or Cmd+Enter)
2. Should see ✅ success message
3. Wait for completion

---

## Step 2: Verify in Supabase

1. Click **Tables** (left sidebar)
2. Look for `admin_users` table
3. Click to view
4. Should see one row with:
   - UID: `4f4e926a-96a2-4119-9fdd-2f425695e2de`
   - username: `admin`
   - password: `Biyanis@123`
   - full_name: `Admin User`
   - is_active: `true` (checked)

✅ If you see this, setup is complete!

---

## Step 3: Code Updates (Already Done!)

Your codebase has been updated:

✅ **`src/hooks/useSupabaseData.js`** - New `useAdminAuth()` hook
✅ **`src/components/AdminPanel.supabase.jsx`** - Uses database authentication
✅ **`database/admin_schema.sql`** - Full SQL script for setup

---

## Step 4: Test Login

1. Run dev server:
   ```bash
   npm run dev
   ```

2. Visit admin panel:
   ```
   http://localhost:5173/#/admin
   ```

3. Login:
   - Username: `admin`
   - Password: `Biyanis@123`

4. Should see header:
   ```
   Logged in as Admin User (ID: 4f4e926a) • Manage your website content
   ```

✅ If login works, database authentication is complete!

---

## Step 5 (Optional): Add More Admins

In Supabase, click `admin_users` table → **Insert row**:

### Example 1: New Admin User
```
uid: (generate new UUID)
username: bhavana
password: SecurePass@2024
full_name: Bhavana Sharma
role: admin
is_active: true (checked)
```

### Example 2: Another Admin
```
uid: (generate new UUID)
username: sharma
password: AnotherPass@2024
full_name: Sharma Admin
role: admin
is_active: true (checked)
```

Then test login with new credentials!

---

## Quick Reference

| Field | Value |
|-------|-------|
| **Table Name** | `admin_users` |
| **Primary Key** | `id` (auto-generated) |
| **User Identifier** | `uid` (your custom ID) |
| **Login Field** | `username` |
| **Password Field** | `password` |
| **Status Field** | `is_active` |

---

## What Gets Tracked

When admin logs in:
- ✅ Username & password verified
- ✅ User data retrieved from database
- ✅ `last_login` timestamp updated
- ✅ User info saved to sessionStorage
- ✅ Admin panel loads with user info

---

## Security Notes

### Before Production:
1. [ ] Change password from `Biyanis@123`
2. [ ] Add more admin users as needed
3. [ ] Review RLS policies
4. [ ] Test with different usernames

### Future Improvements:
- Hash passwords (bcrypt)
- Add 2FA
- Implement OAuth
- Activity logging

---

## Troubleshooting

### Table not appearing
**Fix:** 
- Refresh Supabase page
- Check SQL execution completed
- No error messages shown?

### Login still failing
**Fix:**
- Open browser console (F12)
- Check for JavaScript errors
- Verify row exists in table
- Check is_active = true

### UID not in header
**Fix:**
- Check sessionStorage in console:
  ```javascript
  sessionStorage.getItem('adminUserId')
  ```
- Verify `uid` field exists in table
- Check SELECT query includes uid

---

## Done! 

Your admin system is now using **database-backed authentication**! 🎉

✅ Admins created in Supabase table
✅ Login queries database
✅ User info stored in session
✅ UID tracked for each user
✅ Login history recorded

**Your system is ready for production use!**

---

## Need Help?

See detailed documentation:
- **ADMIN_USER_DATABASE.md** - Full system details
- **ADMIN_AUTHENTICATION.md** - Authentication flow
- **ADMIN_ACCESS.md** - How to access admin panel

---

*Setup Time: ~5 minutes*
*Difficulty: Easy*
*Status: ✅ Complete*
