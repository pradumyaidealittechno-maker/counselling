import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Onboarding from './pages/Onboarding';
import Jobs from './pages/Jobs';
import CreateJob from './pages/CreateJob';
import LinkedInImport from './pages/LinkedInImport';
import JobDNA from './pages/JobDNA';
import AITraining from './pages/AITraining';
import InterviewBuilder from './pages/InterviewBuilder';
import Candidates from './pages/Candidates';
import SendInvitation from './pages/SendInvitation';
import SendFeedback from './pages/SendFeedback';
import VideoInterview from './pages/VideoInterview';
import CandidateInterview from './pages/CandidateInterview';
import InterviewComplete from './pages/InterviewComplete';
import AnalysisReport from './pages/AnalysisReport';
import Reports from './pages/Reports';
import FinalDecision from './pages/FinalDecision';
import InterviewManagement from './pages/InterviewManagement';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CandidateFeedback from './pages/CandidateFeedback';
import CandidateDetails from './pages/CandidateDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import DashboardLayout from './components/DashboardLayout';
import DashboardRouter from './components/DashboardRouter';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import StudentProfile from './pages/StudentProfile';
import CreateCourse from './pages/CreateCourse';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import EditCourse from './pages/EditCourse';
import Sessions from './pages/Sessions';
import ScheduleSession from './pages/ScheduleSession';
import SessionDetails from './pages/SessionDetails';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import Assessments from './pages/Assessments';
import AssessmentRunner from './pages/AssessmentRunner';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Interview Routes (Candidate-facing) */}
        <Route path="/interview" element={<VideoInterview />} />
        <Route path="/interview/:id" element={<CandidateInterview />} />
        <Route path="/interview-complete" element={<InterviewComplete />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Assessment Runner (Distraction Free) */}
        <Route path="/assessment/run/:id" element={<AssessmentRunner />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardRouter />} />
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
          <Route path="candidates/:id" element={<CandidateDetails />} />
          <Route path="candidates/feedback" element={<SendFeedback />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<AnalysisReport />} />
          <Route path="reports/:id/decision" element={<FinalDecision />} />
          <Route path="candidates/:id/report" element={<AnalysisReport />} />
          <Route path="candidates/:id/feedback" element={<CandidateFeedback />} />
          <Route path="candidates/:id/decision" element={<FinalDecision />} />
          <Route path="interviews" element={<InterviewManagement />} />
          <Route path="students" element={<Students />} />
          <Route path="students/new" element={<AddStudent />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="courses/edit/:id" element={<EditCourse />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/schedule" element={<ScheduleSession />} />
          <Route path="sessions/:id" element={<SessionDetails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="resources" element={<Resources />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

