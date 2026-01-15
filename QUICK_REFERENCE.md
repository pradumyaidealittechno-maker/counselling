# Quick Reference Card

## 🚀 Getting Started (5 minutes)

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp .env.example .env
cp server/.env.example server/.env
# Edit both .env files with your credentials

# 3. Start development
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev

# 4. Seed database (optional)
cd server && npm run seed
```

## 🔑 Default Credentials (after seeding)

```
Email: admin@intelligens.app
Password: Admin123!
```

## 📡 API Quick Reference

### Base URL
```
http://localhost:3001
```

### Authentication
```bash
# Register
POST /api/auth/register
Body: { email, password, firstName, lastName, company }

# Login
POST /api/auth/login
Body: { email, password }
Returns: { token, user }

# Use token in headers
Authorization: Bearer YOUR_JWT_TOKEN
```

### Jobs
```bash
# List jobs
GET /api/jobs

# Create job
POST /api/jobs
Body: { title, description, company, location, employmentType, experienceLevel, requiredSkills, status }

# Generate Job DNA
POST /api/jobs/:id/generate-dna

# Generate questions
POST /api/jobs/:id/generate-questions
```

### Candidates
```bash
# List candidates
GET /api/candidates

# Invite candidate
POST /api/candidates
Body: { firstName, lastName, email, phone, jobId }
Returns: { candidate, interviewLink, message }

# Get candidate details
GET /api/candidates/:id

# Update decision
PATCH /api/candidates/:id/decision
Body: { finalDecision: "hired|rejected|pending", notes }
```

### Interviews (Public)
```bash
# Validate code
POST /api/interviews/validate-code
Body: { code }

# Create Retell call
POST /api/interviews/create-web-call
Body: { agentId }

# Save recording
POST /api/interviews/save-recording
FormData: { file, candidate_name, uid }

# Submit results
POST /api/interviews/submit-result
Body: { candidateId, transcript, duration, metadata }
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-32-chars-min
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=intelligens-uploads
RETELL_API_KEY=key_...
RETELL_AGENT_ID=agent_...
OPENAI_API_KEY=sk-...

# Optional (for full features)
N8N_WEBHOOK_EMAIL=https://...
N8N_WEBHOOK_INTERVIEW_QUESTIONS=https://...
N8N_WEBHOOK_INTERVIEW_RESULT=https://...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_RETELL_AGENT_ID=agent_...
```

## 📁 Project Structure

```
intelligens/
├── src/                          # Frontend
│   ├── pages/
│   │   ├── CandidateInterview.tsx   # Interview page
│   │   ├── Dashboard.tsx
│   │   └── ...
│   └── components/
├── server/                       # Backend
│   ├── src/
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Auth, upload, etc.
│   │   └── config/              # DB, S3 config
│   └── scripts/
│       └── seed.ts              # Database seeding
└── ...
```

## 🎯 Common Tasks

### Create a New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!","firstName":"John","lastName":"Doe","company":"Company"}'
```

### Create a Job
```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Developer","description":"Job description","company":"Company","location":"Remote","employmentType":"full-time","experienceLevel":"mid","requiredSkills":["JavaScript"],"status":"active"}'
```

### Invite Candidate
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith","email":"jane@example.com","jobId":"JOB_ID"}'
```

## 🐛 Debugging

### Check Backend Status
```bash
curl http://localhost:3001/health
```

### View Backend Logs
```bash
cd server
npm run dev
# Watch console output
```

### Check MongoDB Connection
```bash
# In server/.env, verify MONGODB_URI
# Check MongoDB Atlas → Network Access → IP Whitelist
```

### Test S3 Upload
```bash
# Verify AWS credentials in .env
# Check bucket exists and has correct permissions
# Test with small file first
```

### Test Retell.AI
```bash
# Verify RETELL_API_KEY and RETELL_AGENT_ID
# Check Retell.AI dashboard for agent status
# Ensure HTTPS in production
```

## 📊 Database Models

### User
```typescript
{
  email: string
  password: string (hashed)
  firstName: string
  lastName: string
  company: string
  role: 'admin' | 'recruiter' | 'hiring_manager'
}
```

### Job
```typescript
{
  title: string
  description: string
  company: string
  location: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead'
  requiredSkills: string[]
  jobDNA: {...}
  status: 'draft' | 'active' | 'closed'
}
```

### Candidate
```typescript
{
  firstName: string
  lastName: string
  email: string
  jobId: ObjectId
  interviewCode: string
  interviewStatus: 'pending' | 'invited' | 'in_progress' | 'completed' | 'expired'
  recordingUrl: string
  transcript: Array<{speaker, text, timestamp}>
  analysis: {...}
  finalDecision: 'hired' | 'rejected' | 'pending'
}
```

## 🔐 Security Checklist

- [ ] JWT_SECRET is secure (32+ chars)
- [ ] MongoDB uses strong password
- [ ] AWS credentials are restricted
- [ ] S3 bucket has proper permissions
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Environment variables secured

## 🚨 Common Errors

### "MongoDB connection failed"
- Check MONGODB_URI format
- Verify IP whitelist in MongoDB Atlas
- Ensure network access configured

### "S3 upload failed"
- Verify AWS credentials
- Check bucket name and region
- Ensure bucket permissions

### "Invalid token"
- Token expired (7 days default)
- Login again to get new token
- Check JWT_SECRET matches

### "Retell connection failed"
- Verify API key and agent ID
- Check Retell.AI dashboard
- Ensure HTTPS for production

## 📞 Support Resources

- [Complete Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./server/API_REFERENCE.md)
- [Backend README](./server/README.md)
- [Main README](./README.md)

## 🎓 Learning Resources

### MongoDB
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)

### AWS S3
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

### Retell.AI
- [Retell.AI Docs](https://docs.retellai.com)
- [Web SDK Guide](https://docs.retellai.com/web-sdk)

### OpenAI
- [OpenAI API Docs](https://platform.openai.com/docs)
- [GPT-4 Guide](https://platform.openai.com/docs/guides/gpt)

### n8n
- [n8n Documentation](https://docs.n8n.io)
- [Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

## 💡 Pro Tips

1. **Use seed script** for quick testing: `npm run seed`
2. **Check logs** for debugging: Backend console shows all requests
3. **Test API** with cURL or Postman before frontend integration
4. **Monitor S3 usage** to avoid unexpected costs
5. **Use MongoDB Compass** for database visualization
6. **Enable source maps** for easier debugging
7. **Use environment-specific configs** for dev/staging/prod
8. **Set up error tracking** (Sentry) for production
9. **Configure backups** for MongoDB and S3
10. **Document custom changes** for team collaboration

---

**Need help?** Check the full documentation or contact the development team.
