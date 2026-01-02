# Admin Panel Security Setup

## 🔒 Security Features Implemented

### 1. **Authentication Protection**
- All `/admin` routes are now protected and require login
- Unauthenticated users are automatically redirected to `/login`
- JWT token validation on every request

### 2. **Signup Disabled by Default**
- Public signup is **disabled in production** to prevent unauthorized account creation
- Only existing administrators can access the admin panel

### 3. **Environment-Based Signup Control**
- Signup can be temporarily enabled for initial setup using environment variables

---

## 🚀 Initial Setup (First Time Only)

If you need to create the **first admin account**:

1. Create a `.env` file in the `NTA_ADMIN` directory:
   ```bash
   cp .env.example .env
   ```

2. **Temporarily enable signup** in `.env`:
   ```env
   VITE_ENABLE_SIGNUP=true
   ```

3. Rebuild and restart your app:
   ```bash
   npm run build
   ```

4. Visit `https://admin.newtimeafrica.com/signup` and create your admin account

5. **IMMEDIATELY disable signup** by setting in `.env`:
   ```env
   VITE_ENABLE_SIGNUP=false
   ```

6. Rebuild and redeploy:
   ```bash
   npm run build
   ```

---

## 🔐 Production Security Checklist

- [x] Authentication required for all admin routes
- [x] Signup disabled by default (`VITE_ENABLE_SIGNUP=false`)
- [x] JWT tokens stored securely in localStorage
- [x] Unauthorized users redirected to login
- [ ] **TODO**: Implement token expiration and refresh
- [ ] **TODO**: Add rate limiting on login attempts
- [ ] **TODO**: Implement role-based access control (RBAC)
- [ ] **TODO**: Add audit logging for admin actions

---

## 🛠️ Additional Security Recommendations

### Backend Security
1. **Verify backend auth endpoints** in `NTA_BACKEND`:
   - Ensure `/api/admin/signup` is disabled or protected
   - Add rate limiting to `/api/admin/login`
   - Implement JWT expiration (recommended: 24 hours)

2. **Database security**:
   - Use strong passwords
   - Limit database access to backend only
   - Regular backups

### Frontend Security
1. **Environment Variables**:
   - Never commit `.env` files to git
   - Use different tokens for dev/prod
   - Keep `VITE_ENABLE_SIGNUP=false` in production

2. **HTTPS Only**:
   - Ensure `https://admin.newtimeafrica.com` uses SSL
   - Set `Secure` and `HttpOnly` flags on cookies (if using)

---

## 🧪 Testing Security

Test that protection is working:

1. **Without login**: Try accessing `https://admin.newtimeafrica.com/admin`
   - ✅ Should redirect to `/login`

2. **After login**: Access the admin panel
   - ✅ Should show admin dashboard

3. **Signup disabled**: Try accessing `https://admin.newtimeafrica.com/signup`
   - ✅ Should show 404 or redirect to login

4. **Token expiration**: Clear localStorage and try accessing admin
   - ✅ Should redirect to login

---

## 📝 Managing Admin Users

Since signup is disabled, to add new admins:

**Option 1: Database Direct (Recommended)**
```sql
-- Connect to your database and insert user manually
INSERT INTO users (name, email, password, role, created_at) 
VALUES ('Admin Name', 'admin@example.com', 'HASHED_PASSWORD', 'admin', NOW());
```

**Option 2: Temporary Signup Enable**
- Follow the "Initial Setup" steps above
- Re-disable immediately after creating the account

**Option 3: Create an invite system** (Future Enhancement)
- Add an "Invite Admin" feature in the admin panel
- Existing admins can send invite links with expiring tokens

---

## 🚨 Security Incident Response

If you suspect unauthorized access:

1. **Immediately**: Change all admin passwords
2. Check backend logs for suspicious activity
3. Revoke all active JWT tokens (restart backend)
4. Review database for unauthorized changes
5. Enable 2FA if available

---

## 📞 Support

For security concerns, contact: [Your Email]

**Last Updated**: January 2, 2026
