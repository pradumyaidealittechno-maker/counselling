# API Reference

Complete API documentation for Intelligens Backend.

## Base URL

```
Development: http://localhost:3001
Production: https://api.yourdomain.com
```

## Authentication

Most endpoints require JWT authentication. Include token in header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Company Name",
  "role": "recruiter"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Company Name",
    "role": "recruiter"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register

### Get Current User

```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Company Name",
  "role": "recruiter"
}
```

---

## Job Endpoints

### List All Jobs

```http
GET /api/jobs
```

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
[
  {
    "_id": "job_id",
    "title": "Senior Developer",
    "description": "...",
    "company": "Company Name",
    "location": "Remote",
    "employmentType": "full-time",
    "experienceLevel": "senior",
    "requiredSkills": ["JavaScript", "React"],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Job by ID

```http
GET /api/jobs/:id
```

**Headers:** `Authorization: Bearer TOKEN`

### Create Job

```http
POST /api/jobs
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for...",
  "company": "Company Name",
  "location": "Remote",
  "employmentType": "full-time",
  "experienceLevel": "senior",
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "optionalSkills": ["TypeScript", "AWS"],
  "status": "active"
}
```

### Update Job

```http
PATCH /api/jobs/:id
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:** Partial job object

### Generate Job DNA

```http
POST /api/jobs/:id/generate-dna
```

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "jobDNA": {
    "coreCompetencies": ["Problem Solving", "Leadership"],
    "technicalSkills": ["JavaScript", "React"],
    "softSkills": ["Communication", "Teamwork"],
    "industryKnowledge": ["Web Development"],
    "culturalAttributes": ["Innovation", "Collaboration"],
    "keyResponsibilities": ["Develop features", "Code review"]
  }
}
```

### Generate Interview Questions

```http
POST /api/jobs/:id/generate-questions
```

**Headers:** `Authorization: Bearer TOKEN`

Sends job data to n8n webhook and returns generated questions.

### Delete Job

```http
DELETE /api/jobs/:id
```

**Headers:** `Authorization: Bearer TOKEN`

---

## Candidate Endpoints

### List All Candidates

```http
GET /api/candidates
```

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
[
  {
    "_id": "candidate_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "jobId": {
      "_id": "job_id",
      "title": "Senior Developer"
    },
    "interviewCode": "ABC12345",
    "interviewStatus": "invited",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Candidate by ID

```http
GET /api/candidates/:id
```

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "_id": "candidate_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "jobId": {...},
  "interviewCode": "ABC12345",
  "interviewCodeExpiry": "2024-01-08T00:00:00.000Z",
  "interviewStatus": "completed",
  "recordingUrl": "https://s3...",
  "transcript": [...],
  "analysis": {
    "overallScore": 85,
    "technicalSkills": {...},
    "communication": {...},
    "recommendation": "hire"
  }
}
```

### Create Candidate & Send Invitation

```http
POST /api/candidates
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "jobId": "job_id_here",
  "linkedInUrl": "https://linkedin.com/in/johndoe"
}
```

**Response:**
```json
{
  "candidate": {...},
  "interviewLink": "https://app.com/interview/candidate_id?code=ABC12345",
  "message": "Candidate created and invitation sent"
}
```

### Upload Resume

```http
POST /api/candidates/:id/resume
```

**Headers:** 
- `Authorization: Bearer TOKEN`
- `Content-Type: multipart/form-data`

**Body:** FormData with `resume` file

**Response:**
```json
{
  "success": true,
  "resumeUrl": "https://s3.../resume.pdf"
}
```

### Update Hiring Decision

```http
PATCH /api/candidates/:id/decision
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "finalDecision": "hired",
  "notes": "Excellent technical skills and cultural fit"
}
```

### Resend Invitation

```http
POST /api/candidates/:id/resend-invitation
```

**Headers:** `Authorization: Bearer TOKEN`

Generates new code if expired and resends email.

---

## Interview Endpoints (Public)

### Validate Interview Code

```http
POST /api/interviews/validate-code
```

**Body:**
```json
{
  "code": "ABC12345"
}
```

**Response:**
```json
{
  "valid": true,
  "candidate_name": "John Doe",
  "uid": "candidate_id"
}
```

**Error Response:**
```json
{
  "valid": false,
  "error": "Code expired"
}
```

### Create Retell Web Call

```http
POST /api/interviews/create-web-call
```

**Body:**
```json
{
  "agentId": "agent_xxxxxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "call_id": "call_xxxxxxxxxxxxxxxx"
}
```

### Save Interview Recording

```http
POST /api/interviews/save-recording
```

**Headers:** `Content-Type: multipart/form-data`

**Body:** FormData
- `file`: Video blob
- `candidate_name`: String
- `uid`: Candidate ID

**Response:**
```json
{
  "success": true,
  "url": "https://s3.../recording.webm",
  "key": "recordings/uuid-recording.webm"
}
```

### Submit Interview Results

```http
POST /api/interviews/submit-result
```

**Body:**
```json
{
  "candidateId": "candidate_id",
  "transcript": [
    {
      "speaker": "ai",
      "text": "Tell me about yourself",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "speaker": "candidate",
      "text": "I am a software developer...",
      "timestamp": "2024-01-01T00:00:05.000Z"
    }
  ],
  "duration": 1800,
  "metadata": {
    "completedAt": "2024-01-01T00:30:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview results submitted successfully",
  "analysis": {
    "overallScore": 85,
    "technicalSkills": {
      "score": 88,
      "strengths": ["Strong JavaScript knowledge"],
      "weaknesses": ["Limited AWS experience"]
    },
    "recommendation": "hire"
  }
}
```

---

## Upload Endpoints

### Generic File Upload

```http
POST /api/upload
```

**Headers:** 
- `Authorization: Bearer TOKEN`
- `Content-Type: multipart/form-data`

**Body:** FormData
- `file`: File to upload
- `folder`: Target folder (optional)

**Response:**
```json
{
  "success": true,
  "url": "https://s3.../file.pdf",
  "key": "uploads/uuid-file.pdf"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- Window: 15 minutes
- Max requests: 100 per window
- Applies to all endpoints

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Webhooks (n8n Integration)

### Email Webhook

**Endpoint:** Configured in `N8N_WEBHOOK_EMAIL`

**Payload:**
```json
{
  "to": "candidate@example.com",
  "subject": "Interview Invitation - Senior Developer",
  "body": "<html>...</html>",
  "candidateName": "John Doe",
  "interviewLink": "https://...",
  "interviewCode": "ABC12345"
}
```

### Questions Webhook

**Endpoint:** Configured in `N8N_WEBHOOK_INTERVIEW_QUESTIONS`

**Payload:**
```json
{
  "jobTitle": "Senior Developer",
  "jobDescription": "...",
  "requiredSkills": ["JavaScript", "React"],
  "experienceLevel": "senior",
  "jobDNA": {...}
}
```

**Expected Response:**
```json
[
  {
    "question": "Explain closures in JavaScript",
    "category": "technical",
    "difficulty": "medium"
  }
]
```

### Result Webhook

**Endpoint:** Configured in `N8N_WEBHOOK_INTERVIEW_RESULT`

**Payload:**
```json
{
  "candidateId": "candidate_id",
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "interviewData": {...},
  "transcript": [...],
  "duration": 1800,
  "recordingUrl": "https://s3..."
}
```

---

## Testing with cURL

### Register and Login
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User","company":"Test Co"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Create Job
```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Developer","description":"...","company":"Test Co","location":"Remote","employmentType":"full-time","experienceLevel":"mid","requiredSkills":["JavaScript"],"status":"active"}'
```

### Invite Candidate
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","jobId":"JOB_ID"}'
```

---

## Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Intelligens API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"company\":\"Test Co\"}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    }
  ]
}
```

---

For more details, see the main [README.md](./README.md) and [SETUP_GUIDE.md](../SETUP_GUIDE.md).
