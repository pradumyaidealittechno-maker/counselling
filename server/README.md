# Intelligens Backend API

AI-powered recruitment platform backend with Retell.AI integration, S3 storage, and n8n webhooks.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📹 **Interview Management** - Retell.AI integration for AI-powered interviews
- 📦 **S3 File Storage** - AWS S3 for resumes, recordings, and documents
- 📧 **n8n Webhooks** - Email notifications and workflow automation
- 🤖 **AI Analysis** - OpenAI-powered interview analysis and Job DNA generation
- 🎥 **Video Recording** - Automatic interview recording with audio mixing
- 🔒 **One-Time Access** - Secure interview codes with expiry and single-use validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Storage**: AWS S3
- **AI Services**: Retell.AI, OpenAI
- **Automation**: n8n webhooks
- **Language**: TypeScript

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required configurations:

#### MongoDB
- Sign up at [MongoDB Atlas](https://cloud.mongodb.com)
- Create a cluster and get connection string
- Update `MONGODB_URI` in `.env`

#### AWS S3
- Create an S3 bucket in AWS Console
- Create IAM user with S3 permissions
- Update AWS credentials in `.env`

#### Retell.AI
- Sign up at [Retell.AI](https://www.retellai.com)
- Create an AI agent
- Copy API key and agent ID to `.env`

#### OpenAI
- Get API key from [OpenAI Platform](https://platform.openai.com)
- Update `OPENAI_API_KEY` in `.env`

#### n8n Webhooks
- Set up n8n instance (self-hosted or cloud)
- Create three webhooks:
  1. **Email Webhook** - Sends invitation emails
  2. **Questions Webhook** - Generates interview questions
  3. **Result Webhook** - Processes interview results
- Update webhook URLs in `.env`

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs

- `GET /api/jobs` - List all jobs (protected)
- `GET /api/jobs/:id` - Get job details (protected)
- `POST /api/jobs` - Create job (protected)
- `PATCH /api/jobs/:id` - Update job (protected)
- `POST /api/jobs/:id/generate-dna` - Generate Job DNA (protected)
- `POST /api/jobs/:id/generate-questions` - Generate questions via n8n (protected)
- `DELETE /api/jobs/:id` - Delete job (protected)

### Candidates

- `GET /api/candidates` - List all candidates (protected)
- `GET /api/candidates/:id` - Get candidate details (protected)
- `POST /api/candidates` - Create candidate and send invitation (protected)
- `POST /api/candidates/:id/resume` - Upload resume (protected)
- `PATCH /api/candidates/:id/decision` - Update hiring decision (protected)
- `POST /api/candidates/:id/resend-invitation` - Resend invitation (protected)

### Interviews (Public Endpoints)

- `POST /api/interviews/validate-code` - Validate interview code
- `POST /api/interviews/create-web-call` - Create Retell web call
- `POST /api/interviews/save-recording` - Upload interview recording
- `POST /api/interviews/submit-result` - Submit interview results

### Upload

- `POST /api/upload` - Generic file upload (protected)

## Interview Flow

### 1. Candidate Creation
```javascript
POST /api/candidates
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "jobId": "job_id_here"
}
```

Response includes:
- Unique interview code
- Interview link
- Automatic email invitation via n8n

### 2. Code Validation
```javascript
POST /api/interviews/validate-code
{
  "code": "ABC12345"
}
```

- Validates code and expiry
- Marks interview as accessed (one-time use)
- Returns candidate info

### 3. Interview Session
```javascript
POST /api/interviews/create-web-call
{
  "agentId": "agent_id"
}
```

Returns Retell access token for WebRTC connection

### 4. Recording Upload
```javascript
POST /api/interviews/save-recording
FormData: {
  file: <video_blob>,
  uid: "candidate_id",
  candidate_name: "John Doe"
}
```

Uploads to S3 and updates candidate record

### 5. Result Submission
```javascript
POST /api/interviews/submit-result
{
  "candidateId": "candidate_id",
  "transcript": [...],
  "duration": 1800
}
```

- Saves transcript
- Analyzes with OpenAI
- Sends to n8n webhook for processing

## n8n Webhook Payloads

### Email Webhook
```json
{
  "to": "candidate@example.com",
  "subject": "Interview Invitation",
  "body": "<html>...</html>",
  "candidateName": "John Doe",
  "interviewLink": "https://...",
  "interviewCode": "ABC12345"
}
```

### Questions Webhook
```json
{
  "jobTitle": "Senior Developer",
  "jobDescription": "...",
  "requiredSkills": ["JavaScript", "React"],
  "experienceLevel": "senior",
  "jobDNA": {...}
}
```

### Result Webhook
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

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- CORS configuration
- One-time interview access
- Code expiry validation
- Protected routes with role-based access

## Database Models

### User
- Email, password, name, company
- Role-based access (admin, recruiter, hiring_manager)

### Job
- Title, description, requirements
- Job DNA (AI-generated)
- Interview questions
- Status tracking

### Candidate
- Personal information
- Interview code and expiry
- Recording and transcript
- AI analysis results
- Final hiring decision

## Development

```bash
# Watch mode
npm run dev

# Lint
npm run lint

# Build
npm run build
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up AWS S3 bucket with proper permissions
4. Configure n8n webhooks
5. Set secure JWT secret
6. Enable HTTPS
7. Set up monitoring and logging

## Troubleshooting

### MongoDB Connection Issues
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure network access is configured

### S3 Upload Failures
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket exists and is accessible

### Retell.AI Connection Issues
- Verify API key is valid
- Check agent ID is correct
- Ensure HTTPS is enabled for production

### n8n Webhook Failures
- Verify webhook URLs are accessible
- Check n8n workflow is active
- Review n8n logs for errors

## Support

For issues and questions, please check the documentation or contact the development team.
