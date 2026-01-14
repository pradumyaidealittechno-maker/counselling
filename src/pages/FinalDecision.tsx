import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, XCircle, Sparkles, 
  ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react';

const candidateData = {
  name: 'Sarah Johnson',
  role: 'Senior Software Engineer',
  overallScore: 92,
  recommendation: 'Hire',
  strengths: [
    'Strong technical knowledge in distributed systems',
    'Excellent communication and articulation',
    'Demonstrated leadership experience'
  ],
  concerns: [
    'Limited experience with Kubernetes'
  ]
};

export default function FinalDecision() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard/candidates'), 2000);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: decision === 'hire' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : decision === 'hold'
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          {decision === 'hire' ? <CheckCircle size={40} color="white" /> :
           decision === 'hold' ? <Clock size={40} color="white" /> :
           <XCircle size={40} color="white" />}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Decision Recorded
        </h2>
        <p style={{ color: '#6b7280' }}>
          {candidateData.name} has been marked as "{decision === 'hire' ? 'Hire' : decision === 'hold' ? 'Hold' : 'Reject'}"
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <Link to="/dashboard/candidates" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        color: '#6b7280',
        marginBottom: '1.5rem'
      }}>
        <ArrowLeft size={18} /> Back to Candidates
      </Link>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Final Hiring Decision
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Review the AI analysis and make your final decision for {candidateData.name}
      </p>

      {/* Candidate Summary */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700
            }}>SJ</div>
            <div>
              <h3 style={{ fontWeight: 600 }}>{candidateData.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{candidateData.role}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{candidateData.overallScore}%</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={14} color="#10b981" />
              <span style={{ color: '#10b981', fontSize: '0.875rem' }}>AI: {candidateData.recommendation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ThumbsUp size={18} color="#10b981" />
            <span style={{ fontWeight: 500 }}>Strengths</span>
          </div>
          <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
            {candidateData.strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
          </ul>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ThumbsDown size={18} color="#f59e0b" />
            <span style={{ fontWeight: 500 }}>Concerns</span>
          </div>
          <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
            {candidateData.concerns.map((c, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{c}</li>)}
          </ul>
        </div>
      </div>

      {/* Decision Options */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Your Decision</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { id: 'hire', label: 'Hire', icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            { id: 'hold', label: 'Hold', icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            { id: 'reject', label: 'Reject', icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setDecision(option.id)}
              style={{
                padding: '1.5rem',
                border: decision === option.id ? `2px solid ${option.color}` : '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                background: decision === option.id ? option.bg : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <option.icon 
                size={32} 
                color={decision === option.id ? option.color : '#9ca3af'} 
                style={{ marginBottom: '0.75rem' }}
              />
              <p style={{ 
                fontWeight: 600, 
                color: decision === option.id ? option.color : '#374151' 
              }}>
                {option.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <MessageSquare size={18} color="#6b7280" />
          <label className="label" style={{ margin: 0 }}>Additional Notes (Optional)</label>
        </div>
        <textarea 
          className="input" 
          rows={4} 
          placeholder="Add any notes or feedback about this candidate..."
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          className="btn btn-primary" 
          disabled={!decision}
          onClick={handleSubmit}
          style={{ opacity: decision ? 1 : 0.5 }}
        >
          <CheckCircle size={18} /> Submit Decision
        </button>
        <Link to="/dashboard/candidates" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </div>
  );
}
