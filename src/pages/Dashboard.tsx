import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Video, Sparkles, Plus, Upload, FileText,
  TrendingUp, ArrowUpRight, Dna, CheckCircle, Clock, Loader
} from 'lucide-react';
import api from '../services/api';

interface Job {
  _id: string;
  title: string;
  department: string;
  status: string;
  jobDNA?: any;
  createdAt: string;
}

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  interviewResult?: {
    overallScore?: number;
    recommendation?: string;
  };
  job?: {
    title: string;
  };
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = api.auth.getCurrentUser();
      if (user) {
        setUserName(user.firstName || 'User');
      }

      const [jobsData, candidatesData] = await Promise.all([
        api.jobs.getAll().catch(() => []),
        api.candidates.getAll().catch(() => [])
      ]);

      setJobs(jobsData || []);
      setCandidates(candidatesData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Jobs', value: jobs.filter(j => j.status === 'active').length.toString(), icon: Briefcase, color: '#E91E63', link: '/dashboard/jobs' },
    { label: 'Candidates in Pipeline', value: candidates.length.toString(), icon: Users, color: '#6366F1', link: '/dashboard/candidates' },
    { label: 'Interviews Completed', value: candidates.filter(c => c.status === 'interview_complete' || c.interviewResult).length.toString(), icon: Video, color: '#3B82F6', link: '/dashboard/interviews' },
    { label: 'AI Recommendations', value: candidates.filter(c => c.interviewResult?.recommendation).length.toString(), icon: Sparkles, color: '#10B981', link: '/dashboard/reports' },
  ];

  const jobsWithDNA = jobs.filter(j => j.jobDNA);
  const jobsPendingDNA = jobs.filter(j => !j.jobDNA);
  const avgDNAMatch = candidates.length > 0
    ? Math.round(candidates.reduce((acc, c) => acc + (c.interviewResult?.overallScore || 0), 0) / candidates.length)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Here's what's happening with your recruitment pipeline</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/dashboard/jobs/create" className="btn btn-primary btn-sm">
          <Plus size={16} /> Create Job
        </Link>
        <Link to="/dashboard/candidates" className="btn btn-secondary btn-sm">
          <Upload size={16} /> Upload Resumes
        </Link>
        <Link to="/dashboard/reports"
          className="btn btn-sm"
          style={{
            background: 'var(--white)',
            border: '1px solid rgb(59, 130, 246)',
            color: 'rgb(59, 130, 246)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <FileText size={16} /> View Reports
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map((stat, i) => {
          const Content = (
            <>
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
                <TrendingUp size={14} color="#10B981" />
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.125rem', color: stat.color }}>{stat.value}</p>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>{stat.label}</p>
            </>
          );

          return stat.link ? (
            <Link key={i} to={stat.link} className="card" style={{ padding: '1rem', textDecoration: 'none', display: 'block', transition: 'transform 0.2s' }}>
              {Content}
            </Link>
          ) : (
            <div key={i} className="card" style={{ padding: '1rem' }}>
              {Content}
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent Jobs */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1.1rem' }}>Recent Jobs</h2>
            <Link to="/dashboard/jobs" style={{ color: 'var(--secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                <Briefcase size={32} color="#D1D5DB" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>No jobs yet</p>
                <Link to="/dashboard/jobs/create" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  <Plus size={14} /> Create First Job
                </Link>
              </div>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <Link key={job._id} to={`/dashboard/jobs/${job._id}/job-dna`} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--gray-50)',
                  borderRadius: '0.5rem',
                  textDecoration: 'none'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                      <p style={{ fontWeight: 500, color: 'var(--gray-900)', fontSize: '0.95rem' }}>{job.title}</p>
                      <span style={{
                        padding: '0.125rem 0.375rem',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: job.jobDNA ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: job.jobDNA ? '#059669' : '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.125rem'
                      }}>
                        <Dna size={8} />
                        {job.jobDNA ? 'DNA Ready' : 'DNA Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{job.department || 'No department'}</p>
                  </div>
                  <span
                    className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                    style={{ fontSize: '0.95rem' }}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>

                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1.1rem' }}>Recent Candidates</h2>
            <Link to="/dashboard/candidates" style={{ color: 'var(--secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                <Users size={32} color="#D1D5DB" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>No candidates yet</p>
                <Link to="/dashboard/candidates/invite" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                  <Plus size={14} /> Add Candidate
                </Link>
              </div>
            ) : (
              candidates.slice(0, 4).map((candidate) => (
                <div key={candidate._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--gray-50)',
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
                      {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 500, marginBottom: '0.125rem', color: 'var(--gray-900)', fontSize: '0.95rem' }}>
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <p style={{ fontSize: '0.95rem', color: 'var(--gray-500)' }}>{candidate.job?.title || 'No job assigned'}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {candidate.interviewResult?.overallScore ? (
                      <>
                        <p style={{ fontWeight: 600, color: '#E91E63', fontSize: '0.875rem' }}>{candidate.interviewResult.overallScore}%</p>
                        <p style={{ fontSize: '0.625rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <Dna size={10} /> DNA Match
                        </p>
                      </>
                    ) : (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#D97706'
                      }}>
                        {candidate.status || 'Pending'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
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
              {candidates.filter(c => c.interviewResult?.recommendation).length} AI Recommendations Ready
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
              Review AI-generated hiring recommendations powered by Job DNA™
            </p>
          </div>
        </div>
        <Link to="/dashboard/reports" className="btn btn-sm" style={{ background: 'var(--white)', color: '#E91E63' }}>
          Review Now
        </Link>
      </div>

      {/* DNA Stats Row */}
      <div style={{
        marginTop: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(233, 30, 99, 0.05)',
          border: '1px solid rgba(233, 30, 99, 0.15)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Dna size={24} color="#E91E63" />
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E91E63' }}>{avgDNAMatch}%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Avg DNA Match</p>
          </div>
        </div>
        <div style={{
          padding: '1rem',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={24} color="#10B981" />
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>{jobsWithDNA.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Jobs DNA Ready</p>
          </div>
        </div>
        <div style={{
          padding: '1rem',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Clock size={24} color="#F59E0B" />
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F59E0B' }}>{jobsPendingDNA.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>DNA Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
