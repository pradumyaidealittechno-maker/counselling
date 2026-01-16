import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Dna, FileText, Clock, Video, Loader, Users } from 'lucide-react';
import api from '../services/api';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  interviewDate?: string;
  interviewDuration?: string;
  interviewResult?: {
    overallScore: number;
    recommendation: string;
    confidence: number;
    summary: string;
    keyStrengths: string[];
    keyConcerns: string[];
    dimensionEvaluations?: {
      skillDNA?: DimensionEvaluation;
      experienceDNA?: DimensionEvaluation;
      behavioralDNA?: DimensionEvaluation;
      communicationDNA?: DimensionEvaluation;
      culturalDNA?: DimensionEvaluation;
    };
  };
  job?: {
    title: string;
  };
}

interface DimensionEvaluation {
  dimension: string;
  overallScore: number;
  traits: {
    name: string;
    score: number;
    evidence: string;
  }[];
}

export default function AnalysisReport() {
  const { id } = useParams();
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading analysis report...</p>
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
            <Clock size={32} color="#F59E0B" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#92400E' }}>Analysis Not Ready</h3>
            <p style={{ fontSize: '0.875rem', color: '#B45309' }}>
              This candidate has not completed their interview yet, or the AI analysis is still being processed.
            </p>
          </div>

          <Link to="/dashboard/candidates" className="btn btn-secondary">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  const dimensionEvaluations = recommendation.dimensionEvaluations || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem' }}>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/dashboard/candidates" style={{ color: '#6B7280', display: 'flex' }}>
              <ArrowLeft size={18} />
            </Link>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>{initials}</div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937' }}>
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>{candidate.job?.title || 'No job assigned'}</p>
            </div>
          </div>
          <Link to={`/dashboard/candidates/${id}/decision`} className="btn btn-primary btn-sm">
            Make Decision
          </Link>
        </div>

        {/* Interview Details Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '0.75rem 1rem',
          background: '#F9FAFB',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={14} color="#6B7280" />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{candidate.interviewDate || 'Date not recorded'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={14} color="#6B7280" />
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{candidate.interviewDuration || 'Duration not recorded'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dna size={14} color="#E91E63" />
            <span style={{ fontSize: '0.75rem', color: '#E91E63', fontWeight: 500 }}>Job DNA™ Analysis</span>
          </div>
        </div>

        {/* DNA Score Overview */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Dna size={16} color="#E91E63" />
            <h2 style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1F2937' }}>DNA Match Overview</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(${recommendation.overallScore >= 90 ? '#10B981' : recommendation.overallScore >= 80 ? '#E91E63' : '#F59E0B'} ${recommendation.overallScore * 3.6}deg, #F3F4F6 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: recommendation.overallScore >= 90 ? '#10B981' : recommendation.overallScore >= 80 ? '#E91E63' : '#F59E0B' }}>
                  {recommendation.overallScore}%
                </span>
                <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Overall Match</span>
              </div>
            </div>
          </div>

          {/* Dimension Bars */}
          {Object.entries(dimensionEvaluations).map(([key, evaluation]) => {
            if (!evaluation) return null;
            const score = evaluation.overallScore;
            const scoreColor = score >= 90 ? '#10B981' : score >= 80 ? '#E91E63' : '#F59E0B';

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ width: '120px', fontSize: '0.75rem', color: '#6B7280' }}>
                  {evaluation.dimension}
                </span>
                <div style={{ flex: 1, height: '20px', background: '#F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${score}%`,
                    height: '100%',
                    background: scoreColor,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.5rem',
                    transition: 'width 0.5s ease'
                  }}>
                    <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: 600 }}>{score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Strengths & Concerns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#10B981' }}>Key Strengths</h3>
            {recommendation.keyStrengths.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#065F46' }}>
                {recommendation.keyStrengths.map((s, i) => (
                  <li key={i} style={{ marginBottom: '0.375rem' }}>{s}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#6B7280', fontStyle: 'italic' }}>No strengths recorded</p>
            )}
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#F59E0B' }}>Key Concerns</h3>
            {recommendation.keyConcerns.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#92400E' }}>
                {recommendation.keyConcerns.map((c, i) => (
                  <li key={i} style={{ marginBottom: '0.375rem' }}>{c}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#065F46' }}>No significant concerns identified</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/dashboard/candidates/${id}/decision`} className="btn btn-primary">
            Make Final Decision
          </Link>
          <button className="btn btn-secondary">
            <FileText size={16} /> View Full Transcript
          </button>
          <button className="btn btn-ghost">
            Download Report
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        {/* AI Recommendation Panel */}
        <div className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>AI Recommendation</h3>
          <div style={{
            padding: '1rem',
            background: recommendation.recommendation === 'Hire'
              ? 'rgba(16, 185, 129, 0.1)'
              : recommendation.recommendation === 'Hold'
                ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            marginBottom: '0.75rem'
          }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: recommendation.recommendation === 'Hire' ? '#10B981' : recommendation.recommendation === 'Hold' ? '#F59E0B' : '#EF4444'
            }}>
              {recommendation.recommendation}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              {recommendation.confidence}% confidence
            </p>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#4B5563', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{recommendation.summary}"
          </p>
        </div>

        {/* Score Legend */}
        <div style={{
          padding: '0.75rem',
          background: '#F9FAFB',
          borderRadius: '0.5rem',
          border: '1px solid #E5E7EB',
          marginBottom: '0.75rem'
        }}>
          <p style={{ fontSize: '0.625rem', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 600 }}>Score Legend</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#10B981' }} />
              <span style={{ color: '#6B7280' }}>90%+ Excellent Match</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#E91E63' }} />
              <span style={{ color: '#6B7280' }}>80-89% Good Match</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#F59E0B' }} />
              <span style={{ color: '#6B7280' }}>&lt;80% Needs Review</span>
            </div>
          </div>
        </div>

        {/* DNA Transparency Notice */}
        <div style={{
          padding: '0.75rem',
          background: 'rgba(233, 30, 99, 0.05)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(233, 30, 99, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Dna size={12} color="#E91E63" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#BE185D' }}>Job DNA™ Transparency</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9D174D', lineHeight: 1.5 }}>
            All evaluations are based on the approved Job DNA™ framework.
            Each score is linked to specific traits with evidence from the interview transcript.
          </p>
        </div>
      </div>
    </div>
  );
}
