# Setup Checklist

Use this checklist to ensure everything is properly configured.

## ☐ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command line access

## ☐ Service Accounts

### MongoDB Atlas
- [ ] Account created at https://cloud.mongodb.com
- [ ] Free cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0 for development)
- [ ] Connection string copied

### AWS
- [ ] AWS account created
- [ ] S3 bucket created (e.g., `intelligens-uploads`)
- [ ] IAM user created
- [ ] S3 permissions attached to user
- [ ] Access key ID obtained
- [ ] Secret access key obtained

### Retell.AI
- [ ] Account created at https://www.retellai.com
- [ ] AI agent created
- [ ] Agent personality configured
- [ ] API key obtained
- [ ] Agent ID copied

### OpenAI
- [ ] Account created at https://platform.openai.com
- [ ] Billing information added
- [ ] API key generated
- [ ] API key copied

### n8n (Optional but Recommended)
- [ ] n8n instance set up (cloud or self-hosted)
- [ ] Email workflow created
- [ ] Questions workflow created
- [ ] Results workflow created
- [ ] Webhook URLs copied

## ☐ Project Setup

### Clone and Install
- [ ] Repository cloned
- [ ] Root dependencies installed: `npm install`
- [ ] Server dependencies installed: `cd server && npm install`

### Backend Configuration
- [ ] `server/.env` file created from `.env.example`
- [ ] `MONGODB_URI` configured
- [ ] `JWT_SECRET` generated and set (32+ characters)
- [ ] `AWS_ACCESS_KEY_ID` set
- [ ] `AWS_SECRET_ACCESS_KEY` set
- [ ] `AWS_REGION` set
- [ ] `AWS_S3_BUCKET` set
- [ ] `RETELL_API_KEY` set
- [ ] `RETELL_AGENT_ID` set
- [ ] `OPENAI_API_KEY` set
- [ ] `N8N_WEBHOOK_EMAIL` set (if using n8n)
- [ ] `N8N_WEBHOOK_INTERVIEW_QUESTIONS` set (if using n8n)
- [ ] `N8N_WEBHOOK_INTERVIEW_RESULT` set (if using n8n)

### Frontend Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `VITE_API_URL` set to `http://localhost:3001`
- [ ] `VITE_RETELL_AGENT_ID` set

## ☐ Testing

### Backend Tests
- [ ] Backend starts without errors: `cd server && npm run dev`
- [ ] Health check works: `curl http://localhost:3001/health`
- [ ] Database connection successful (check console logs)

### Frontend Tests
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Can access http://localhost:5173
- [ ] No console errors in browser

### Database Seeding (Optional)
- [ ] Seed script runs: `cd server && npm run seed`
- [ ] Admin user created
- [ ] Sample jobs created

### API Tests
- [ ] Can register user
- [ ] Can login user
- [ ] Can create job (with auth token)
- [ ] Can invite candidate (with auth token)

### Interview Flow Test
- [ ] Candidate invitation created
- [ ] Interview code generated
- [ ] Email sent (if n8n configured)
- [ ] Interview link accessible
- [ ] Code validation works
- [ ] Camera/microphone access requested
- [ ] Interview can start
- [ ] Recording works
- [ ] Interview can complete
- [ ] Recording uploads to S3
- [ ] Analysis generated
- [ ] Results viewable

## ☐ Production Preparation

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB password is strong
- [ ] AWS credentials are restricted (not root)
- [ ] S3 bucket has proper permissions
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled

### Environment
- [ ] Production MongoDB cluster created
- [ ] Production S3 bucket created
- [ ] Production environment variables set
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled
- [ ] Frontend `VITE_API_URL` points to production API

### Deployment
- [ ] Backend built: `npm run build`
- [ ] Frontend built: `npm run build`
- [ ] Backend deployed to hosting
- [ ] Frontend deployed to hosting
- [ ] DNS configured
- [ ] SSL certificate installed

### Monitoring
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Logging configured
- [ ] MongoDB monitoring enabled
- [ ] S3 usage monitoring enabled
- [ ] API performance monitoring enabled

### Backup
- [ ] MongoDB automated backups enabled
- [ ] S3 versioning enabled
- [ ] Backup restoration tested

## ☐ Documentation Review

- [ ] Read README.md
- [ ] Read SETUP_GUIDE.md
- [ ] Read QUICK_REFERENCE.md
- [ ] Read server/README.md
- [ ] Read server/API_REFERENCE.md
- [ ] Read IMPLEMENTATION_SUMMARY.md

## ☐ Team Onboarding

- [ ] Team members have access to repositories
- [ ] Team members have MongoDB access
- [ ] Team members have AWS access (if needed)
- [ ] Team members understand interview flow
- [ ] Team members can run locally
- [ ] Documentation shared with team

## ☐ Final Verification

### Functionality
- [ ] Users can register and login
- [ ] Jobs can be created and managed
- [ ] Job DNA generation works
- [ ] Candidates can be invited
- [ ] Interview codes work correctly
- [ ] Interviews can be conducted
- [ ] Recordings are saved
- [ ] AI analysis works
- [ ] Results are viewable
- [ ] Hiring decisions can be made

### Performance
- [ ] API response times acceptable
- [ ] Frontend loads quickly
- [ ] Video recording works smoothly
- [ ] File uploads complete successfully
- [ ] Database queries are optimized

### User Experience
- [ ] UI is responsive
- [ ] Error messages are clear
- [ ] Loading states are shown
- [ ] Success confirmations displayed
- [ ] Navigation is intuitive

## 🎉 Launch Checklist

- [ ] All above items completed
- [ ] Production testing completed
- [ ] Team trained
- [ ] Documentation finalized
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Support process defined
- [ ] Launch date scheduled

---

## 📝 Notes

Use this space to track any issues or customizations:

```
Date: ___________
Issue/Note: _____________________________________
Resolution: _____________________________________

Date: ___________
Issue/Note: _____________________________________
Resolution: _____________________________________

Date: ___________
Issue/Note: _____________________________________
Resolution: _____________________________________
```

---

## 🆘 Quick Troubleshooting

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check port 3001 is not in use

**Frontend won't start:**
- Check VITE_API_URL is correct
- Verify dependencies installed
- Check port 5173 is not in use

**Can't connect to MongoDB:**
- Verify IP whitelist includes your IP
- Check connection string format
- Ensure network access configured

**S3 upload fails:**
- Verify AWS credentials
- Check bucket name and region
- Ensure bucket permissions correct

**Interview won't start:**
- Check Retell.AI credentials
- Verify agent ID is correct
- Ensure HTTPS in production

**Recording not saving:**
- Check browser permissions
- Verify S3 configuration
- Check file size limits

---

**Status:** ☐ Not Started | ⏳ In Progress | ✅ Complete

**Overall Progress:** _____ / _____ items completed

**Ready for Production:** ☐ Yes | ☐ No

**Launch Date:** ___________
