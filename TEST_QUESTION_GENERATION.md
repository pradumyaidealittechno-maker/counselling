# Test Question Generation

## Issue
Questions are not being generated - response is `{"questions":[]}`

## Possible Causes

### 1. Job DNA Not Generated
From the job data provided:
```json
{
  "jobDNA": {,…},  // Collapsed in browser
  "interviewQuestions": []
}
```

**Check**: Is jobDNA actually populated with traits?
- Open browser console
- Expand the jobDNA object
- Verify it has: skillDNA, experienceDNA, behavioralDNA, communicationDNA, culturalDNA arrays

**If jobDNA is empty `{}`**:
1. Go to Job DNA page
2. Click "Generate Job DNA"
3. Wait for DNA to be generated
4. Click "Approve and Train AI"
5. Then try generating questions

### 2. OpenAI API Response Format
The AI might be returning an unexpected format.

**Added Logging**:
- Server now logs: "Generated questions count: X"
- Server logs the jobDNA keys
- Server logs if questions were saved

### 3. Mock Mode Not Triggering
If OpenAI API key is invalid, mock mode should trigger.

**Check Server Logs For**:
- `🎭 Using mock interview questions generation` - Mock mode
- `🤖 Using OpenAI API for interview questions generation` - Real API
- `✅ Generated questions: X` - How many questions were generated

## Testing Steps

### Step 1: Check Job DNA
```bash
# In browser console on Job DNA page
console.log(job.jobDNA);
```

Expected output:
```javascript
{
  skillDNA: [{id, name, description, importance, signals}, ...],
  experienceDNA: [...],
  behavioralDNA: [...],
  communicationDNA: [...],
  culturalDNA: [...]
}
```

If empty `{}`, generate DNA first!

### Step 2: Check Server Logs
Look for these logs when generating questions:
```
🎯 Generating questions for job: Core Features.2 (1)
📊 Job has DNA: true/false
🤖 Using OpenAI API for interview questions generation
📋 Job Data: { title: '...', hasDNA: true, dnaKeys: [...], ... }
✅ Generated questions count: 8
💾 Saved questions to database
```

### Step 3: Test with Mock Mode
If OpenAI isn't working, mock mode should generate 8 questions automatically.

Check for:
```
🎭 Using mock interview questions generation (OpenAI API key not configured)
```

### Step 4: Check Database
After generation, check if questions were saved:
```javascript
// In browser console
api.jobs.getById('696796966b55d8a074bc0a7f').then(job => {
  console.log('Questions:', job.interviewQuestions.length);
  console.log(job.interviewQuestions);
});
```

## Common Issues

### Issue 1: Job DNA Not Generated
**Symptom**: `jobDNA: {}` or `jobDNA: null`

**Solution**:
1. Navigate to `/dashboard/jobs/{jobId}/job-dna`
2. Click "Generate Job DNA"
3. Wait for generation to complete
4. Click "Approve and Train AI"
5. Navigate to Interview Builder
6. Click "Generate Questions from DNA"

### Issue 2: OpenAI Returns Empty Array
**Symptom**: Server logs show "Generated questions count: 0"

**Solution**: Check server logs for OpenAI error. If API key is invalid, mock mode should trigger automatically.

### Issue 3: Questions Generated But Not Saved
**Symptom**: Server logs show questions generated but database has empty array

**Solution**: Check for save errors in server logs. Verify Job model schema matches question structure.

### Issue 4: Frontend Not Updating
**Symptom**: Questions generated and saved but UI shows empty

**Solution**: 
1. Check browser console for errors
2. Verify API response in Network tab
3. Check if InterviewBuilder is reloading job data after generation

## Debug Commands

### Check Job in Database
```javascript
// In browser console
const jobId = '696796966b55d8a074bc0a7f';
api.jobs.getById(jobId).then(job => {
  console.log('Job DNA exists:', !!job.jobDNA);
  console.log('Job DNA keys:', Object.keys(job.jobDNA || {}));
  console.log('Questions count:', job.interviewQuestions?.length || 0);
});
```

### Manually Trigger Generation
```javascript
// In browser console
const jobId = '696796966b55d8a074bc0a7f';
api.jobs.generateQuestions(jobId).then(result => {
  console.log('Generated:', result.questions.length, 'questions');
  console.log(result.questions);
}).catch(err => {
  console.error('Error:', err);
});
```

### Check Server Environment
```bash
# In server directory
node -e "require('dotenv').config({ path: '.env' }); console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? 'Configured' : 'Missing');"
```

## Expected Behavior

### With Job DNA
1. User clicks "Generate Questions from DNA"
2. Server receives request with job data including jobDNA
3. AI service generates 8-12 questions mapped to DNA traits
4. Questions saved to database
5. Response: `{"questions": [8-12 question objects]}`
6. UI displays questions

### Without Job DNA
1. User clicks "Generate Questions from DNA"
2. Server receives request with job data but no jobDNA
3. AI service generates 8 generic questions based on job description
4. Questions saved to database
5. Response: `{"questions": [8 question objects]}`
6. UI displays questions

## Next Steps

1. **Check server logs** when generating questions
2. **Verify Job DNA exists** in the job object
3. **Test with mock mode** to isolate OpenAI issues
4. **Check browser console** for frontend errors
5. **Verify database** has questions after generation

If questions still don't generate, provide:
- Server logs from question generation
- Job DNA object structure
- Browser console errors
