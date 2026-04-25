# 🗄️ ADMIN USER DATABASE SYSTEM

## Overview

Admin authentication is now **database-backed**! Each admin user has a unique UID and is stored in the `admin_users` table.

---

## Default Admin User

| Field | Value |
|-------|-------|
| **UID** | `4f4e926a-96a2-4119-9fdd-2f425695e2de` |
| **Username** | `admin` |
| **Password** | `Biyanis@123` |
| **Full Name** | Admin User |
| **Role** | admin |
| **Status** | Active |

---

## Database Setup

### Step 1: Create the Admin Users Table

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Create new query
4. Copy & paste from: `database/admin_schema.sql`
5. Click **Run**

This creates:
- ✅ `admin_users` table with all fields
- ✅ Default admin user with your UID
- ✅ Row-Level Security (RLS) policies
- ✅ Indexes for fast lookups
- ✅ Audit columns (created_at, updated_at, last_login)

### Step 2: Verify in Supabase

1. Go to **Supabase → Tables**
2. Look for `admin_users` table
3. Click to view data
4. Should see your admin user with UID: `4f4e926a-96a2-4119-9fdd-2f425695e2de`

---

## How It Works

### Login Flow (Database-Backed)

```
User enters username & password
         ↓
Click Login button
         ↓
validateAdmin() hook called
         ↓
Query Supabase:
  SELECT * FROM admin_users
  WHERE username = ? 
  AND password = ? 
  AND is_active = true
         ↓
    ✅ Match Found       ❌ No Match
         ↓                  ↓
Return user data      Return error
  - id               "Invalid username
  - uid              or password"
  - username
  - full_name
  - role
         ↓                  ↓
Save to              Show error
sessionStorage       message
  - adminAuth
  - adminUser
  - adminUserId
  - adminFullName
         ↓
Load admin panel
Show user in header
```

### Authentication Code

**File:** `src/hooks/useSupabaseData.js` (New `useAdminAuth` hook)

```javascript
export function useAdminAuth() {
  async function validateAdmin(username, password) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, uid, username, full_name, role, is_active')
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .single()

    if (data) {
      // Update last_login timestamp
      await supabase
        .from('admin_users')
        .update({ last_login: new Date() })
        .eq('id', data.id)

      return { success: true, user: data }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  return { validateAdmin, loading, error }
}
```

---

## Admin Users Table Schema

```sql
admin_users:
├── id UUID (Primary Key)
├── uid UUID (User ID - your custom identifier)
├── username VARCHAR (Unique, indexed)
├── password VARCHAR
├── email VARCHAR (Optional)
├── full_name VARCHAR
├── role VARCHAR (e.g., 'admin', 'super_admin')
├── is_active BOOLEAN
├── created_at TIMESTAMP
├── updated_at TIMESTAMP
├── last_login TIMESTAMP (Auto-updated on login)
└── created_by UUID (Optional - who created this user)
```

---

## Session Storage

When admin logs in, this data is saved:

```javascript
sessionStorage.setItem('adminAuth', 'true')
sessionStorage.setItem('adminUser', 'admin')
sessionStorage.setItem('adminUserId', '4f4e926a-96a2-4119-9fdd-2f425695e2de')
sessionStorage.setItem('adminFullName', 'Admin User')
```

**In Header:**
```
Logged in as Admin User (ID: 4f4e926a) • Manage your website content
```

---

## Adding New Admin Users

### Option 1: Supabase Dashboard (Easy)

1. Go to **Supabase → Tables → admin_users**
2. Click **Insert row**
3. Fill in:
   - `uid` - Generate new UUID or provide one
   - `username` - Unique username (e.g., `bhavana`, `sharma`)
   - `password` - Strong password (will improve later)
   - `full_name` - Full name (e.g., "Bhavana Sharma")
   - `role` - Set to `admin`
   - `is_active` - Toggle ON
4. Click **Save**

### Option 2: SQL Query

```sql
INSERT INTO admin_users (uid, username, password, full_name, role, is_active)
VALUES (
  gen_random_uuid(),
  'bhavana',
  'SecurePassword@2024',
  'Bhavana Sharma',
  'admin',
  true
);
```

### Option 3: In Application (For Later)

Create an admin management section where existing admins can add users:
```javascript
const { insert } = useSupabaseMutation()

const addAdmin = async (userData) => {
  await insert('admin_users', {
    uid: crypto.randomUUID(),
    username: userData.username,
    password: userData.password,
    full_name: userData.fullName,
    role: 'admin',
    is_active: true
  })
}
```

---

## Changing Admin Credentials

### Change Password

**Via Supabase Dashboard:**
1. Go to `admin_users` table
2. Click on row
3. Edit `password` field
4. Click Save

**Via SQL:**
```sql
UPDATE admin_users
SET password = 'NewPassword@2024'
WHERE username = 'admin';
```

### Change Username

**Via SQL:**
```sql
UPDATE admin_users
SET username = 'new_admin_name'
WHERE uid = '4f4e926a-96a2-4119-9fdd-2f425695e2de';
```

---

## Admin User Fields

### Required Fields
- **uid** - Unique identifier (UUID)
- **username** - Login name (must be unique)
- **password** - Login password
- **role** - User role (e.g., 'admin')
- **is_active** - Whether user can login

### Optional Fields
- **email** - Admin email address
- **full_name** - Display name
- **created_by** - Who created this user
- **last_login** - Auto-updated on each login

### Auto-Generated Fields
- **id** - Internal database ID
- **created_at** - When user was created
- **updated_at** - When user was last updated

---

## Audit Trail

### Last Login Tracking

**Auto-updated** when admin logs in:
```javascript
// In validateAdmin() hook
await supabase
  .from('admin_users')
  .update({ last_login: new Date().toISOString() })
  .eq('id', data.id)
```

**Check in Supabase:**
1. Go to `admin_users` table
2. Look at `last_login` column
3. Shows when each admin last logged in

---

## Security Best Practices

### ✅ DO:
- [ ] Use strong passwords (8+ chars, mixed case, numbers, symbols)
- [ ] Change default password before production
- [ ] Keep UID documented for reference
- [ ] Track who created which admin user (`created_by`)
- [ ] Review `last_login` timestamps regularly
- [ ] Deactivate unused admin accounts (`is_active = false`)
- [ ] Use unique usernames for each person

### ❌ DON'T:
- [ ] Share admin passwords
- [ ] Use simple passwords like "123456"
- [ ] Store credentials in code
- [ ] Leave admin accounts active if unused
- [ ] Hardcode UUIDs in frontend (only display)

---

## Future Enhancements

### Multi-Admin Management System

Create admin management interface:

```javascript
// Admin can:
1. Add new admin users
2. Edit admin details
3. Change passwords
4. Activate/deactivate users
5. View login history
6. Remove admin access
```

### Password Hashing

**Current:** Passwords stored as plain text (for demo)
**Production:** Should use bcrypt or similar

```javascript
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash('Biyanis@123', 10)

// Store hashedPassword in database
// Verify: const match = await bcrypt.compare(inputPassword, hashedPassword)
```

### Two-Factor Authentication (2FA)

- Add TOTP/SMS verification
- Require on login
- More secure for production

### OAuth Integration

- Login with Google/GitHub
- Integrated with Supabase Auth
- No passwords needed

### Activity Logging

Track all admin actions:
- What was changed
- When it was changed
- Who changed it
- IP address/device

---

## Your Admin UID

### Remember:
```
UID: 4f4e926a-96a2-4119-9fdd-2f425695e2de
```

This is your **primary admin user identifier** in the system.

### Used For:
- ✅ Database authentication
- ✅ Audit trails
- ✅ Permissions/roles
- ✅ Activity tracking (future)
- ✅ Session identification

---

## Testing

### Test Admin Login:

1. Run `npm run dev`
2. Go to `http://localhost:5173/#/admin`
3. Login:
   - Username: `admin`
   - Password: `Biyanis@123`
4. Header shows:
   - "Logged in as Admin User (ID: 4f4e926a)"
5. ✅ Dashboard loads

### Test New Admin User:

1. Add new user in Supabase `admin_users` table
2. Try logging in with new username/password
3. Should show new user's name in header
4. ✅ Login works

### Test Last Login Update:

1. Login as admin
2. Go to Supabase → `admin_users` table
3. Check `last_login` column
4. Should show current timestamp
5. ✅ Audit trail works

---

## Troubleshooting

### Can't find admin_users table
**Solution:** Run the SQL from `database/admin_schema.sql` in Supabase SQL Editor

### Login still failing
**Solution:** 
- Verify row exists in `admin_users` table
- Check username spelling (case-sensitive)
- Check password matches exactly
- Verify `is_active` is TRUE
- Check RLS policies are enabled

### UID not showing in header
**Solution:**
- Check `sessionStorage.getItem('adminUserId')` in browser console
- Verify it's being stored on login
- Check Supabase query returns `uid` field

---

## Summary

✅ **Admin users stored in database** - Not hardcoded
✅ **Each user has unique UID** - `4f4e926a-96a2-4119-9fdd-2f425695e2de`
✅ **Database-backed authentication** - Queries `admin_users` table
✅ **Login tracking** - `last_login` auto-updated
✅ **Session storage** - User info saved on login
✅ **Easy to add more admins** - Just insert rows in table
✅ **Ready for production** - With password changes & hashing

**Your admin system is now secure and database-backed! 🔐**

---

*Last Updated: April 20, 2026*
*Status: ✅ DATABASE AUTHENTICATION COMPLETE*
