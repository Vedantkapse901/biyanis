# 🔍 VERIFY SUPABASE LOGIN - TROUBLESHOOTING GUIDE

## Problem: Login Not Using Supabase Database

If you're seeing "Invalid username or password" even with correct credentials, the **admin_users table probably doesn't exist**.

---

## ✅ Step 1: Check Browser Console

1. Open admin login page: `http://localhost:5173/#/admin`
2. Open browser console: **F12** or **Right-click → Inspect → Console**
3. Try to login
4. Look for messages:

### ✅ Success Message:
```
🔐 Attempting admin login...
Username: admin
✅ Admin found: admin
✅ Login successful for: admin
```

### ❌ Error Message (Table Missing):
```
🔐 Attempting admin login...
Username: admin
❌ Auth error: relation "public.admin_users" does not exist
❌ Admin users table not found. Please run: database/admin_schema.sql in Supabase SQL Editor
```

### ❌ Wrong Credentials:
```
🔐 Attempting admin login...
Username: admin
❌ No admin user found with these credentials
```

---

## ✅ Step 2: Create Admin Users Table

### If you see "table not found" error:

**1. Go to Supabase:**
```
https://app.supabase.com
```

**2. Select Your Project**

**3. Click SQL Editor (left sidebar)**

**4. Click "New Query"**

**5. Copy & Paste this SQL:**

```sql
-- Create admin_users table
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

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
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

-- Insert default admin user with your UID
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_uid ON admin_users(uid);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
```

**6. Click "Run" button (or Cmd+Enter)**

**7. Wait for ✅ Success message**

---

## ✅ Step 3: Verify Table Created

**1. In Supabase, click "Tables" (left sidebar)**

**2. Look for `admin_users` table**

**3. Click to expand it**

**4. Should see one row:**
```
id: (UUID)
uid: 4f4e926a-96a2-4119-9fdd-2f425695e2de ✅
username: admin ✅
password: Biyanis@123 ✅
full_name: Admin User ✅
role: admin ✅
is_active: true (checked) ✅
```

If you see all these, the table is created correctly! ✅

---

## ✅ Step 4: Test Login

1. **Refresh browser** (important!)
   ```
   http://localhost:5173/#/admin
   ```

2. **Try login:**
   ```
   Username: admin
   Password: Biyanis@123
   ```

3. **Check console (F12)** for debug messages:
   ```
   🔐 Attempting admin login...
   Username: admin
   ✅ Admin found: admin
   ✅ Login successful for: admin
   ```

4. **If successful**, header should show:
   ```
   Logged in as Admin User (ID: 4f4e926a) • Manage your website content
   ```

✅ Login working! Database authentication confirmed!

---

## ❌ Troubleshooting: Still Not Working?

### Issue: "Invalid username or password" error

**Check 1: Is table really created?**
- Go to Supabase → Tables
- Search for `admin_users`
- Should appear in list

**Check 2: Does row exist?**
- Click `admin_users` table
- Should show 1 row
- Check username = `admin`
- Check is_active = true (checked)

**Check 3: Check browser console**
- Press F12
- Look for error messages
- Share error with developer

### Issue: Table exists but login still fails

**Check these in order:**

1. **Username spelling?**
   - Is it exactly: `admin` (lowercase)
   - No extra spaces?

2. **Password spelling?**
   - Is it exactly: `Biyanis@123`
   - Capital B?
   - Capital S?
   - @123?

3. **is_active field?**
   - Go to Supabase → admin_users
   - Check if is_active is TRUE (checked)
   - If FALSE, update it to TRUE

4. **Console error message?**
   - Open F12 console
   - Try login
   - Read error carefully
   - Does it say "table not found"?

### Issue: "Admin users table not found"

This means the SQL didn't run successfully.

**Fix:**
1. Go back to Supabase SQL Editor
2. Run the SQL again
3. Check for error messages at top
4. Wait for completion
5. Refresh page and verify

---

## 🧪 Manual Testing (Advanced)

### Test in Supabase Console:

1. **Go to SQL Editor**

2. **Run this query:**
```sql
SELECT * FROM admin_users;
```

3. **Should see:**
```
1 row returned
- uid: 4f4e926a-96a2-4119-9fdd-2f425695e2de
- username: admin
- password: Biyanis@123
- is_active: true
```

4. **Test login query:**
```sql
SELECT * FROM admin_users 
WHERE username = 'admin' 
AND password = 'Biyanis@123' 
AND is_active = true;
```

5. **Should return 1 row**

If you get 1 row, the data is correct! ✅

---

## 📊 Database Checklist

- [ ] Admin_users table exists in Supabase
- [ ] Table has columns: id, uid, username, password, full_name, role, is_active
- [ ] Default row exists with UID: 4f4e926a-96a2-4119-9fdd-2f425695e2de
- [ ] Username: admin (lowercase)
- [ ] Password: Biyanis@123 (exact case)
- [ ] is_active: true (checked)
- [ ] RLS policies created
- [ ] Indexes created

---

## 🔄 Code Checklist

- [ ] AdminPanel imports useAdminAuth hook ✅
- [ ] AdminPanel calls validateAdmin(username, password) ✅
- [ ] useAdminAuth hook added to useSupabaseData.js ✅
- [ ] Console logging shows debug messages ✅
- [ ] handleLogin saves to sessionStorage ✅

---

## ✅ What Should Happen

### Before Clicking Login:
```
1. User sees login form
2. Fields: Username, Password
3. Button: Login
```

### When Clicking Login:
```
1. Console shows: "🔐 Attempting admin login..."
2. Query sent to Supabase admin_users table
3. Database searches for matching row
```

### If Credentials Match:
```
1. Console shows: "✅ Admin found: admin"
2. last_login updated in database
3. User info saved to sessionStorage
4. Admin panel loads
5. Header shows: "Logged in as Admin User"
```

### If Credentials Don't Match:
```
1. Console shows: "❌ No admin user found"
2. Error message: "Invalid username or password"
3. Login form reappears
4. User can retry
```

---

## 🎯 Expected Console Output (Success)

```
🔐 Attempting admin login...
Username: admin
✅ Admin found: admin
✅ Login successful for: admin
```

---

## 📞 If Still Not Working

**Collect this info:**

1. Screenshot of console error (F12)
2. Screenshot of Supabase admin_users table
3. SQL run successfully?
4. Username/password exact?
5. is_active = true?

Then contact developer with these details!

---

## Summary

✅ **If table exists** → Supabase login works
❌ **If table missing** → Run SQL from admin_schema.sql
✅ **If login works** → Header shows user info
❌ **If login fails** → Check console for exact error

**Current Status:**
- Database authentication code: ✅ Ready
- Admin users table: ⏳ Need to verify
- Default admin user: ⏳ Depends on table

---

*Last Updated: April 20, 2026*
*Status: Setup Guide Complete*
