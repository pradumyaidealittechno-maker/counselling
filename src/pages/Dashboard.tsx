import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, Video, Sparkles, Plus, Upload, FileText,
  TrendingUp, ArrowUpRight
} from 'lucide-react';

const stats = [
  { label: 'Active Jobs', value: '12', icon: Briefcase, color: '#E91E63', change: '+3 this week' },
  { label: 'Candidates in Pipeline', value: '248', icon: Users, color: '#6366F1', change: '+45 this week' },
  { label: 'Interviews Completed', value: '89', icon: Video, color: '#3B82F6', change: '+12 this week' },
  { label: 'AI Recommendations', value: '34', icon: Sparkles, color: '#10B981', change: 'Pending review' },
];

const recentJobs = [
  { title: 'Senior Software Engineer', dept: 'Engineering', candidates: 45, status: 'Active' },
  { title: 'Product Manager', dept: 'Product', candidates: 32, status: 'Active' },
  { title: 'UX Designer', dept: 'Design', candidates: 28, status: 'Active' },
  { title: 'Data Scientist', dept: 'Data', candidates: 19, status: 'Draft' },
];

const recentCandidates = [
  { name: 'Sarah Johnson', role: 'Senior Software Engineer', score: 92, status: 'Interview Complete' },
  { name: 'Michael Chen', role: 'Product Manager', score: 88, status: 'AI Analysis Ready' },
  { name: 'Emily Davis', role: 'UX Designer', score: 85, status: 'Pending Interview' },
  { name: 'James Wilson', role: 'Data Scientist', score: 78, status: 'Resume Screened' },
];

export default function Dashboard() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1F2937' }}>
          Welcome back, John 👋
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Here's what's happening with your recruitment pipeline</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/dashboard/jobs/create" className="btn btn-primary btn-sm">
          <Plus size={16} /> Create Job
        </Link>
        <Link to="/dashboard/candidates" className="btn btn-secondary btn-sm">
          <Upload size={16} /> Upload Resumes
        </Link>
        <button className="btn btn-ghost btn-sm">
          <FileText size={16} /> View Reports
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `${stat.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <TrendingUp size={14} color="#10b981" />
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.125rem', color: stat.color }}>{stat.value}</p>
            <p style={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{stat.label}</p>
            <p style={{ color: '#10B981', fontSize: '0.625rem' }}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent Jobs */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>Recent Jobs</h2>
            <Link to="/dashboard/jobs/create" style={{ color: '#6366F1', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentJobs.map((job, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <p style={{ fontWeight: 500, marginBottom: '0.125rem', color: '#1F2937', fontSize: '0.875rem' }}>{job.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{job.dept} • {job.candidates} candidates</p>
                </div>
                <span className={`badge ${job.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.625rem' }}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>Recent Candidates</h2>
            <Link to="/dashboard/candidates" style={{ color: '#6366F1', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentCandidates.map((candidate, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.625rem'
                  }}>
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: '0.125rem', color: '#1F2937', fontSize: '0.875rem' }}>{candidate.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{candidate.role}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, color: '#E91E63', fontSize: '0.875rem' }}>{candidate.score}%</p>
                  <p style={{ fontSize: '0.625rem', color: '#6B7280' }}>{candidate.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div style={{
        marginTop: '1rem',
        background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
        borderRadius: '0.75rem',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.125rem', fontSize: '0.875rem' }}>
              34 AI Recommendations Ready
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
              Review AI-generated hiring recommendations for your candidates
            </p>
          </div>
        </div>
        <Link to="/dashboard/candidates" className="btn btn-sm" style={{ background: 'white', color: '#E91E63' }}>
          Review Now
        </Link>
      </div>
    </div>
  );
}
