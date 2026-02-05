import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Send, CheckCircle, Clock, Video, Dna, Loader, Copy } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

export default function SendInvitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateIdFromUrl = searchParams.get('candidateId');

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidateIdFromUrl || '');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [interviewCode, setInterviewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const BASE_URL = window.location.origin; // e.g., http://localhost:5173


  const API_URL = 'https://hrapi.intelligens.app'; // Backend API server
  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidateId) {
      const candidate = candidates.find(c => c._id === selectedCandidateId);
      setSelectedCandidate(candidate);
      if (candidate) {
        setFirstName(candidate.firstName);
        setLastName(candidate.lastName);
        setEmail(candidate.email);

        const jobTitle = candidate.jobId?.title || 'Position';
        setSubject(`Interview Invitation - ${jobTitle} at Intelligens`);

        // We'll update the message when the code generates, but set a base one now
        generateCode(selectedCandidateId);
      }
    }
  }, [selectedCandidateId, candidates]);

  // Update message when code changes
  useEffect(() => {
    if (selectedCandidate && interviewCode) {
      const jobTitle = selectedCandidate.jobId?.title || 'Position';
      const link = `${BASE_URL}/interview?code=${interviewCode}`;

      setMessage(`Interview Invitation

Dear ${firstName || 'Candidate'},

You have been invited to participate in an interview for the position of ${jobTitle}.

Your Interview Code: ${interviewCode}

Interview Link: ${link}

Please click the link above to start your interview. Make sure you have:

  • A working camera and microphone
  • A quiet environment
  • Stable internet connection

The interview will be conducted by our AI interviewer and typically takes 30-45 minutes.

Good luck!
`);
    }
  }, [interviewCode, selectedCandidate]); // Intentionally not including firstName/lastName dependencies to avoid overwriting user edits constantly

  const loadCandidates = async () => {
    try {
      const data = await api.candidates.getAll();
      setCandidates(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      setLoading(false);
    }
  };

  const generateCode = async (candidateId: string) => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/interviews/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidateId,
          expiresInHours: 168 // 7 days
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInterviewCode(data.code);
      } else {
        showToast.error('Failed to generate interview code');
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      showToast.error('Failed to generate interview code');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedCandidate || !interviewCode) {
      showToast.error('Please select a candidate and generate a code');
      return;
    }

    setSending(true);

    try {
      // Call backend API to send invitation via N8N webhook
      const response = await fetch(`${API_URL}/api/candidates/${selectedCandidateId}/resend-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          subject,
          message
        })
      });

      if (response.ok) {
        console.log('✅ Invitation sent successfully via N8N webhook');
        setSent(true);
        setTimeout(() => navigate('/dashboard/candidates'), 2000);
      } else {
        const error = await response.json();
        showToast.error(`Failed to send invitation: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      showToast.error('Failed to send invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast.success(`✅ ${label} copied to clipboard!`);
  };

  /* Unused variable interviewLink removed */

  const interviewLink = interviewCode ? `${BASE_URL}/interview?code=${interviewCode}` : '';

  if (sent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <CheckCircle size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--gray-800)' }}>
            Invitation Sent!
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            The candidate will receive an email with interview instructions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
      {/* Main Form */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--gray-800)' }}>
            Send Interview Invitation
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Invite a candidate to complete their AI-powered interview
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Candidate Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="label" style={{ fontSize: '0.75rem' }}>Select Candidate</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
              <select
                className="input"
                style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
              >
                <option value="">-- Choose a candidate --</option>
                {candidates.map((candidate) => (
                  <option key={candidate._id} value={candidate._id}>
                    {candidate.firstName} {candidate.lastName} ({candidate.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCandidate && (
            <>
              {/* Candidate Details - Editable */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input"
                      style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Last Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input"
                      style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ fontSize: '0.75rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Interview Code Display */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ fontSize: '0.75rem' }}>Interview Code (Auto-Generated)</label>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: generating ? '#f9fafb' : 'rgba(16, 185, 129, 0.05)',
                  border: `1px solid ${generating ? '#e5e7eb' : 'rgba(16, 185, 129, 0.2)'}`,
                  borderRadius: '0.5rem'
                }}>
                  {generating ? (
                    <>
                      <Loader size={20} color="#10B981" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Generating code...</span>
                    </>
                  ) : (
                    <>
                      <span style={{
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#10B981',
                        letterSpacing: '0.1em'
                      }}>
                        {interviewCode || 'Select candidate to generate'}
                      </span>
                      {interviewCode && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => copyToClipboard(interviewCode, 'Interview Code')}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Email Editor */}
              <div>
                <label className="label" style={{ fontSize: '0.75rem' }}>Email Content</label>
                <div style={{
                  background: 'var(--white)',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.625rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.125rem' }}>Subject:</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        style={{ width: '100%', padding: '0.375rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>

                  {/* Integrated Toolbar for Link Options */}
                  {interviewCode && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: '#fff',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--gray-700)' }}>Interview Link:</span>
                        <div style={{
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#2563EB',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}>
                          {interviewLink}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => copyToClipboard(interviewLink, 'Interview Link')}
                          className="btn btn-xs btn-ghost"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gray-600)' }}
                          title="Copy Link"
                        >
                          <Copy size={12} />
                          <span style={{ fontSize: '0.75rem' }}>Copy</span>
                        </button>
                        <a
                          href={interviewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs btn-ghost"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gray-600)', textDecoration: 'none' }}
                          title="Open Link"
                        >
                          <Send size={12} /> {/* Using Send icon or ExternalLink if available, utilizing Send for now as per imports */}
                          <span style={{ fontSize: '0.75rem' }}>Open</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '300px',
                      padding: '0.75rem',
                      border: 'none',
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                      lineHeight: '1.5',
                      outline: 'none'
                    }}
                    placeholder="Enter email HTML content here..."
                  />
                  <div style={{ padding: '0.5rem 0.75rem', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', fontSize: '0.625rem', color: 'var(--gray-500)' }}>
                    HTML tags supported. Ensure Interview Code and Link are included.
                  </div>
                </div>

                {/* Visual Preview Removed as per request */}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSendInvitation}
                  disabled={sending || !interviewCode}
                >
                  {sending ? (
                    <>
                      <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Invitation
                    </>
                  )}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/candidates')}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {!selectedCandidate && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--gray-500)',
              background: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <User size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Select a candidate to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Interview Info */}
        <div className="card" style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '1px solid rgba(233, 30, 99, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Dna size={18} color="#E91E63" />
            <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Interview Details</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: Video, label: 'AI Video Interview', value: 'Enabled' },
              { icon: Clock, label: 'Duration', value: '20-30 mins' },
              { icon: Dna, label: 'Questions', value: '5 Job DNA based' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--white)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)' }}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
                <span style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions for Candidate */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>Candidate Instructions</h3>
          <ul style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.8, paddingLeft: '1rem' }}>
            <li>Stable internet connection</li>
            <li>Quiet, well-lit environment</li>
            <li>Camera and microphone enabled</li>
            <li>Complete in one session</li>
            <li>7 days to complete</li>
          </ul>
        </div>

        {/* Tips */}
        <div style={{
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.5rem' }}>💡 Tip</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
            The interview code is automatically generated and included in the email. The link will validate the code and start the interview.
          </p>
        </div>
      </div>
    </div>
  );
}
