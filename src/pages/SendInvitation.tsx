import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Link as LinkIcon, Send, CheckCircle, Clock, Video, Dna, Loader, Copy } from 'lucide-react';
import api from '../services/api';

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
        generateCode(selectedCandidateId);
      }
    }
  }, [selectedCandidateId, candidates]);

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
        alert('Failed to generate interview code');
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('Failed to generate interview code');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedCandidate || !interviewCode) {
      alert('Please select a candidate and generate a code');
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
        }
      });

      if (response.ok) {
        console.log('✅ Invitation sent successfully via N8N webhook');
        setSent(true);
        setTimeout(() => navigate('/dashboard/candidates'), 2000);
      } else {
        const error = await response.json();
        alert(`Failed to send invitation: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const interviewLink = interviewCode ? 
    `${BASE_URL}/interview?code=${interviewCode}` : 
    'Generating...';

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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: '#1F2937' }}>
            Invitation Sent!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1F2937' }}>
            Send Interview Invitation
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
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
              {/* Candidate Details - Read Only */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Candidate Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      className="input" 
                      style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem', background: '#f9fafb' }} 
                      value={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="email" 
                      className="input" 
                      style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem', background: '#f9fafb' }} 
                      value={selectedCandidate.email}
                      readOnly
                    />
                  </div>
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
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Generating code...</span>
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
                          onClick={() => copyToClipboard(interviewCode)}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Email Preview */}
              <div>
                <label className="label" style={{ fontSize: '0.75rem' }}>Email Preview</label>
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ color: '#6b7280', marginBottom: '0.125rem', fontSize: '0.625rem' }}>Subject:</p>
                    <p style={{ fontWeight: 500, fontSize: '0.75rem' }}>
                      Interview Invitation - {selectedCandidate.jobId?.title || 'Position'} at Intelligens
                    </p>
                  </div>
                  <div style={{ lineHeight: 1.6 }}>
                    <p>Dear {selectedCandidate.firstName},</p>
                    <p style={{ marginTop: '0.5rem' }}>
                      Thank you for your interest in the {selectedCandidate.jobId?.title || 'position'} at Intelligens.
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                      We would like to invite you to complete an AI-powered video interview. This interview will take approximately 20-30 minutes.
                    </p>
                    
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.7rem', color: '#6b7280' }}>
                        Your Interview Code:
                      </p>
                      <p style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '1rem', 
                        fontWeight: 700, 
                        color: '#10B981',
                        letterSpacing: '0.1em',
                        marginBottom: '0.75rem'
                      }}>
                        {interviewCode || 'GENERATING...'}
                      </p>
                      
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.7rem', color: '#6b7280' }}>
                        Interview Link:
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <LinkIcon size={14} color="#E91E63" />
                        <span style={{ color: '#E91E63', fontSize: '0.7rem', wordBreak: 'break-all' }}>
                          {interviewLink}
                        </span>
                        <button 
                          className="btn btn-ghost"
                          onClick={() => copyToClipboard(interviewLink)}
                          style={{ padding: '0.25rem', marginLeft: 'auto' }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <p style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#6b7280' }}>
                      Please complete the interview within 7 days. Click the link above or enter your code on our interview page.
                    </p>
                    
                    <p style={{ marginTop: '0.75rem' }}>
                      Best regards,<br />
                      The Intelligens Hiring Team
                    </p>
                  </div>
                </div>
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
              color: '#6b7280',
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
            <Dna size={16} color="#E91E63" />
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Interview Details</h3>
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
                background: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </div>
                <span style={{ fontWeight: 500, color: '#1F2937' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions for Candidate */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Candidate Instructions</h3>
          <ul style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.8, paddingLeft: '1rem' }}>
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
          <p style={{ fontSize: '0.625rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.5rem' }}>💡 Tip</p>
          <p style={{ fontSize: '0.625rem', color: '#6b7280', lineHeight: 1.5 }}>
            The interview code is automatically generated and included in the email. The link will validate the code and start the interview.
          </p>
        </div>
      </div>
    </div>
  );
}
