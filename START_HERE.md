# 🚀 Quick Start Guide

## Step 1: Fix MongoDB Connection

Your MongoDB connection is failing. Let's fix it:

### Option A: Update MongoDB Password

1. **Go to MongoDB Atlas** (https://cloud.mongodb.com)
2. **Click "Database Access"** in left sidebar
3. **Find user `hrtool`** and click "Edit"
4. **Click "Edit Password"**
5. **Choose "Autogenerate Secure Password"** and copy it
6. **Click "Update User"**
7. **Update `server/.env`:**
   ```env
   MONGODB_URI=mongodb+srv://hrtool:YOUR_NEW_PASSWORD@cluster0.hzhg544.mongodb.net/hrtool?retryWrites=true&w=majority&appName=Cluster0
   ```

### Option B: Create New Database User

1. **Go to MongoDB Atlas** → **Database Access**
2. **Click "Add New Database User"**
3. **Username:** `intelligens_admin`
4. **Password:** Click "Autogenerate" and copy it
5. **Privileges:** "Atlas admin"
6. **Click "Add User"**
7. **Update `server/.env`:**
   ```env
   MONGODB_URI=mongodb+srv://intelligens_admin:YOUR_PASSWORD@cluster0.hzhg544.mongodb.net/intelligens?retryWrites=true&w=majority&appName=Cluster0
   ```

### Important: URL Encode Special Characters

If your password has special characters, encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

Example:
```
Password: Pass@123#
Encoded:  Pass%40123%23
```

## Step 2: Start Backend (Automatic Setup)

```bash
cd server
npm run setup
```

This will:
- ✅ Check MongoDB connection
- ✅ Create admin user if needed
- ✅ Start the server

**Default Login Credentials:**
- Email: `admin@intelligens.app`
- Password: `Admin123!`

## Step 3: Start Frontend

```bash
# In a new terminal
npm run dev
```

## Step 4: Test Login

1. Open: http://localhost:5173/login
2. Use credentials:
   - Email: `admin@intelligens.app`
   - Password: `Admin123!`

## Alternative: Manual Setup

If automatic setup doesn't work:

### 1. Test MongoDB Connection

```bash
cd server
node test-connection.js
```

### 2. Create User Manually

```bash
# Via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "company": "Test Company"
  }'
```

### 3. Start Server

```bash
npm run dev
```

## Troubleshooting

### Error: "MongoDB connection failed"

**Solution:**
1. Check `server/.env` has correct `MONGODB_URI`
2. Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` for testing)
3. Test connection: `node test-connection.js`

### Error: "Cannot find module"

**Solution:**
```bash
cd server
npm install
```

### Error: "Port 3001 already in use"

**Solution:**
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9

# Or change port in server/.env
PORT=3002
```

### Login shows "Invalid credentials"

**Solution:**
1. Create new user via signup page: http://localhost:5173/signup
2. Or use the setup script: `npm run setup`

### Frontend shows "Network Error"

**Solution:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Check `.env` has: `VITE_API_URL=http://localhost:3001`
3. Restart frontend: `npm run dev`

## Quick Commands Reference

```bash
# Backend
cd server
npm run setup      # Setup and start (recommended)
npm run dev        # Just start server
npm run seed       # Seed with sample data
node test-auth.js  # Test authentication

# Frontend
npm run dev        # Start frontend

# Test API
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intelligens.app","password":"Admin123!"}'
```

## Success Checklist

- [ ] MongoDB connection working
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Dashboard loads

## Need Help?

1. **Check backend terminal** for error messages
2. **Check browser console** (F12) for frontend errors
3. **Run diagnostics:**
   ```bash
   cd server
   node test-connection.js  # Test MongoDB
   node test-auth.js        # Test authentication
   ```

## What's Next?

Once login works:
1. ✅ Create jobs
2. ✅ Invite candidates
3. ✅ Conduct interviews
4. ✅ Review AI analysis

See `FRONTEND_INTEGRATION.md` for integrating remaining pages.

---

**Quick Start:** `cd server && npm run setup` then `npm run dev` (in root)
