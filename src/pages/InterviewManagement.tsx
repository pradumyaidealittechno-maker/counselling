import { useState, useEffect } from 'react';
import { Video, Clock, Users, CheckCircle, Play, Square, Loader } from 'lucide-react';
import api from '../services/api';

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
  const [generatingCode, setGeneratingCode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState('');
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



  const handleEndInterview = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to end the interview for ${candidateName}?`)) {
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
        alert(`Interview ended for ${candidateName}`);
        await loadActiveSessions();
      } else {
        alert('Failed to end interview');
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      alert('Failed to end interview');
    } finally {
      setEndingInterview(null);
    }
  };

  const generateInterviewCode = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }

    setGeneratingCode(true);
    try {
      const response = await fetch(`${API_URL}/api/interviews/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          expiresInHours: 168 // 7 days
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Interview code generated: ${data.code}\n\nExpires: ${new Date(data.expiresAt).toLocaleString()}`);
        loadData();
      } else {
        const error = await response.json();
        alert(`Failed to generate code: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('Failed to generate interview code');
    } finally {
      setGeneratingCode(false);
      setSelectedCandidate('');
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
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading interviews...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1F2937' }}>
          Interview Management 🎥
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Manage interview sessions, generate codes, and view recordings</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Video size={20} color="#10B981" />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{activeSessions.length}</p>
              <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>Active Now</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} color="#6366F1" />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366F1' }}>{recentInterviews.length}</p>
              <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>Completed</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(233, 30, 99, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={20} color="#E91E63" />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E91E63' }}>{candidates.length}</p>
              <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>Total Candidates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Interview Code Section */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, color: '#1F2937', fontSize: '1rem', marginBottom: '1rem' }}>
          Generate Interview Code
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Select Candidate
            </label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">-- Choose a candidate --</option>
              {candidates.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.firstName} {candidate.lastName} - {candidate.email}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generateInterviewCode}
            disabled={generatingCode || !selectedCandidate}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {generatingCode ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>
                <Video size={16} />
                Generate Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 600, color: '#1F2937', fontSize: '1rem' }}>
            Active Interview Sessions
          </h2>
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
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
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
                    <p style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>
                      {session.candidateName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
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
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>In Progress</p>
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
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, color: '#1F2937', fontSize: '1rem', marginBottom: '1rem' }}>
          Recent Interviews
        </h2>

        {recentInterviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
            <CheckCircle size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.875rem' }}>No completed interviews yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentInterviews.slice(0, 10).map((interview) => (
              <div key={interview._id} style={{
                padding: '1rem',
                background: '#F9FAFB',
                borderRadius: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>
                    {interview.candidateName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {new Date(interview.startedAt).toLocaleDateString()} at {new Date(interview.startedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {interview.recordingUrl && (
                    <a
                      href={interview.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Play size={14} />
                      View Recording
                    </a>
                  )}
                  <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
