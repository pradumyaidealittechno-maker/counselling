# AI Training Page Navigation Fix

## Issue
When clicking "View Interview Questions" from the AI Training page, it redirected to `/dashboard/jobs/interview-builder` without a jobId, so no questions were displayed.

## Root Cause
1. The AITraining page route didn't include `:jobId` parameter
2. JobDNA was navigating to ai-training without passing jobId
3. AITraining was navigating to interview-builder without passing jobId

## Solution

### 1. Updated Route Definition
**File**: `src/App.tsx`

Changed:
```typescript
<Route path="jobs/ai-training" element={<AITraining />} />
```

To:
```typescript
<Route path="jobs/:jobId/ai-training" element={<AITraining />} />
```

### 2. Updated JobDNA Navigation
**File**: `src/pages/JobDNA.tsx`

Changed:
```typescript
const handleApprove = () => {
  navigate('/dashboard/jobs/ai-training');
};
```

To:
```typescript
const handleApprove = () => {
  if (job?._id) {
    navigate(`/dashboard/jobs/${job._id}/ai-training`);
  } else {
    navigate('/dashboard/jobs/interview-builder');
  }
};
```

### 3. Updated AITraining Component
**File**: `src/pages/AITraining.tsx`

Added jobId from route params:
```typescript
import { useNavigate, useParams } from 'react-router-dom';

export default function AITraining() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  // ...
}
```

Updated navigation button:
```typescript
onClick={() => navigate(jobId 
  ? `/dashboard/jobs/${jobId}/interview-builder` 
  : '/dashboard/jobs/interview-builder'
)}
```

## Complete Navigation Flow (Now Fixed)

```
JobDNA Page
  ↓ User clicks "Approve and Train AI"
  ↓ Navigate to /dashboard/jobs/{jobId}/ai-training
  ↓
AI Training Page
  ↓ Shows training animation
  ↓ User clicks "View Interview Questions"
  ↓ Navigate to /dashboard/jobs/{jobId}/interview-builder
  ↓
Interview Builder Page
  ↓ Loads job by jobId
  ↓ Displays interview questions from job.interviewQuestions
```

## Testing

1. ✅ Create a job
2. ✅ Generate Job DNA
3. ✅ Click "Approve and Train AI"
4. ✅ Verify URL is `/dashboard/jobs/{jobId}/ai-training`
5. ✅ Wait for training to complete
6. ✅ Click "View Interview Questions"
7. ✅ Verify URL is `/dashboard/jobs/{jobId}/interview-builder`
8. ✅ Verify interview questions are displayed (if they exist)

## Related Files
- `src/App.tsx` - Route definitions
- `src/pages/JobDNA.tsx` - Navigation to AI Training
- `src/pages/AITraining.tsx` - Navigation to Interview Builder
- `src/pages/InterviewBuilder.tsx` - Displays questions

## Note
If no interview questions exist yet, the InterviewBuilder will show a "Generate Interview Questions" button. This is expected behavior - questions need to be generated first using the "Generate Questions from DNA" button.
