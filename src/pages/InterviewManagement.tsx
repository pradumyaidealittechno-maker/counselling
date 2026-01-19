import { useState, useEffect } from 'react';
import { Video, Clock, Users, CheckCircle, Play, Square, Loader } from 'lucide-react';
import api from '../services/api';
import { confirmToast, showToast } from '../utils/toast';

interface InterviewSession {
  _id: string;
  candidateId: string;
  candidateName: string;
  email: string;
  startedAt: Date;
  status: string;
  recordingUrl?: string;
}

export default function InterviewManagement() {
  const API_URL = 'http://localhost:3001'; // Backend API server
  const [activeSessions, setActiveSessions] = useState<InterviewSession[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [endingInterview, setEndingInterview] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Poll for active sessions every 5 seconds
    const interval = setInterval(loadActiveSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActiveSessions(),
        loadRecentInterviews(),
        loadCandidates()
      ]);
    } catch (error) {
      console.error('Failed to load interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    try {
      // This endpoint will be created in backend
      const response = await fetch(`${API_URL}/api/interviews/active-sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  };

  const loadRecentInterviews = async () => {
    try {
      const candidates = await api.candidates.getAll();
      const completed = candidates
        .filter((c: any) => c.interviewStatus === 'completed')
        .map((c: any) => ({
          _id: c._id,
          candidateId: c._id,
          candidateName: `${c.firstName} ${c.lastName}`,
          email: c.email,
          startedAt: c.interviewStartedAt,
          completedAt: c.interviewCompletedAt,
          status: 'completed',
          recordingUrl: c.recordingUrl
        }));
      setRecentInterviews(completed);
    } catch (error) {
      console.error('Failed to load recent interviews:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      const data = await api.candidates.getAll();
      setCandidates(data || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  // Filter recent interviews based on search term
  const filteredRecentInterviews = recentInterviews.filter(interview =>
    interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEndInterview = async (candidateId: string, candidateName: string) => {
    const confirmed = await confirmToast(`Are you sure you want to end the interview for ${candidateName}?`);
    if (!confirmed) {
      return;
    }

    setEndingInterview(candidateId);
    try {
      const response = await fetch(`${API_URL}/api/interviews/end-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ candidateId })
      });

      if (response.ok) {
        showToast.success(`Interview ended for ${candidateName}`);
        await loadActiveSessions();
      } else {
        showToast.error('Failed to end interview');
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      showToast.error('Failed to end interview');
    } finally {
      setEndingInterview(null);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (startedAt: string) => {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - start) / 1000);
    return formatDuration(elapsed);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading interviews...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Gradient */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
        borderRadius: '1rem',
        boxShadow: '0 10px 40px rgba(233, 30, 99, 0.25)'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>
          🎥 Interview Management
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem' }}>Monitor live sessions, track completed interviews, and manage candidates</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ 
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.15)',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}>
              <Video size={28} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>{activeSessions.length}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.25rem' }}>Active Now</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ 
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.15)',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}>
              <CheckCircle size={28} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#6366F1', lineHeight: 1 }}>{recentInterviews.length}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.25rem' }}>Completed</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ 
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(233, 30, 99, 0.02) 100%)',
          border: '2px solid rgba(233, 30, 99, 0.15)',
          boxShadow: '0 4px 15px rgba(233, 30, 99, 0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(233, 30, 99, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)'
            }}>
              <Users size={28} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#E91E63', lineHeight: 1 }}>{candidates.length}</p>
              <p style={{ color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.25rem' }}>Total Candidates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card" style={{ 
        padding: '1.75rem',
        marginBottom: '2rem',
        border: '2px solid rgba(16, 185, 129, 0.15)',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
        background: 'var(--white)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: '#10B981',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)'
            }} />
            <h2 style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem' }}>
              Live Sessions
            </h2>
          </div>
          <div style={{
            padding: '0.25rem 0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#10B981'
          }}>
            {activeSessions.length} Live
          </div>
        </div>

        {activeSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            <Video size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.875rem' }}>No active interviews at the moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSessions.map((session) => (
              <div key={session._id} style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02))',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10B981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>
                      {session.candidateName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Started: {new Date(session.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, color: '#10B981', fontSize: '0.875rem' }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {getElapsedTime(String(session.startedAt))}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>In Progress</p>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#DC2626',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                    onClick={() => handleEndInterview(session.candidateId, session.candidateName)}
                    disabled={endingInterview === session.candidateId}
                  >
                    {endingInterview === session.candidateId ? (
                      <>
                        <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        Ending...
                      </>
                    ) : (
                      <>
                        <Square size={14} />
                        End Interview
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Interviews */}
      <div className="card" style={{ 
        padding: '1.75rem',
        border: '2px solid rgba(99, 102, 241, 0.15)',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08)',
        background: 'var(--white)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem' }}>
            📋 Recent Interviews
          </h2>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.625rem 1rem',
                border: '2px solid var(--gray-200)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                width: '240px',
                transition: 'all 0.2s',
                outline: 'none',
                background: 'var(--white)',
                color: 'var(--gray-900)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366F1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {filteredRecentInterviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            <CheckCircle size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm ? 'No interviews found matching your search' : 'No completed interviews yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>Candidate</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>Recording</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentInterviews.slice(0, 10).map((interview) => (
                  <tr key={interview._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>
                      {interview.candidateName}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {interview.email}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {interview.recordingUrl ? (
                         <a
                          href={interview.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-ghost"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6366F1' }}
                        >
                          <Play size={14} />
                          <span style={{ fontSize: '0.75rem' }}>View Recording</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {new Date(interview.startedAt).toLocaleDateString()} at {new Date(interview.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
