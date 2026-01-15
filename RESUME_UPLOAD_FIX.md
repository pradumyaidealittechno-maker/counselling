# Resume Upload Fix

## Problem
Resume upload was failing with validation errors:
1. `jobId: Path 'jobId' is required` - Missing required field
2. `'resume_uploaded' is not a valid enum value for path 'interviewStatus'` - Invalid status value

## Root Causes
1. **Backend**: Used invalid `interviewStatus` value `'resume_uploaded'` (not in enum)
2. **Backend**: Allowed `jobId` to be undefined when not provided
3. **Frontend**: Made job selection optional when uploading resumes

## Fixes Applied

### Backend (`server/src/routes/candidate.routes.ts`)
- ✅ Added validation to require `jobId` in request body
- ✅ Added verification that the job exists before creating candidate
- ✅ Changed `interviewStatus` from `'resume_uploaded'` to `'pending'` (valid enum value)
- ✅ Removed invalid `source: 'resume_upload'` field (not in schema)

### Frontend (`src/pages/Candidates.tsx`)
- ✅ Added validation to require job selection before upload
- ✅ Show alert if user tries to upload without selecting a job
- ✅ Disabled upload button when no job is selected
- ✅ Added tooltip to guide users: "Please select a job first"
- ✅ Always include `jobId` in FormData when uploading

## Valid Interview Status Values
The Candidate schema only accepts these values:
- `'pending'` - Initial state after resume upload
- `'invited'` - Invitation sent to candidate
- `'in_progress'` - Interview in progress
- `'completed'` - Interview completed
- `'expired'` - Interview code expired

## Testing
1. Navigate to Candidates page
2. Try clicking "Upload Resumes" without selecting a job → Button should be disabled
3. Select a job from the dropdown
4. Click "Upload Resumes" and select a file
5. Resume should upload successfully with status `'pending'`
