import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  CheckCircle, Clock, XCircle, ThumbsUp, AlertTriangle, Loader
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  job?: {
    title: string;
  };
}

export default function FinalDecision() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect if coming from reports route
  const isFromReports = location.pathname.includes('/reports/');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (id) {
        if (isFromReports) {
          // Load directly from reports API by Report ID
          const data = await api.reports.getById(id);
          console.log('FinalDecision - Direct Report Data:', data);
          setReportData(data);
        } else {
          // Candidate-based route (/dashboard/candidates/:id/decision)
          // 1. Load candidate data first
          const cData = await api.candidates.getById(id);
          setCandidate(cData);
          
          // 2. Try to load report data by candidate ID
          try {
            const rData = await api.reports.getByCandidateId(id);
            console.log('FinalDecision - Report by Candidate ID:', rData);
            setReportData(rData);
          } catch (reportErr) {
            console.warn('Report not found for candidate in decision view:', reportErr);
            // Fallback to embedded analysis if available
            if ((cData as any).interviewAnalysis) {
              setReportData((cData as any).interviewAnalysis);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  let displayCandidate: any = candidate;
  let interviewAnalysis: any;

  const handleSubmit = async () => {
    if (!decision || !id) return;

    try {
      setSubmitting(true);
      // Map frontend values to backend values
      const decisionMap: { [key: string]: string } = {
        'hire': 'hired',
        'hold': 'pending',
        'reject': 'rejected'
      };
      const backendDecision = decisionMap[decision] || decision;

      // Use different API based on route
      if (isFromReports) {
        await api.reports.updateDecision(id, backendDecision, notes);
      } else {
        await api.candidates.updateDecision(id, backendDecision, notes);
      }

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard/reports'), 2000);
    } catch (err: any) {
      console.error('Failed to submit decision:', err);
      showToast.error(err.message || 'Failed to submit decision');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || (!candidate && !reportData)) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertTriangle size={48} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-800)' }}>
          Data Not Found
        </h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{error || 'Unable to load candidate data.'}</p>
        <Link to="/dashboard/reports" className="btn btn-primary">
          Back to Reports
        </Link>
      </div>
    );
  }

  if (reportData) {
    // Check if data is nested - handling both direct and nested structure
    const info = reportData.candidateInformation || reportData.data?.candidateInformation;
    const reportSource = reportData.data || reportData;

    displayCandidate = {
      firstName: info?.fullName?.split(' ')[0] || 'Unknown',
      lastName: info?.fullName?.split(' ').slice(1).join(' ') || '',
      email: info?.email || '',
      job: { title: info?.positionAppliedFor || '' },
      transcript: reportData.transcript || reportSource.transcript || [],
    };
    interviewAnalysis = reportSource;
  } else {
    displayCandidate = candidate;
    // Fix: Handle nested data structure
    const analysisRaw = (candidate as any)?.interviewAnalysis;
    interviewAnalysis = analysisRaw?.data || analysisRaw;
  }

  // Safe check for interviewResult
  const interviewResult = (displayCandidate as any)?.interviewResult;

  // Construct recommendation object
  const recommendation = (() => {
    if (interviewAnalysis) {
      const recSource = interviewAnalysis.recommendation || interviewAnalysis.data?.recommendation;
      const scoreSource = interviewAnalysis.competencyAssessment || interviewAnalysis.data?.competencyAssessment;
      
      // Helper to parse overall score "18/50"
      const parseOverallScore = (str: string) => {
          if (!str) return 0;
          const [earned, total] = str.split('/').map(Number);
          if (!isNaN(earned) && !isNaN(total) && total > 0) {
              return Math.round((earned / total) * 100);
          }
          return 0;
      };

      let finalOverallScore = 0;
      if (scoreSource?.overallScore && scoreSource.overallScore.includes('/')) {
          finalOverallScore = parseOverallScore(scoreSource.overallScore);
      } else {
          // Fallback simple calc if needed, or 0
          finalOverallScore = 0; 
      }

      return {
        overallScore: finalOverallScore || 0,
        recommendation: recSource?.hiringRecommendation || 'Pending',
        keyStrengths: interviewAnalysis.keyDiscussionPoints?.technicalExperience || interviewAnalysis.strengthsObserved || [],
        keyConcerns: interviewAnalysis.areasOfConcern || [],
        executiveSummary: interviewAnalysis.executiveSummary || '', // Added
        keyDiscussionPoints: interviewAnalysis.keyDiscussionPoints || {} // Added
      };
    }
    return interviewResult;
  })();

  const initials = `${displayCandidate?.firstName?.[0] || ''}${displayCandidate?.lastName?.[0] || ''}`;

  // Parse score from reportData (using the logic we just added to recommendation)
  let aiScore = recommendation?.overallScore || 0;

  // Update these references to use our robust recommendation object
  // const aiRecommendation = reportData?.recommendation?.hiringRecommendation || 'Pending';
  const strengths = recommendation?.keyStrengths || [];
  const concerns = recommendation?.keyConcerns || [];

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
        <p style={{ color: 'var(--gray-500)' }}>
          {displayCandidate.firstName} {displayCandidate.lastName} has been marked as "{decision === 'hire' ? 'Hire' : decision === 'hold' ? 'Hold' : 'Reject'}"
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
          Final Hiring Decision
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Review the AI analysis and make your final decision for {displayCandidate.firstName} {displayCandidate.lastName}
        </p>
      </div>

      {/* Candidate Summary Card */}
      <div className="card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'var(--white)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>{initials}</div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.375rem', color: 'var(--gray-900)' }}>
                {displayCandidate.firstName} {displayCandidate.lastName}
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {displayCandidate.job?.title || 'Position'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(#10B981 ${aiScore * 3.6}deg, #F3F4F6 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'var(--white)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981', marginBottom: '0.125rem' }}>
                  {aiScore}%
                </p>
                <p style={{ fontSize: '0.625rem', color: 'var(--gray-500)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  AI SCORE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Section (New) */}
      {recommendation?.executiveSummary && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--white)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--gray-900)' }}>
            Executive Summary
          </h3>
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.6, fontSize: '0.925rem' }}>
            {recommendation.executiveSummary}
          </p>
        </div>
      )}

      {/* Strengths & Concerns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Strengths */}
        <div className="card" style={{
          padding: '1.5rem',
          border: '2px solid #D1FAE5',
          background: 'var(--white)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ThumbsUp size={20} color="white" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#065F46' }}>Strengths</h3>
          </div>
          {strengths.length > 0 ? (
            <ul style={{ fontSize: '0.875rem', color: '#047857', paddingLeft: '1.5rem', margin: 0, lineHeight: 1.7 }}>
              {strengths.slice(0, 3).map((s: string, i: number) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>No strengths recorded</p>
          )}
        </div>

        {/* Concerns */}
        <div className="card" style={{
          padding: '1.5rem',
          border: '2px solid #FEF3C7',
          background: 'var(--white)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color="white" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#92400E' }}>Concerns</h3>
          </div>
          {concerns.length > 0 ? (
            <ul style={{ fontSize: '0.875rem', color: '#B45309', paddingLeft: '1.5rem', margin: 0, lineHeight: 1.7 }}>
              {concerns.slice(0, 3).map((c: string, i: number) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{c}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>No concerns identified</p>
          )}
        </div>
      </div>

      {/* Your Decision Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--white)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--gray-900)' }}>
          Your Decision
        </h3>

        {/* Decision Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { id: 'hire', label: 'Hire', icon: CheckCircle, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
            { id: 'hold', label: 'Hold', icon: Clock, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
            { id: 'reject', label: 'Reject', icon: XCircle, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setDecision(option.id)}
              style={{
                padding: '1.75rem 1rem',
                border: decision === option.id ? `3px solid ${option.color}` : '2px solid #E5E7EB',
                borderRadius: '1rem',
                background: decision === option.id ? `${option.color}15` : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                transform: decision === option.id ? 'scale(1.05)' : 'scale(1)',
                boxShadow: decision === option.id
                  ? `0 10px 25px -5px ${option.color}40, 0 10px 10px -5px ${option.color}20`
                  : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                if (decision !== option.id) {
                  e.currentTarget.style.borderColor = option.color;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (decision !== option.id) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: decision === option.id ? option.gradient : '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                <option.icon
                  size={28}
                  color={decision === option.id ? 'white' : '#9CA3AF'}
                />
              </div>
              <p style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: decision === option.id ? option.color : '#374151',
                margin: 0
              }}>
                {option.label}
              </p>
            </button>
          ))}
        </div>

        {/* Additional Notes */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <input
              type="checkbox"
              id="notes-toggle"
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#E91E63',
                cursor: 'pointer'
              }}
            />
            <label
              htmlFor="notes-toggle"
              style={{
                fontSize: '0.9375rem',
                color: 'var(--gray-700)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Additional Notes (Optional)
            </label>
          </div>
          <textarea
            className="input"
            rows={4}
            placeholder="Add any notes or feedback about this candidate..."
            style={{
              resize: 'vertical',
              fontSize: '0.875rem',
              width: '100%',
              borderRadius: '0.75rem',
              border: '2px solid #E5E7EB',
              padding: '1rem',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
              lineHeight: 1.6
            }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={(e) => e.currentTarget.style.borderColor = '#E91E63'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          disabled={!decision || submitting}
          onClick={handleSubmit}
          style={{
            opacity: decision && !submitting ? 1 : 0.5,
            background: decision && !submitting
              ? 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)'
              : '#9CA3AF',
            color: 'white',
            flex: 1,
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '0.75rem',
            border: 'none',
            cursor: decision && !submitting ? 'pointer' : 'not-allowed',
            boxShadow: decision && !submitting
              ? '0 10px 15px -3px rgba(233, 30, 99, 0.3), 0 4px 6px -2px rgba(233, 30, 99, 0.2)'
              : 'none',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (decision && !submitting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(233, 30, 99, 0.3), 0 10px 10px -5px rgba(233, 30, 99, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (decision && !submitting) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(233, 30, 99, 0.3), 0 4px 6px -2px rgba(233, 30, 99, 0.2)';
            }
          }}
        >
          {submitting ? (
            <>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Submit Decision</span>
            </>
          )}
        </button>
        <Link
          to="/dashboard/reports"
          className="btn btn-ghost"
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '0.75rem',
            color: 'var(--gray-500)',
            textDecoration: 'none',
            border: '2px solid #E5E7EB',
            background: 'var(--white)',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9CA3AF';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          Cancel
        </Link>
      </div>

      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
