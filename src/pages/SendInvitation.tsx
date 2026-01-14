import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Briefcase, Link as LinkIcon, Send, CheckCircle, Clock, Video, Dna } from 'lucide-react';

export default function SendInvitation() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => navigate('/dashboard/candidates'), 2000);
  };

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
          {/* Form Fields - Two Column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Candidate Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input" placeholder="John Doe" style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }} defaultValue="Emily Davis" />
              </div>
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" className="input" placeholder="candidate@email.com" style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }} defaultValue="emily.d@email.com" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="label" style={{ fontSize: '0.75rem' }}>Position</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <select className="input" style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}>
                <option>Senior Software Engineer</option>
                <option>Product Manager</option>
                <option>UX Designer</option>
              </select>
            </div>
          </div>

          {/* Email Preview - Compact */}
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
                <p style={{ fontWeight: 500, fontSize: '0.75rem' }}>Interview Invitation - Senior Software Engineer at Acme Corporation</p>
              </div>
              <div style={{ lineHeight: 1.6 }}>
                <p>Dear Emily,</p>
                <p style={{ marginTop: '0.5rem' }}>Thank you for your interest in the Senior Software Engineer position at Acme Corporation.</p>
                <p style={{ marginTop: '0.5rem' }}>We would like to invite you to complete an AI-powered video interview. This interview will take approximately 20-30 minutes.</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  marginTop: '0.75rem'
                }}>
                  <LinkIcon size={14} color="#E91E63" />
                  <span style={{ color: '#E91E63', fontSize: '0.75rem' }}>https://intelligens.ai/interview/abc123xyz</span>
                </div>
                <p style={{ marginTop: '0.75rem' }}>Best regards,<br />The Acme Corporation Hiring Team</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSend}>
              <Send size={14} /> Send Invitation
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/candidates')}>
              Cancel
            </button>
          </div>
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
            Candidates can complete the interview at their convenience. They'll receive a reminder 24 hours before the deadline.
          </p>
        </div>
      </div>
    </div>
  );
}
