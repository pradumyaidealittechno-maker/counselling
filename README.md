# Intelligens - AI-Powered Recruitment Platform

A comprehensive recruitment platform featuring AI-powered interviews, automated candidate screening, and intelligent hiring decisions.

## 🚀 Features

### Core Features
- ✅ **AI Voice Interviews** - Retell.AI integration for natural conversation interviews
- ✅ **Automatic Recording** - Video + audio recording with intelligent mixing
- ✅ **AI Analysis** - OpenAI-powered interview analysis and scoring
- ✅ **Job DNA Generation** - AI-generated job profiles and requirements
- ✅ **One-Time Interview Access** - Secure, single-use interview codes
- ✅ **S3 File Storage** - Scalable storage for recordings and resumes
- ✅ **n8n Automation** - Webhook-based email and workflow automation
- ✅ **Real-time Transcription** - Live interview transcript display
- ✅ **Candidate Management** - Complete candidate lifecycle tracking
- ✅ **Interview Analytics** - Comprehensive scoring and recommendations

### Technical Features
- 🔐 JWT Authentication with role-based access
- 📹 WebRTC video/audio with MediaRecorder API
- 🎙️ Audio mixing (candidate + AI voice)
- 📊 MongoDB database with Mongoose ODM
- ☁️ AWS S3 integration for file storage
- 🤖 OpenAI GPT-4 for analysis
- 📧 n8n webhook integration
- 🎯 TypeScript for type safety
- ⚡ React + Vite frontend
- 🚀 Express.js backend

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- AWS account with S3
- Retell.AI account
- OpenAI API key
- n8n instance (optional but recommended)

## 🛠️ Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd intelligens
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd ..
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### 4. Seed Database (Optional)

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@intelligens.app` / `Admin123!`
- Sample jobs

## 📚 Documentation

- [Complete Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Backend README](./server/README.md) - Backend documentation
- [API Reference](./server/API_REFERENCE.md) - Complete API documentation

## 🏗️ Architecture

```
intelligens/
├── src/                      # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── CandidateInterview.tsx  # New interview page
│   │   └── ...
│   └── ...
├── server/                  # Backend Express application
│   ├── src/
│   │   ├── config/         # Configuration (DB, S3)
│   │   ├── middleware/     # Auth, upload, error handling
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (AI, n8n, Retell)
│   │   └── index.ts        # Server entry point
│   └── scripts/            # Utility scripts
└── ...
```

## 🔑 Key Components

### Backend Services

**AI Service** (`server/src/services/ai.service.ts`)
- Interview analysis with OpenAI
- Job DNA generation
- Scoring and recommendations

**Retell Service** (`server/src/services/retell.service.ts`)
- Web call creation
- Call management
- Integration with Retell.AI

**n8n Service** (`server/src/services/n8n.service.ts`)
- Email sending
- Interview question generation
- Result processing webhooks

**S3 Service** (`server/src/config/s3.ts`)
- File upload to S3
- Signed URL generation
- File deletion

### Frontend Components

**CandidateInterview** (`src/pages/CandidateInterview.tsx`)
- Code validation
- Camera/microphone access
- Retell.AI integration
- Recording with audio mixing
- Real-time transcript
- Result submission

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- One-time interview codes
- Code expiry validation
- Rate limiting
- CORS configuration
- Helmet security headers
- S3 signed URLs
- Role-based access control

## 📊 Interview Flow

1. **Recruiter creates job** → Job DNA generated
2. **Recruiter invites candidate** → Unique code generated, email sent
3. **Candidate receives email** → Opens interview link
4. **Code validation** → One-time access granted
5. **Camera/mic access** → Permissions requested
6. **Interview starts** → Retell.AI connection established
7. **Recording begins** → Video + mixed audio captured
8. **Interview completes** → Recording uploaded to S3
9. **AI analysis** → OpenAI processes transcript
10. **Results sent** → n8n webhook triggered
11. **Recruiter reviews** → Makes hiring decision

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/interviews/validate-code` - Validate interview code
- `POST /api/interviews/create-web-call` - Create Retell session
- `POST /api/interviews/save-recording` - Upload recording
- `POST /api/interviews/submit-result` - Submit interview results

### Protected Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `POST /api/jobs/:id/generate-dna` - Generate Job DNA
- `GET /api/candidates` - List candidates
- `POST /api/candidates` - Invite candidate
- `PATCH /api/candidates/:id/decision` - Update decision

See [API Reference](./server/API_REFERENCE.md) for complete documentation.

## 🔧 Configuration

### Environment Variables

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=intelligens-uploads
RETELL_API_KEY=key_...
RETELL_AGENT_ID=agent_...
OPENAI_API_KEY=sk-...
N8N_WEBHOOK_EMAIL=https://...
N8N_WEBHOOK_INTERVIEW_QUESTIONS=https://...
N8N_WEBHOOK_INTERVIEW_RESULT=https://...
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_RETELL_AGENT_ID=agent_...
```

## 🧪 Testing

### Test Interview Flow

1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Seed database: `cd server && npm run seed`
4. Login: `admin@intelligens.app` / `Admin123!`
5. Create candidate invitation
6. Open interview link
7. Complete interview
8. Review results

### API Testing

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User","company":"Test Co"}'

# Create job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Developer","description":"...","company":"Test","location":"Remote","employmentType":"full-time","experienceLevel":"mid","requiredSkills":["JavaScript"],"status":"active"}'
```

## 🚀 Deployment

### Backend Deployment

1. Build: `npm run build`
2. Set environment variables
3. Deploy to hosting (Heroku, AWS, etc.)
4. Configure MongoDB Atlas IP whitelist
5. Set up S3 bucket permissions

### Frontend Deployment

1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Update `VITE_API_URL` to production API

## 📈 Monitoring

- MongoDB Atlas monitoring
- AWS CloudWatch for S3
- Application logs
- Error tracking (Sentry recommended)
- API performance monitoring

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check connection string
- Verify IP whitelist
- Ensure network access

**S3 Upload Failed**
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket exists

**Retell.AI Connection Issues**
- Verify API key
- Check agent ID
- Ensure HTTPS in production

**Recording Not Saving**
- Check browser permissions
- Verify S3 configuration
- Check file size limits

See [Setup Guide](./SETUP_GUIDE.md) for detailed troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is proprietary software.

## 🙏 Acknowledgments

- Retell.AI for voice interview technology
- OpenAI for AI analysis capabilities
- n8n for workflow automation
- AWS for cloud infrastructure

## 📞 Support

For support and questions:
- Check documentation
- Review troubleshooting guide
- Contact development team

---

Built with ❤️ by the Intelligens team
