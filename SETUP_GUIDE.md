# Intelligens AI Recruitment Platform - Complete Setup Guide

## Overview

This guide will walk you through setting up the complete Intelligens platform with:
- ✅ Backend API with Express + TypeScript + MongoDB
- ✅ S3 file storage for recordings and resumes
- ✅ n8n webhook integration for emails and automation
- ✅ Retell.AI for AI-powered voice interviews
- ✅ OpenAI for interview analysis and Job DNA generation
- ✅ Secure one-time interview access with camera/microphone
- ✅ Automatic interview recording with audio mixing

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- AWS account with S3 access
- Retell.AI account
- OpenAI API key
- n8n instance (self-hosted or cloud)

## Part 1: Backend Setup

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `server/.env` with your credentials:

#### 2.1 MongoDB Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Update in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intelligens?retryWrites=true&w=majority
```

#### 2.2 JWT Secret

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in `.env`:

```env
JWT_SECRET=your_generated_secret_here
```

#### 2.3 AWS S3 Setup

1. Go to AWS Console → S3
2. Create a new bucket (e.g., `intelligens-uploads`)
3. Go to IAM → Users → Create User
4. Attach policy: `AmazonS3FullAccess` (or create custom policy)
5. Create access key
6. Update in `.env`:

```env
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=intelligens-uploads
```

#### 2.4 Retell.AI Setup

1. Sign up at [Retell.AI](https://www.retellai.com)
2. Create a new AI agent
3. Configure agent personality and voice
4. Copy API key and agent ID
5. Update in `.env`:

```env
RETELL_API_KEY=key_xxxxxxxxxxxxxxxx
RETELL_AGENT_ID=agent_xxxxxxxxxxxxxxxx
```

#### 2.5 OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key
3. Update in `.env`:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2.6 n8n Webhook Setup

You need to create 3 webhooks in n8n:

**Webhook 1: Email Sending**
- Create workflow with Webhook trigger
- Add email node (Gmail, SendGrid, etc.)
- Expected payload:
```json
{
  "to": "email@example.com",
  "subject": "Interview Invitation",
  "body": "<html>...</html>",
  "candidateName": "John Doe",
  "interviewLink": "https://...",
  "interviewCode": "ABC12345"
}
```

**Webhook 2: Interview Questions Generation**
- Create workflow with Webhook trigger
- Add OpenAI node or custom logic
- Expected payload:
```json
{
  "jobTitle": "Senior Developer",
  "jobDescription": "...",
  "requiredSkills": ["JavaScript", "React"],
  "experienceLevel": "senior",
  "jobDNA": {...}
}
```
- Return array of questions

**Webhook 3: Interview Result Processing**
- Create workflow with Webhook trigger
- Add processing logic (notifications, database updates, etc.)
- Expected payload:
```json
{
  "candidateId": "...",
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "interviewData": {...},
  "transcript": [...],
  "duration": 1800,
  "recordingUrl": "https://s3..."
}
```

Update webhook URLs in `.env`:

```env
N8N_WEBHOOK_EMAIL=https://your-n8n.com/webhook/send-email
N8N_WEBHOOK_INTERVIEW_QUESTIONS=https://your-n8n.com/webhook/generate-questions
N8N_WEBHOOK_INTERVIEW_RESULT=https://your-n8n.com/webhook/interview-result
```

### Step 3: Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server will run on `http://localhost:3001`

## Part 2: Frontend Setup

### Step 1: Install Dependencies

```bash
cd ..  # Back to root
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_RETELL_AGENT_ID=agent_xxxxxxxxxxxxxxxx
```

### Step 3: Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Part 3: Testing the Complete Flow

### 1. Create Admin Account

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User",
    "company": "My Company",
    "role": "admin"
  }'
```

Save the returned JWT token.

### 2. Create a Job

```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Senior Full Stack Developer",
    "description": "We are looking for an experienced developer...",
    "company": "My Company",
    "location": "Remote",
    "employmentType": "full-time",
    "experienceLevel": "senior",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "status": "active"
  }'
```

Save the returned job ID.

### 3. Generate Job DNA

```bash
curl -X POST http://localhost:3001/api/jobs/JOB_ID/generate-dna \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Invite a Candidate

```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "jobId": "JOB_ID_HERE"
  }'
```

This will:
- Generate unique interview code
- Send invitation email via n8n
- Return interview link

### 5. Candidate Takes Interview

1. Candidate opens interview link: `http://localhost:5173/interview/CANDIDATE_ID?code=ABC12345`
2. System validates code (one-time use)
3. Requests camera/microphone access
4. Connects to Retell.AI for voice interview
5. Records video with mixed audio (candidate + AI)
6. Uploads recording to S3
7. Submits transcript for AI analysis
8. Sends results to n8n webhook

### 6. View Results

```bash
curl -X GET http://localhost:3001/api/candidates/CANDIDATE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response includes:
- Full transcript
- AI analysis with scores
- Recording URL
- Recommendation

## Part 4: Interview Page Features

### Security Features

✅ **One-Time Access**: Interview code can only be used once
✅ **Code Expiry**: Codes expire after 7 days (configurable)
✅ **Session Validation**: Prevents multiple interview attempts
✅ **Secure Recording**: Direct upload to S3 with authentication

### Technical Features

✅ **Camera/Microphone Access**: Mandatory before interview starts
✅ **Audio Mixing**: Combines candidate and AI audio in recording
✅ **Real-time Transcript**: Live display of conversation
✅ **Automatic Upload**: Recording uploads to S3 after completion
✅ **AI Analysis**: Automatic analysis with OpenAI
✅ **Webhook Integration**: Results sent to n8n for processing

### User Experience

✅ **Code Entry Modal**: Clean interface for code validation
✅ **Media Controls**: Toggle camera/microphone during interview
✅ **Live Status**: Visual indicators for interview state
✅ **Timer**: Duration tracking
✅ **Transcript Panel**: Real-time conversation display

## Part 5: Production Deployment

### Backend Deployment

1. **Environment**:
   - Set `NODE_ENV=production`
   - Use production MongoDB cluster
   - Enable HTTPS

2. **Security**:
   - Rotate JWT secret
   - Enable rate limiting
   - Configure CORS properly
   - Use environment-specific secrets

3. **Monitoring**:
   - Set up error tracking (Sentry, etc.)
   - Configure logging
   - Monitor S3 usage
   - Track API performance

### Frontend Deployment

1. Build production bundle:
```bash
npm run build
```

2. Deploy to hosting (Vercel, Netlify, etc.)

3. Update environment variables:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_RETELL_AGENT_ID=agent_xxxxxxxxxxxxxxxx
```

### Database Backup

Set up automated MongoDB backups:
- Use MongoDB Atlas automated backups
- Configure retention policy
- Test restore procedures

### S3 Configuration

1. Enable versioning
2. Configure lifecycle policies
3. Set up CloudFront CDN (optional)
4. Enable server-side encryption

## Part 6: Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure network access is configured

**S3 Upload Failed**
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket exists in correct region

**Retell.AI Connection Issues**
- Verify API key is valid
- Check agent ID is correct
- Ensure HTTPS for production

**Recording Not Saving**
- Check browser console for errors
- Verify S3 bucket permissions
- Check file size limits

**n8n Webhook Not Receiving Data**
- Verify webhook URLs are accessible
- Check n8n workflow is active
- Review n8n execution logs

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
```

Check logs for:
- API request/response details
- Database queries
- S3 upload progress
- Webhook calls

## Part 7: API Documentation

Full API documentation available at:
- Swagger UI: `http://localhost:3001/api-docs` (if configured)
- See `server/README.md` for endpoint details

## Support

For issues or questions:
1. Check this guide
2. Review server logs
3. Check browser console
4. Verify all environment variables
5. Test each service independently

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test with sample candidate
3. ✅ Customize interview questions
4. ✅ Configure email templates in n8n
5. ✅ Set up production deployment
6. ✅ Train team on platform usage

## Security Checklist

- [ ] JWT secret is secure and rotated
- [ ] MongoDB uses strong password
- [ ] AWS credentials are restricted
- [ ] S3 bucket has proper permissions
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Backup strategy in place
- [ ] Monitoring and alerts set up

---

**Congratulations!** Your Intelligens AI Recruitment Platform is now fully configured and ready to use.
