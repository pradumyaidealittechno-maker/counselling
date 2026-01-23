# Interview Feedback Feature

## Overview
The **Send Interview Feedback** feature allows HR managers to send professional feedback emails to candidates who have completed their interviews. This feature supports both positive (selected) and rejection feedback templates.

## Feature Location
**URL:** `/dashboard/candidates/feedback`

**Navigation:**
- Dashboard → Candidates → **Send Feedback** button (top-right)

---

## Key Features

### 1. **Dual Feedback Types**
- ✅ **Selected (Positive)** - Congratulations email for successful candidates
- ❌ **Not Selected** - Polite rejection email

### 2. **Auto-Generated Interview Code**
- Automatically generates a unique interview code
- Code format: `PVI956AD` (8 characters)
- Valid for 7 days

### 3. **Interview Link**
- Auto-generates interview link with code
- Format: `http://localhost:5173/interview?code=PVI956AD`
- One-click copy functionality

### 4. **Email Customization**
- Edit recipient name (First & Last)
- Edit email address
- Customize subject line
- Edit entire email message

### 5. **Smart Candidate Filtering**
- Only shows candidates with status:
  - `interview_complete`
  - `ai_analysis_ready`

---

## Email Templates

### ✅ **Selected (Positive Feedback)**

**Subject:** `Interview Feedback – Selected (Positive Result)`

**Body:**
```
Dear [Candidate Name],

Thank you for participating in the AI-powered interview for the position of [Job Title].

We are pleased to inform you that you have successfully cleared the interview round. Your technical skills, problem-solving approach, and overall performance met our expectations.

Your Interview Code: [CODE]
Interview Link: [LINK]

Our team was particularly impressed with:
  • Your understanding of full-stack concepts
  • Your approach to real-world problem solving
  • Your communication and clarity

The next steps regarding onboarding and further discussions will be shared with you shortly.

If you have any questions in the meantime, feel free to reach out.

Congratulations, and we look forward to working with you!

Best regards,
HR Team
```

---

### ❌ **Not Selected (Rejection Feedback)**

**Subject:** `Interview Feedback – Thank You`

**Body:**
```
Dear [Candidate Name],

Thank you for taking the time to participate in the AI-powered interview for the position of [Job Title].

We appreciate your interest in joining our team and the effort you put into the interview process.

Your Interview Code: [CODE]

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We encourage you to apply for future openings that align with your skills and experience. We will keep your resume on file for consideration.

We wish you all the best in your job search and future endeavors.

Best regards,
HR Team
```

---

## How to Use

### Step 1: Navigate to Feedback Page
1. Go to **Dashboard**
2. Click **Candidates** in sidebar
3. Click **Send Feedback** button (top-right)

### Step 2: Select Feedback Type
Choose between:
- **Selected (Positive)** - Green button with thumbs up icon
- **Not Selected** - Gray button with mail icon

### Step 3: Select Candidate
1. Click **Select Candidate** dropdown
2. Choose from candidates who completed interviews
3. Details auto-populate:
   - First Name
   - Last Name
   - Email
   - Interview Code (auto-generated)

### Step 4: Review & Edit Email
1. Check the auto-generated email content
2. Edit any field as needed:
   - First Name / Last Name
   - Email Address
   - Subject
   - Message body
3. Interview link is auto-generated and included

### Step 5: Send Feedback
1. Click **Send Feedback** button
2. Email is sent via N8N webhook
3. Success confirmation appears
4. Redirects to Candidates page

---

## UI Components

### Main Form Area
- **Feedback Type Toggle:** Switch between Selected/Rejected
- **Candidate Selector:** Dropdown with eligible candidates
- **Name Fields:** First & Last name (editable)
- **Email Field:** Candidate email (editable)
- **Interview Code Display:** Auto-generated, copy-able
- **Email Editor:** Subject + Message body
- **Interview Link Toolbar:** Copy and open link options

### Right Sidebar
- **Feedback Details Card:**
  - Shows current feedback type
  - Dynamic color (green for selected, red for rejected)
  - Describes what's included in email

- **Best Practices:**
  - Be prompt with feedback
  - Keep tone professional
  - Personalize when possible
  - Provide constructive points
  - Thank them for their time

- **Tips:**
  - Context-aware tips based on feedback type
  - Positive: Build excitement
  - Negative: Maintain reputation

---

## API Integration

### Endpoint (To be created in backend)
```
POST /api/candidates/:candidateId/send-feedback
```

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "subject": "Interview Feedback – Selected (Positive Result)",
  "message": "Email body content...",
  "feedbackType": "selected" // or "rejected"
}
```

### Response
```json
{
  "success": true,
  "message": "Feedback sent successfully"
}
```

---

## Design Highlights

### Visual Feedback
- **Selected mode:**
  - Green accent colors (#10B981)
  - Thumbs up icon
  - Positive messaging
  - Congratulations tone

- **Not Selected mode:**
  - Red accent colors (#EF4444)
  - Mail icon
  - Professional tone
  - Respectful language

### Responsive Design
- Mobile-friendly layout
- Buttons stack on small screens
- Email editor is scrollable
- Touch-friendly tap targets

---

## Benefits

1. **Professional Communication**
   - Standardized templates
   - Consistent messaging
   - Professional tone

2. **Time Saving**
   - Auto-populated fields
   - Template-based content
   - Quick customization

3. **Candidate Experience**
   - Timely feedback
   - Clear next steps
   - Maintains positive relationship

4. **Brand Reputation**
   - Professional rejections
   - Positive candidate experience
   - Encourages re-applications

---

## Comparison with Send Invitation

| Feature | Send Invitation | Send Feedback |
|---------|----------------|---------------|
| **Purpose** | Invite to interview | Share results |
| **Timing** | Before interview | After interview |
| **Tone** | Instructional | Congratulatory/Respectful |
| **Candidates** | All candidates | Interview completed only |
| **Templates** | 1 (Invitation) | 2 (Selected/Rejected) |
| **Interview Link** | Required | Optional/Reference |

---

## Future Enhancements

- [ ] Template library with multiple variations
- [ ] Bulk feedback sending
- [ ] Schedule feedback for later
- [ ] Candidate rating integration
- [ ] Feedback analytics dashboard
- [ ] Custom email templates per job
- [ ] Multi-language support
- [ ] Attachment support (offer letters)

---

## Testing Checklist

- [ ] Select feedback type (Selected)
- [ ] Choose candidate from dropdown
- [ ] Verify auto-populated fields
- [ ] Generate interview code
- [ ] Copy interview link
- [ ] Edit email content
- [ ] Send feedback successfully
- [ ] Switch to "Not Selected"
- [ ] Verify template changes
- [ ] Test with different candidates
- [ ] Check mobile responsiveness

---

## Support

For issues or questions about the Interview Feedback feature:
1. Check candidate has `interview_complete` status
2. Verify backend API endpoint is configured
3. Ensure N8N webhook is set up
4. Check browser console for errors

---

**Created:** January 23, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Use
