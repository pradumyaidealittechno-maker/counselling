import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, XCircle, Sparkles, 
  ThumbsUp, ThumbsDown, MessageSquare, Dna, AlertTriangle, Users, Loader
} from 'lucide-react';
import api from '../services/api';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  experience?: string;
  interviewResult?: {
    overallScore: number;
    recommendation: string;
    confidence: number;
    summary: string;
    keyStrengths: string[];
    keyConcerns: string[];
    comparisonToOtherCandidates?: {
      percentile: number;
      totalCandidates: number;
    };
  };
  job?: {
    title: string;
  };
}

export default function FinalDecision() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      if (id) {
        const data = await api.candidates.getById(id);
        setCandidate(data);
      }
    } catch (err: any) {
      console.error('Failed to load candidate:', err);
      setError(err.message || 'Failed to load candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!decision || !id) return;
    
    try {
      setSubmitting(true);
      await api.candidates.updateDecision(id, decision, notes);
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard/candidates'), 2000);
    } catch (err: any) {
      console.error('Failed to submit decision:', err);
      setError(err.message || 'Failed to submit decision');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading candidate...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Users size={48} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1F2937' }}>
          Candidate Not Found
        </h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{error || 'The candidate you are looking for does not exist.'}</p>
        <Link to="/dashboard/candidates" className="btn btn-primary">
          Back to Candidates
        </Link>
      </div>
    );
  }

  const recommendation = candidate.interviewResult;
  const initials = `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`;

  if (submitted) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: decision === 'hire' 
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : decision === 'hold'
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
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
        <p style={{ color: '#6B7280' }}>
          {candidate.firstName} {candidate.lastName} has been marked as "{decision === 'hire' ? 'Hire' : decision === 'hold' ? 'Hold' : 'Reject'}"
        </p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/dashboard/candidates" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#6B7280',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <ArrowLeft size={16} /> Back to Candidates
        </Link>

        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            margin: '0 auto 1rem'
          }}>{initials}</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {candidate.firstName} {candidate.lastName}
          </h2>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{candidate.job?.title || 'No job assigned'}</p>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <AlertTriangle size={32} color="#F59E0B" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#92400E' }}>No AI Analysis Available</h3>
            <p style={{ fontSize: '0.875rem', color: '#B45309' }}>
              This candidate needs to complete their interview before you can make a decision.
            </p>
          </div>

          <Link to="/dashboard/candidates" className="btn btn-secondary">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <Link to="/dashboard/candidates" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        color: '#6B7280',
        marginBottom: '1.5rem',
        fontSize: '0.875rem'
      }}>
        <ArrowLeft size={16} /> Back to Candidates
      </Link>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Final Hiring Decision
      </h1>
      <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Review the AI analysis and make your final decision for {candidate.firstName} {candidate.lastName}
      </p>

      {/* Candidate Summary with AI Recommendation */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700
            }}>{initials}</div>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{candidate.firstName} {candidate.lastName}</h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{candidate.job?.title || 'No job assigned'}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{candidate.experience || 'Experience not specified'}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: recommendation.overallScore >= 90 ? '#10B981' : recommendation.overallScore >= 80 ? '#E91E63' : '#F59E0B'
            }}>
              {recommendation.overallScore}%
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Dna size={14} color="#E91E63" />
              <span style={{ color: '#E91E63', fontSize: '0.75rem', fontWeight: 500 }}>DNA Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div style={{
        background: recommendation.recommendation === 'Hire' 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
          : recommendation.recommendation === 'Hold'
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
        border: `1px solid ${recommendation.recommendation === 'Hire' ? 'rgba(16, 185, 129, 0.2)' : recommendation.recommendation === 'Hold' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={20} color={recommendation.recommendation === 'Hire' ? '#10B981' : recommendation.recommendation === 'Hold' ? '#F59E0B' : '#EF4444'} />
          <div>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>AI Recommendation</p>
            <p style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: recommendation.recommendation === 'Hire' ? '#10B981' : recommendation.recommendation === 'Hold' ? '#F59E0B' : '#EF4444'
            }}>
              {recommendation.recommendation}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Confidence</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>{recommendation.confidence}%</p>
        </div>
      </div>

      {/* Candidate Comparison */}
      {recommendation.comparisonToOtherCandidates && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Users size={16} color="#6366F1" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Candidate Ranking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              flex: 1,
              height: '12px',
              background: '#F3F4F6',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${recommendation.comparisonToOtherCandidates.percentile}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)',
                borderRadius: '6px'
              }} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E91E63', whiteSpace: 'nowrap' }}>
              Top {100 - recommendation.comparisonToOtherCandidates.percentile}%
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
            Ranked higher than {recommendation.comparisonToOtherCandidates.percentile}% of {recommendation.comparisonToOtherCandidates.totalCandidates} candidates for this role
          </p>
        </div>
      )}

      {/* Strengths & Concerns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ThumbsUp size={16} color="#10B981" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Key Strengths</span>
          </div>
          {recommendation.keyStrengths.length > 0 ? (
            <ul style={{ fontSize: '0.8125rem', color: '#065F46', paddingLeft: '1.25rem', margin: 0 }}>
              {recommendation.keyStrengths.map((s, i) => (
                <li key={i} style={{ marginBottom: '0.375rem' }}>{s}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: '#6B7280', fontStyle: 'italic' }}>No strengths recorded</p>
          )}
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ThumbsDown size={16} color="#F59E0B" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Key Concerns</span>
          </div>
          {recommendation.keyConcerns.length > 0 ? (
            <ul style={{ fontSize: '0.8125rem', color: '#92400E', paddingLeft: '1.25rem', margin: 0 }}>
              {recommendation.keyConcerns.map((c, i) => (
                <li key={i} style={{ marginBottom: '0.375rem' }}>{c}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: '#065F46' }}>No significant concerns identified</p>
          )}
        </div>
      </div>

      {/* AI Explanation */}
      <div style={{
        background: 'rgba(233, 30, 99, 0.05)',
        border: '1px solid rgba(233, 30, 99, 0.15)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Dna size={16} color="#E91E63" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>AI Explanation</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{recommendation.summary}"
        </p>
      </div>

      {/* Decision Options */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>Your Decision</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { id: 'hire', label: 'Hire', icon: CheckCircle, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', desc: 'Proceed with offer' },
            { id: 'hold', label: 'Hold', icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', desc: 'Keep in pipeline' },
            { id: 'reject', label: 'Reject', icon: XCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', desc: 'Not a fit' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setDecision(option.id)}
              style={{
                padding: '1.25rem',
                border: decision === option.id ? `2px solid ${option.color}` : '2px solid #E5E7EB',
                borderRadius: '0.75rem',
                background: decision === option.id ? option.bg : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <option.icon 
                size={32} 
                color={decision === option.id ? option.color : '#9CA3AF'} 
                style={{ marginBottom: '0.5rem' }}
              />
              <p style={{ 
                fontWeight: 600, 
                color: decision === option.id ? option.color : '#374151',
                marginBottom: '0.25rem'
              }}>
                {option.label}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <MessageSquare size={16} color="#6B7280" />
          <label className="label" style={{ margin: 0, fontSize: '0.875rem' }}>Additional Notes (Optional)</label>
        </div>
        <textarea 
          className="input" 
          rows={3} 
          placeholder="Add any notes or feedback about this candidate..."
          style={{ resize: 'vertical', fontSize: '0.875rem' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Human-in-the-loop notice */}
      <div style={{
        padding: '0.75rem 1rem',
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <AlertTriangle size={16} color="#6B7280" />
        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
          <strong>Human-in-the-loop:</strong> AI provides recommendations, but the final hiring decision is always made by you. 
          Your decision will be recorded for audit and compliance purposes.
        </p>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          className="btn btn-primary" 
          disabled={!decision || submitting}
          onClick={handleSubmit}
          style={{ opacity: decision && !submitting ? 1 : 0.5 }}
        >
          {submitting ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={18} /> Submit Decision
            </>
          )}
        </button>
        <Link to={`/dashboard/candidates/${id}/report`} className="btn btn-secondary">
          View Full Report
        </Link>
        <Link to="/dashboard/candidates" className="btn btn-ghost">
          Cancel
        </Link>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
