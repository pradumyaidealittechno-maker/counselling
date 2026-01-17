import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Mail, MoreVertical, FileText, Dna, TrendingUp, Users, Plus, Loader } from 'lucide-react';
import api from '../services/api';
import AddCandidateDialog from '../components/AddCandidateDialog';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  experience?: string;
  resume?: {
    url: string;
    fileName: string;
  };
  resumeUrl?: string;
  interviewResult?: {
    overallScore?: number;
    recommendation?: string;
  };
  jobId: {
    _id: string;
    title: string;
    department?: string;
  };
  job?: { // Keep for backward compatibility if needed
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
    'new': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)', label: 'New' },
    'pending': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', border: 'rgba(107, 114, 128, 0.3)', label: 'Pending Resume' }
  };
  return configs[status] || configs['new'];
};

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string }>>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [candidateToUploadResume, setCandidateToUploadResume] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const singleFileInputRef = useRef<HTMLInputElement>(null);
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
      // Backend returns { candidates: [...], pagination: {...} }
      setCandidates(data?.candidates || data || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!selectedJobId) {
      alert('⚠️ Please select a job first!\n\nUse the dropdown above to select a job before uploading resumes.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !candidateToUploadResume) return;

    try {
      setLoading(true); // Use global loading since we removed uploading state
      const file = files[0];
      await api.candidates.uploadResumeForCandidate(candidateToUploadResume, file);

      // Reload candidates
      await loadCandidates();

      setCandidateToUploadResume(null);
      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to upload resume:', err);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSingleUpload = (candidateId: string) => {
    setCandidateToUploadResume(candidateId);
    singleFileInputRef.current?.click();
  };

  const handleDelete = async (candidateId: string) => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        await api.candidates.delete(candidateId);
        await loadCandidates();
      } catch (err) {
        console.error('Failed to delete candidate:', err);
        alert('Failed to delete candidate. Please try again.');
      }
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const term = searchTerm.toLowerCase();
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term);
    const matchesJob = !selectedJobId || (c.jobId as any)?._id === selectedJobId || c.job?._id === selectedJobId;

    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      const createdAt = (c as any).createdAt;
      if (createdAt) {
        try {
          const candidateDate = new Date(createdAt);
          const filterDate = new Date(dateFilter);
          matchesDate = candidateDate.toDateString() === filterDate.toDateString();
        } catch {
          matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }

    // Status filter
    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesJob && matchesDate && matchesStatus;
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--gray-900)' }}>Candidates</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Manage and track all candidates in your pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus size={16} /> Add Candidate
          </button>

          <Link to="/dashboard/candidates/invite" className="btn btn-primary btn-sm">
            <Mail size={16} /> Send Invitation
          </Link>


          <input
            type="file"
            ref={singleFileInputRef}
            onChange={handleSingleFileUpload}
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Users size={16} color="#6366F1" />
            <span style={{ fontSize: '0.95rem' }}>Total Candidates</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366F1' }}>{candidates.length}</p>
        </div>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Dna size={16} color="#E91E63" />
            <span style={{ fontSize: '0.95rem' }}>Avg DNA Match</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E91E63' }}>{avgScore}%</p>
        </div>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={16} color="#10B981" />
            <span style={{ fontSize: '0.95rem' }}>Interviews Done</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
            {candidates.filter(c => c.status === 'interview_complete' || c.status === 'ai_analysis_ready').length}
          </p>
        </div>
        <div className="card" style={{ padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Mail size={16} color="#F59E0B" />
            <span style={{ fontSize: '0.95rem' }}>Pending</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>
            {candidates.filter(c => ['new', 'resume_screened', 'invited', 'pending_interview'].includes(c.status)).length}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {/* <div
        onClick={handleUploadClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!selectedJobId) {
            alert('Please select a job before uploading resumes.');
            return;
          }
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            // Manually create a change event for the file input
            const dt = new DataTransfer();
            Array.from(files).forEach(file => dt.items.add(file));
            if (fileInputRef.current) {
              fileInputRef.current.files = dt.files;
              handleSingleFileUpload({ target: fileInputRef.current } as any);
            }
          }
        }}
        style={{
          border: '2px dashed var(--gray-200)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          textAlign: 'center',
          marginBottom: '1rem',
          background: 'var(--gray-50)',
          cursor: selectedJobId ? 'pointer' : 'not-allowed',
          opacity: selectedJobId ? 1 : 0.6,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (selectedJobId) {
            e.currentTarget.style.borderColor = '#E91E63';
            e.currentTarget.style.background = 'rgba(233, 30, 99, 0.02)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-200)';
          e.currentTarget.style.background = 'var(--gray-50)';
        }}
      >
        <Upload size={24} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
        <p style={{ fontWeight: 500, marginBottom: '0.125rem', fontSize: '0.875rem', color: 'var(--gray-900)' }}>
          {selectedJobId ? 'Drag and drop resumes here' : 'Select a job first'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          {selectedJobId ? 'or click to browse (PDF, DOC, DOCX)' : 'Use the dropdown above to select a job'}
        </p>
      </div> */}

      {/* Hidden file input for bulk uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSingleFileUpload}
        accept=".pdf,.doc,.docx"
        multiple
        style={{ display: 'none' }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
        <div style={{ flex: '0 1 auto', position: 'relative', minWidth: '200px', maxWidth: '300px' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search..."
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
              fontSize: '0.9375rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--gray-200)',
              backgroundColor: 'var(--white)',
              color: 'var(--gray-900)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={selectedJobId || ''}
          onChange={(e) => setSelectedJobId(e.target.value || null)}
          style={{
            minWidth: '120px',
            maxWidth: '150px',
            fontSize: '0.9375rem',
            padding: '0.625rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--gray-200)',
            backgroundColor: 'var(--white)',
            color: 'var(--gray-900)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '0.625rem 0.75rem',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            outline: 'none',
            minWidth: '130px',
            backgroundColor: 'var(--white)',
            color: 'var(--gray-900)',
            flexShrink: 0
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.625rem 0.75rem',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            outline: 'none',
            minWidth: '130px',
            backgroundColor: 'var(--white)',
            color: 'var(--gray-900)',
            flexShrink: 0
          }}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="invited">Invited</option>
          <option value="pending_interview">Pending Interview</option>
          <option value="interview_complete">Interview Complete</option>
          <option value="ai_analysis_ready">AI Analysis Ready</option>
        </select>
        {(searchTerm || dateFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('');
              setStatusFilter('');
            }}
            className="btn btn-ghost"
            style={{
              padding: '0.625rem 0.75rem',
              fontSize: '0.875rem',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Candidates Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Candidate</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Job Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Experience</th>

              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Date Added</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                  <Users size={40} color="var(--gray-300)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>No candidates found</p>
                  <Link to="/dashboard/candidates/invite" className="btn btn-primary btn-sm">
                    <Mail size={14} /> Invite First Candidate
                  </Link>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => {
                const statusConfig = getStatusConfig(candidate.status);
                const initials = `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`;
                const createdDate = (candidate as any).createdAt ? new Date((candidate as any).createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                return (
                  <tr key={candidate._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
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
                          fontSize: '0.85rem'
                        }}>{initials}</div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--gray-900)' }}>{candidate.firstName} {candidate.lastName}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.95rem', color: 'var(--gray-500)' }}>{(candidate.jobId as any)?.title || candidate.job?.title || 'Not assigned'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.95rem', color: 'var(--gray-500)' }}>{candidate.experience || 'N/A'}</td>

                    <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: 'var(--gray-500)' }}>{createdDate}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        background: statusConfig.bg,
                        color: statusConfig.text,
                        border: `1px solid ${statusConfig.border}`
                      }}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        {(candidate.status === 'interview_complete' || candidate.status === 'ai_analysis_ready') ? (
                          <Link
                            to={`/dashboard/candidates/${candidate._id}/report`}
                            className="btn btn-sm"
                            style={{
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.75rem',
                              backgroundColor: '#E91E63',
                              color: 'white',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <FileText size={12} /> View Report
                          </Link>
                        ) : candidate.status === 'pending_interview' || candidate.status === 'invited' ? (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {/* {(!candidate.resumeUrl && !candidate.resume?.url) && (
                              <button
                                className="btn btn-sm btn-ghost"
                                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}
                                onClick={() => triggerSingleUpload(candidate._id)}
                              >
                                <Upload size={14} /> Upload Resume
                              </button>
                            )} */}
                            <button className="btn btn-sm btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}>
                              <Mail size={14} /> Resend Invite
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {/* Show Send Invitation button for candidates with status 'new' */}
                            {candidate.status === 'new' && (
                              <Link
                                to={`/dashboard/candidates/invite?candidateId=${candidate._id}`}
                                className="btn btn-sm btn-primary"
                                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Mail size={14} /> Send Invitation
                              </Link>
                            )}

                            {/* {(!candidate.resumeUrl && !candidate.resume?.url) && (
                              <button
                                className="btn btn-sm btn-ghost"
                                style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}
                                onClick={() => triggerSingleUpload(candidate._id)}
                              >
                                <Upload size={14} /> Upload Resume
                              </button>
                            )} */}
                          </div>
                        )}
                        <div style={{ position: 'relative' }}>
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ padding: '0.25rem' }}
                            onClick={(e) => {
                              const menu = e.currentTarget.nextElementSibling;
                              if (menu) {
                                (menu as HTMLElement).style.display = (menu as HTMLElement).style.display === 'none' ? 'block' : 'none';
                              }
                            }}
                            onBlur={(e) => {
                              // Simple delay to allow clicking the menu item
                              setTimeout(() => {
                                const menu = e.currentTarget.nextElementSibling;
                                if (menu) {
                                  (menu as HTMLElement).style.display = 'none';
                                }
                              }, 200);
                            }}
                          >
                            <MoreVertical size={14} color="#6B7280" />
                          </button>
                          <div style={{
                            display: 'none',
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 4px)',
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.375rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            zIndex: 50,
                            minWidth: '120px',
                            overflow: 'hidden'
                          }}>
                            <button
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.875rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#EF4444',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEE2E2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={() => handleDelete(candidate._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
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
          <p style={{ fontSize: '0.5625rem', color: 'var(--primary)', lineHeight: 1.5 }}>
            All candidates are evaluated against the same Job DNA™ framework ensuring consistent, unbiased assessment.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <AddCandidateDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={loadCandidates}
        selectedJobId={selectedJobId}
      />
    </div>
  );
}
