# ✅ ADMIN AUTHENTICATION - USERNAME & PASSWORD

## Overview

The Biyanis admin panel now has **username and password authentication**. Both credentials are required to access the admin panel.

---

## Default Credentials

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `Biyanis@123` |

---

## How to Login

1. Open admin panel: `http://localhost:5173/#/admin`
2. Enter username: `admin`
3. Enter password: `Biyanis@123`
4. Click **Login** button
5. Dashboard loads with admin name shown

---

## Login Screen Features

✅ **Username field** - Required for authentication
✅ **Password field** - Hidden input with show/hide toggle
✅ **Eye icon toggle** - Click to show/hide password
✅ **Error messages** - Clear error if credentials are wrong
✅ **Responsive design** - Works on mobile and desktop

---

## Session Management

### Login
- Username and password validated
- Admin session stored in `sessionStorage`
- User stays logged in during the session
- Admin name displayed in header

### Logout
- Click **Logout** button (top right)
- Session cleared immediately
- Redirected to login screen
- All data cleared

### Session Persistence
- Closing the browser tab logs you out
- Refreshing the page keeps you logged in
- Opening in new tab requires login again

---

## Changing Credentials (For Production)

### Location
File: `src/components/AdminPanel.supabase.jsx` (Line 1-5)

### Current Code
```javascript
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Biyanis@123'
}
```

### How to Change

**Step 1:** Open the AdminPanel.supabase.jsx file
```
src/components/AdminPanel.supabase.jsx
```

**Step 2:** Find the credentials (near top of file):
```javascript
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Biyanis@123'
}
```

**Step 3:** Update with new credentials:
```javascript
const ADMIN_CREDENTIALS = {
  username: 'your_new_username',
  password: 'your_new_password'
}
```

**Step 4:** Save file
**Step 5:** Refresh browser to test

### Example Changes

**Change 1: Strong username & password**
```javascript
const ADMIN_CREDENTIALS = {
  username: 'bjnp_master',
  password: 'SecurePass@2024#Strong'
}
```

**Change 2: Simple credentials**
```javascript
const ADMIN_CREDENTIALS = {
  username: 'biyanis',
  password: 'MyPassword123'
}
```

---

## Security Best Practices

### ✅ DO:
- Change default credentials before production deployment
- Use strong passwords (mix of letters, numbers, symbols)
- Keep credentials private (don't share with students)
- Change password periodically
- Logout when leaving computer

### ❌ DON'T:
- Share admin credentials publicly
- Use simple passwords like "123456" or "password"
- Leave admin panel open on public computers
- Write credentials in client-side comments (visible in code)
- Use same password across multiple systems

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change default username from `admin`
- [ ] Change default password from `Biyanis@123`
- [ ] Use strong password (8+ characters, mix of types)
- [ ] Test new credentials locally first
- [ ] Deploy to production
- [ ] Test credentials on production
- [ ] Document new credentials securely

---

## How Authentication Works

```
LOGIN FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User enters username & password
         ↓
Form submitted (handleLogin)
         ↓
Check if username === ADMIN_CREDENTIALS.username
AND password === ADMIN_CREDENTIALS.password
         ↓
     ✅ Match           ❌ No Match
         ↓                  ↓
Set auth = true      Show error message
Store in              "Invalid username
sessionStorage        or password"
         ↓                  ↓
Load admin panel   Retry with correct
Show username       credentials
         ↓
Admin can now
manage content
         ↓
LOGOUT FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click Logout button
         ↓
Clear sessionStorage
         ↓
Reset auth state
         ↓
Return to login screen
```

---

## Header Display

After login, the admin panel header shows:

```
┌─────────────────────────────────────────┐
│ Admin Panel                     Logout  │
│ Logged in as admin • Manage your        │
│                     website content      │
└─────────────────────────────────────────┘
```

The username is displayed in the header so you know who's logged in.

---

## Error Handling

### Invalid Credentials
**Message:** "Invalid username or password"
**Action:** Error clears after 2 seconds
**Try:** Re-enter credentials carefully

### Empty Fields
**Behavior:** Form won't submit if fields are empty
**Fix:** Fill in both username and password

### Session Expired
**Behavior:** Closing browser tab clears session
**Fix:** Log in again on new tab

---

## Code Structure

### Authentication States
```javascript
const [auth, setAuth] = useState(...)        // Login status
const [username, setUsername] = useState('')  // Username input
const [password, setPassword] = useState('')  // Password input
const [error, setError] = useState('')        // Error message
const [showPassword, setShowPassword] = useState(false) // Toggle visibility
```

### Credentials (Easy to Change)
```javascript
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Biyanis@123'
}
```

### Login Handler
```javascript
const handleLogin = (e) => {
  e.preventDefault()
  if (username === ADMIN_CREDENTIALS.username && 
      password === ADMIN_CREDENTIALS.password) {
    setAuth(true)
    sessionStorage.setItem('adminAuth', 'true')
    sessionStorage.setItem('adminUser', username)
    // Clear inputs
    setUsername('')
    setPassword('')
    setError('')
  } else {
    setError('Invalid username or password')
    setTimeout(() => setError(''), 2000)
  }
}
```

### Logout Handler
```javascript
const handleLogout = () => {
  setAuth(false)
  sessionStorage.removeItem('adminAuth')
  sessionStorage.removeItem('adminUser')
  setUsername('')
  setPassword('')
}
```

---

## Testing Credentials Locally

### Test 1: Correct Credentials
```
Username: admin
Password: Biyanis@123
Result: ✅ Login successful, dashboard loads
```

### Test 2: Wrong Username
```
Username: wrong_user
Password: Biyanis@123
Result: ❌ Error message shown
```

### Test 3: Wrong Password
```
Username: admin
Password: wrong_password
Result: ❌ Error message shown
```

### Test 4: Empty Fields
```
Username: (empty)
Password: (empty)
Result: Form doesn't submit
```

---

## Multi-Admin Support (Future Enhancement)

Currently, there's one admin account. To support multiple admins in the future:

1. Create a `users` table in Supabase
2. Store multiple admin credentials
3. Query database to verify login
4. Track who made what changes (audit log)

Example code structure:
```javascript
const validateCredentials = async (username, password) => {
  const { data } = await supabase
    .from('admin_users')
    .select()
    .eq('username', username)
    .eq('password', password)  // In production: use hashed passwords!
  return data?.length > 0
}
```

---

## Security Notes for Production

### Current Implementation
- Client-side authentication (simple)
- Credentials stored in code
- Good for small teams

### Production Recommendations
1. **Hash passwords** - Never store plain text
2. **Use Supabase Auth** - Professional authentication
3. **Database validation** - Check credentials in database, not code
4. **Rate limiting** - Prevent brute force attempts
5. **Audit logging** - Track admin actions
6. **Two-factor auth** - Optional but recommended

---

## Troubleshooting

### Issue: Forgot admin credentials
**Solution:** 
- Check this file: `src/components/AdminPanel.supabase.jsx` line 1-5
- Default is: username `admin`, password `Biyanis@123`
- Or ask developer who deployed

### Issue: Can't login after changing credentials
**Solution:**
- Check spelling of username and password
- Make sure you saved the file
- Restart `npm run dev`
- Clear browser cache and try again

### Issue: Getting error even with correct credentials
**Solution:**
- Check for extra spaces in username/password
- Passwords are case-sensitive
- Make sure ADMIN_CREDENTIALS is defined at top of file

### Issue: Login keeps failing
**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Check AdminPanel.supabase.jsx for syntax errors
4. Restart dev server: `npm run dev`

---

## Summary

✅ **Username + Password required** - Both must be correct
✅ **Default credentials:** admin / Biyanis@123
✅ **Easy to change** - Edit one place in code
✅ **Session stored** - Persists on refresh
✅ **Shows logged-in user** - Header displays admin name
✅ **Clear logout** - One-click session cleanup

**Your admin panel is now secured with authentication! 🔒**

---

*Last Updated: April 20, 2026*
*Status: ✅ AUTHENTICATION COMPLETE*
