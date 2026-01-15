import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Filter, Mail, MoreVertical, FileText, Eye, Dna, TrendingUp, Users, Loader } from 'lucide-react';
import api from '../services/api';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  experience?: string;
  interviewResult?: {
    overallScore?: number;
    recommendation?: string;
  };
  job?: {
    _id: string;
    title: string;
  };
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
    'interview_complete': { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)', label: 'Interview Complete' },
    'ai_analysis_ready': { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63', border: 'rgba(233, 30, 99, 0.3)', label: 'AI Analysis Ready' },
    'pending_interview': { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706', border: 'rgba(245, 158, 11, 0.3)', label: 'Pending Interview' },
    'invited': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)', label: 'Invited' },
    'resume_screened': { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366F1', border: 'rgba(99, 102, 241, 0.3)', label: 'Resume Screened' },
    'decision_made': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', border: 'rgba(107, 114, 128, 0.3)', label: 'Decision Made' },
    'new': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)', label: 'New' }
  };
  return configs[status] || configs['new'];
};

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if jobId is in URL params
    const params = new URLSearchParams(window.location.search);
    const jobIdParam = params.get('jobId');
    if (jobIdParam) {
      setSelectedJobId(jobIdParam);
    }
    
    loadCandidates();
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.jobs.getAll();
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await api.candidates.getAll();
      setCandidates(data || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Require job selection
    if (!selectedJobId) {
      alert('Please select a job before uploading resumes.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      
      // Upload each resume
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', selectedJobId);

        await api.candidates.uploadResume(formData);
      }

      // Reload candidates
      await loadCandidates();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to upload resumes:', err);
      alert('Failed to upload resumes. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = !selectedJobId || c.job?._id === selectedJobId;
    return matchesSearch && matchesJob;
  });

  const candidatesWithAnalysis = candidates.filter(c => c.interviewResult?.overallScore);
  const avgScore = candidatesWithAnalysis.length > 0
    ? Math.round(candidatesWithAnalysis.reduce((acc, c) => acc + (c.interviewResult?.overallScore || 0), 0) / candidatesWithAnalysis.length)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading candidates...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Candidates</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Manage and track all candidates in your pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/candidates/invite" className="btn btn-secondary btn-sm">
            <Mail size={16} /> Send Invitation
          </Link>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            multiple
            style={{ display: 'none' }}
          />
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleUploadClick}
            disabled={uploading || !selectedJobId}
            title={!selectedJobId ? 'Please select a job first' : 'Upload resumes for selected job'}
          >
            {uploading ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} /> Upload Resumes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Users size={16} color="#6366F1" />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Candidates</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366F1' }}>{candidates.length}</p>
        </div>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Dna size={16} color="#E91E63" />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Avg DNA Match</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E91E63' }}>{avgScore}%</p>
        </div>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={16} color="#10B981" />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Interviews Done</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
            {candidates.filter(c => c.status === 'interview_complete' || c.status === 'ai_analysis_ready').length}
          </p>
        </div>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Mail size={16} color="#F59E0B" />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Pending</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>
            {candidates.filter(c => c.status === 'pending_interview' || c.status === 'invited').length}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div style={{
        border: '2px dashed #E5E7EB',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        textAlign: 'center',
        marginBottom: '1rem',
        background: '#F9FAFB'
      }}>
        <Upload size={24} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
        <p style={{ fontWeight: 500, marginBottom: '0.125rem', fontSize: '0.875rem' }}>Drag and drop resumes here</p>
        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>or click to browse (PDF, DOC, DOCX)</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Search candidates..." 
            style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={selectedJobId || ''}
          onChange={(e) => setSelectedJobId(e.target.value || null)}
          style={{ minWidth: '200px', fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Candidates Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Candidate</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Experience</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <Dna size={12} />
                  DNA Match
                </div>
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                  <Users size={40} color="#D1D5DB" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>No candidates found</p>
                  <Link to="/dashboard/candidates/invite" className="btn btn-primary btn-sm">
                    <Mail size={14} /> Invite First Candidate
                  </Link>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => {
                const statusConfig = getStatusConfig(candidate.status);
                const score = candidate.interviewResult?.overallScore;
                const decision = candidate.interviewResult?.recommendation;
                const initials = `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`;
                
                return (
                  <tr key={candidate._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.6875rem'
                        }}>{initials}</div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{candidate.firstName} {candidate.lastName}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#6B7280' }}>{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{candidate.job?.title || 'Not assigned'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{candidate.experience || 'N/A'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {score ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: score >= 90 ? '#10B981' : score >= 80 ? '#E91E63' : '#F59E0B'
                          }}>{score}%</span>
                          {decision && (
                            <span style={{
                              fontSize: '0.5625rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '9999px',
                              background: decision === 'Hire' ? 'rgba(16, 185, 129, 0.1)' : decision === 'Hold' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: decision === 'Hire' ? '#059669' : decision === 'Hold' ? '#D97706' : '#DC2626',
                              fontWeight: 500
                            }}>
                              AI: {decision}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        background: statusConfig.bg,
                        color: statusConfig.text,
                        border: `1px solid ${statusConfig.border}`
                      }}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        {(candidate.status === 'interview_complete' || candidate.status === 'ai_analysis_ready') ? (
                          <Link to={`/dashboard/candidates/${candidate._id}/report`} className="btn btn-sm btn-primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.6875rem' }}>
                            <Eye size={12} /> View Report
                          </Link>
                        ) : candidate.status === 'pending_interview' || candidate.status === 'invited' ? (
                          <button className="btn btn-sm btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.6875rem' }}>
                            <Mail size={12} /> Resend Invite
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.6875rem' }}>
                            <FileText size={12} /> View Resume
                          </button>
                        )}
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                          <MoreVertical size={14} color="#6B7280" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DNA Consistency Notice */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        background: 'rgba(233, 30, 99, 0.05)',
        border: '1px solid rgba(233, 30, 99, 0.15)',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Dna size={18} color="#E91E63" />
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#BE185D' }}>Fair Evaluation Guarantee</p>
          <p style={{ fontSize: '0.6875rem', color: '#9D174D' }}>
            All candidates are evaluated against the same Job DNA™ framework ensuring consistent, unbiased assessment.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
