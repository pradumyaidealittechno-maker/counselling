import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import CreateJob from './pages/CreateJob';
import LinkedInImport from './pages/LinkedInImport';
import JobDNA from './pages/JobDNA';
import AITraining from './pages/AITraining';
import InterviewBuilder from './pages/InterviewBuilder';
import Candidates from './pages/Candidates';
import SendInvitation from './pages/SendInvitation';
import VideoInterview from './pages/VideoInterview';
import CandidateInterview from './pages/CandidateInterview';
import InterviewComplete from './pages/InterviewComplete';
import AnalysisReport from './pages/AnalysisReport';
import FinalDecision from './pages/FinalDecision';
import InterviewManagement from './pages/InterviewManagement';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Interview Routes (Candidate-facing) */}
          <Route path="/interview" element={<VideoInterview />} />
          <Route path="/interview/:id" element={<CandidateInterview />} />
          <Route path="/interview-complete" element={<InterviewComplete />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/create" element={<CreateJob />} />
            <Route path="jobs/linkedin-import" element={<LinkedInImport />} />
            <Route path="jobs/job-dna" element={<JobDNA />} />
            <Route path="jobs/:jobId/job-dna" element={<JobDNA />} />
            <Route path="jobs/:jobId/ai-training" element={<AITraining />} />
            <Route path="jobs/:jobId/interview-builder" element={<InterviewBuilder />} />
            <Route path="jobs/interview-builder" element={<InterviewBuilder />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/invite" element={<SendInvitation />} />
            <Route path="candidates/:id/report" element={<AnalysisReport />} />
            <Route path="candidates/:id/decision" element={<FinalDecision />} />
            <Route path="interviews" element={<InterviewManagement />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

