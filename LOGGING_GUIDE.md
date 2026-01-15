# 🔍 Logging Guide

Comprehensive logging has been enabled for debugging. Here's what you'll see:

## Backend Logs

### Server Startup
```
╔════════════════════════════════════════════════════════════╗
║   🚀 INTELLIGENS BACKEND SERVER                           ║
╚════════════════════════════════════════════════════════════╝

📋 CONFIGURATION:
────────────────────────────────────────────────────────────
   Environment: development
   Port: 3001
   Frontend URL: http://localhost:5173
   MongoDB: ✅ Configured
   JWT Secret: ✅ Configured
   AWS S3: ⚠️ Not configured
   ...
```

### Request Logging
```
════════════════════════════════════════════════════════════
📥 INCOMING REQUEST - 2024-01-14T10:30:00.000Z
════════════════════════════════════════════════════════════
   Method: POST
   URL: /api/auth/login
   IP: ::1
   User-Agent: Mozilla/5.0...
   Body: {"email":"test@example.com","password":"***HIDDEN***"}
────────────────────────────────────────────────────────────
📤 RESPONSE - ✅ 200 - 45ms
════════════════════════════════════════════════════════════
```

### Authentication Logs
```
🔐 AUTH: Login attempt
   Email: test@example.com
   Looking up user...
   ✅ User found: 65a1b2c3d4e5f6g7h8i9j0k1
   Verifying password...
   ✅ Password verified
   ✅ Token generated
   ✅ Login successful
```

### Error Logs
```
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
❌ ERROR OCCURRED
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
   Time: 2024-01-14T10:30:00.000Z
   Route: POST /api/auth/login
   Error Name: Error
   Error Message: Invalid credentials
   Stack Trace:
   ...
```

## Frontend Logs (Browser Console)

### API Configuration (on page load)
```
🔧 API Configuration
   API URL: http://localhost:3001
   Debug Mode: ON
```

### Request Logging
```
🔄 POST http://localhost:3001/api/auth/login
   Request Body: {email: "test@example.com", password: "***"}

📥 Response [200]: {token: "...", user: {...}}
```

### Auth Logging
```
📡 API: Logging in... {email: "test@example.com"}
✅ API: Login successful {userId: "...", email: "test@example.com"}
```

### Error Logging
```
❌ API: Login failed Invalid credentials
❌ API: Network error - Is the backend running? {url: "..."}
```

### Form Submission Logging
```
🔐 Login Form Submitted
   Email: test@example.com
📡 Calling API...
✅ Login successful! {token: "...", user: {...}}
```

## How to Use

### View Backend Logs
1. Start backend: `cd server && npm run dev`
2. Watch the terminal for logs

### View Frontend Logs
1. Open browser: http://localhost:5173
2. Open DevTools: Press F12
3. Go to Console tab
4. Perform actions and watch logs

### Filter Logs in Browser
- Type `API` in console filter to see only API logs
- Type `AUTH` to see authentication logs
- Type `error` to see only errors

## Disable Logging

### Backend
Set in `server/.env`:
```env
NODE_ENV=production
```

### Frontend
In `src/services/api.ts`, change:
```typescript
const DEBUG = false;
```

## Log Levels

### Backend
- `console.log` - Info messages
- `console.error` - Error messages

### Frontend
- `📡 API:` - API calls
- `✅ API:` - Success
- `❌ API:` - Errors
- `🔄` - Request in progress
- `📥` - Response received

## Troubleshooting with Logs

### "Network Error"
```
❌ API: Network error - Is the backend running?
```
**Solution:** Start backend with `cd server && npm run dev`

### "Invalid credentials"
```
🔐 AUTH: Login attempt
   Email: test@example.com
   ❌ User not found
```
**Solution:** Create user via signup or run `npm run setup`

### "MongoDB connection error"
```
🔌 CONNECTING TO DATABASE:
   ❌ MongoDB connection error: bad auth
```
**Solution:** Check MONGODB_URI in server/.env

### "Cannot find module"
```
Error: Cannot find module './routes/auth.routes.js'
```
**Solution:** Run `npm install` in server directory

## Quick Debug Commands

```bash
# Check backend health
curl http://localhost:3001/health

# Test login API directly
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Check MongoDB connection
cd server && node test-connection.js

# Check authentication
cd server && node test-auth.js
```

## Log Files

Currently, logs are only output to console. For production, consider:
- Winston logger
- Morgan for HTTP logs
- Log aggregation service (Datadog, Loggly, etc.)

---

**Tip:** Keep both terminals visible - one for backend logs, one for frontend. This helps correlate requests with responses.
