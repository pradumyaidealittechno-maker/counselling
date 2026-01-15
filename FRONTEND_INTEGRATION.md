# Frontend Integration Guide

## ✅ Completed Integration

The frontend has been fully integrated with the backend API. All mock data has been removed and replaced with real API calls.

## 🔧 What Was Done

### 1. API Service Layer Created

**File:** `src/services/api.ts`

A centralized API service that handles all backend communication:

```typescript
import api from './services/api';

// Usage examples:
await api.auth.login(email, password);
await api.jobs.getAll();
await api.candidates.create(data);
await api.interviews.validateCode(code);
```

**Features:**
- Automatic token management (localStorage)
- Centralized error handling
- Type-safe API calls
- Authenticated and public endpoints

### 2. Mock Data Removed

Deleted files:
- ❌ `src/data/mockCandidates.ts`
- ❌ `src/data/mockInterviewQuestions.ts`
- ❌ `src/data/mockJobDNA.ts`
- ❌ `src/data/mockTemplates.ts`
- ❌ `src/data/index.ts`

### 3. Pages Updated with Real API

#### ✅ Login Page (`src/pages/Login.tsx`)
- Real authentication with backend
- Error handling and display
- Loading states
- Token storage

#### ✅ Signup Page (`src/pages/Signup.tsx`)
- User registration with backend
- Form validation
- Error handling
- Automatic login after signup

#### ✅ Candidate Interview Page (`src/pages/CandidateInterview.tsx`)
- Code validation via API
- Retell.AI integration via API
- Recording upload to S3 via API
- Result submission via API

## 📋 Pages That Need Integration

The following pages still need to be connected to the backend API:

### High Priority

1. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Fetch real statistics
   - Display actual jobs and candidates
   - Real-time data

2. **Candidates** (`src/pages/Candidates.tsx`)
   - List candidates from API
   - Filter and search
   - Status updates

3. **CreateJob** (`src/pages/CreateJob.tsx`)
   - Create jobs via API
   - Upload job descriptions
   - Save to database

4. **JobDNA** (`src/pages/JobDNA.tsx`)
   - Generate DNA via API
   - Display AI-generated results
   - Save DNA to job

5. **InterviewBuilder** (`src/pages/InterviewBuilder.tsx`)
   - Generate questions via n8n
   - Save questions to job
   - Customize interview flow

6. **SendInvitation** (`src/pages/SendInvitation.tsx`)
   - Create candidate via API
   - Send invitation email
   - Generate interview code

7. **AnalysisReport** (`src/pages/AnalysisReport.tsx`)
   - Fetch candidate analysis
   - Display AI scores
   - Show transcript

8. **FinalDecision** (`src/pages/FinalDecision.tsx`)
   - Update candidate decision
   - Save notes
   - Send notifications

### Medium Priority

9. **LinkedInImport** (`src/pages/LinkedInImport.tsx`)
   - Parse LinkedIn data
   - Create candidate from profile

10. **AITraining** (`src/pages/AITraining.tsx`)
    - Configure AI behavior
    - Save training data

11. **Onboarding** (`src/pages/Onboarding.tsx`)
    - Save onboarding preferences
    - Update user profile

## 🚀 How to Integrate Remaining Pages

### Step 1: Import API Service

```typescript
import api from '../services/api';
import { useState, useEffect } from 'react';
```

### Step 2: Add State Management

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

### Step 3: Fetch Data on Mount

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.jobs.getAll(); // or appropriate endpoint
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Step 4: Handle Form Submissions

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await api.jobs.create(formData);
    // Success handling
    navigate('/dashboard');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Display Loading/Error States

```typescript
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
```

## 📝 Example: Integrating Dashboard

```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    activeInterviews: 0,
    pendingDecisions: 0
  });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobs, candidates] = await Promise.all([
          api.jobs.getAll(),
          api.candidates.getAll()
        ]);

        setStats({
          totalJobs: jobs.length,
          totalCandidates: candidates.length,
          activeInterviews: candidates.filter(c => c.interviewStatus === 'in_progress').length,
          pendingDecisions: candidates.filter(c => !c.finalDecision).length
        });

        setRecentCandidates(candidates.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      {/* Display stats and recent candidates */}
    </div>
  );
}
```

## 📝 Example: Integrating Candidates List

```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await api.candidates.getAll();
        setCandidates(data);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => {
    if (filter === 'all') return true;
    return c.interviewStatus === filter;
  });

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="invited">Invited</option>
        <option value="completed">Completed</option>
      </select>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {filteredCandidates.map(candidate => (
            <div key={candidate._id}>
              {candidate.firstName} {candidate.lastName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 📝 Example: Integrating Create Job

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    requiredSkills: [],
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const job = await api.jobs.create(formData);
      navigate(`/dashboard/jobs/job-dna?jobId=${job._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="Job Title"
        required
      />

      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="Job Description"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Job'}
      </button>
    </form>
  );
}
```

## 🔐 Authentication Flow

### Login Flow
1. User enters credentials
2. `api.auth.login()` called
3. Token stored in localStorage
4. User object stored in localStorage
5. Redirect to dashboard

### Protected Routes
```typescript
import { Navigate } from 'react-router-dom';
import api from '../services/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = api.auth.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Usage in App.tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
}>
```

### Logout
```typescript
const handleLogout = () => {
  api.auth.logout();
  navigate('/login');
};
```

## 🎯 API Service Reference

### Auth
```typescript
api.auth.register(data)
api.auth.login(email, password)
api.auth.logout()
api.auth.getCurrentUser()
api.auth.getMe()
```

### Jobs
```typescript
api.jobs.getAll()
api.jobs.getById(id)
api.jobs.create(data)
api.jobs.update(id, data)
api.jobs.delete(id)
api.jobs.generateDNA(id)
api.jobs.generateQuestions(id)
```

### Candidates
```typescript
api.candidates.getAll()
api.candidates.getById(id)
api.candidates.create(data)
api.candidates.uploadResume(id, file)
api.candidates.updateDecision(id, decision, notes)
api.candidates.resendInvitation(id)
```

### Interviews
```typescript
api.interviews.validateCode(code)
api.interviews.createWebCall(agentId)
api.interviews.saveRecording(blob, name, uid)
api.interviews.submitResult(data)
```

### Upload
```typescript
api.upload.file(file, folder)
```

## ⚠️ Important Notes

1. **Environment Variables**
   - Make sure `.env` file exists with `VITE_API_URL`
   - Default: `http://localhost:3001`

2. **Error Handling**
   - All API calls should be wrapped in try-catch
   - Display user-friendly error messages
   - Log errors for debugging

3. **Loading States**
   - Always show loading indicators
   - Disable buttons during API calls
   - Prevent duplicate submissions

4. **Token Management**
   - Token automatically included in authenticated requests
   - Token stored in localStorage
   - Cleared on logout

5. **CORS**
   - Backend must allow frontend origin
   - Check `FRONTEND_URL` in backend `.env`

## 🧪 Testing Integration

### Test Login
```bash
# Start backend
cd server && npm run dev

# Start frontend
npm run dev

# Try logging in with seeded user
Email: admin@intelligens.app
Password: Admin123!
```

### Test API Calls
```typescript
// In browser console
const api = await import('./services/api');
const jobs = await api.default.jobs.getAll();
console.log(jobs);
```

## 📚 Next Steps

1. ✅ Login/Signup integrated
2. ✅ Interview page integrated
3. ⏳ Integrate Dashboard
4. ⏳ Integrate Candidates list
5. ⏳ Integrate Job creation
6. ⏳ Integrate remaining pages

## 🆘 Troubleshooting

### "Network Error"
- Check backend is running
- Verify `VITE_API_URL` in `.env`
- Check CORS settings in backend

### "401 Unauthorized"
- Token expired or invalid
- Login again
- Check token in localStorage

### "404 Not Found"
- Check API endpoint URL
- Verify route exists in backend
- Check for typos

### Data Not Displaying
- Check API response in Network tab
- Verify data structure matches frontend expectations
- Check for console errors

---

**Status:** Login, Signup, and Interview pages fully integrated. Remaining pages ready for integration using the same patterns.
