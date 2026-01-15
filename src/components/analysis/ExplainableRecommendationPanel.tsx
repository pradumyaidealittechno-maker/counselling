import { Sparkles, AlertTriangle, CheckCircle, Users, Dna } from 'lucide-react';
import type { ExplainableRecommendation } from '../../types/jobDNA';

interface ExplainableRecommendationPanelProps {
  recommendation: ExplainableRecommendation;
}

export default function ExplainableRecommendationPanel({ 
  recommendation
}: ExplainableRecommendationPanelProps) {
  const { decision, confidence, overallScore, summary, keyStrengths, keyConcerns, comparisonToOtherCandidates } = recommendation;

  const decisionConfig = {
    Hire: { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', border: 'rgba(16, 185, 129, 0.2)', color: '#10B981', icon: CheckCircle },
    Hold: { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)', border: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', icon: AlertTriangle },
    Reject: { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)', border: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', icon: AlertTriangle }
  };

  const config = decisionConfig[decision];
  const DecisionIcon = config.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* AI Recommendation Card */}
      <div style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: config.color,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DecisionIcon size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.625rem', color: config.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={10} /> AI Recommendation
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: config.color }}>{decision}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{
            flex: 1,
            padding: '0.5rem',
            background: 'white',
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>{confidence}%</p>
            <p style={{ fontSize: '0.5rem', color: '#6B7280' }}>Confidence</p>
          </div>
          <div style={{
            flex: 1,
            padding: '0.5rem',
            background: 'white',
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#E91E63' }}>{overallScore}%</p>
            <p style={{ fontSize: '0.5rem', color: '#6B7280' }}>DNA Match</p>
          </div>
        </div>
      </div>

      {/* Comparison to other candidates */}
      {comparisonToOtherCandidates && (
        <div className="card" style={{ padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Users size={14} color="#6366F1" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1F2937' }}>Candidate Comparison</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: '#F3F4F6',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${comparisonToOtherCandidates.percentile}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)',
                borderRadius: '4px'
              }} />
              <div style={{
                position: 'absolute',
                left: `${comparisonToOtherCandidates.percentile}%`,
                top: '-4px',
                transform: 'translateX(-50%)',
                width: '16px',
                height: '16px',
                background: '#E91E63',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E91E63' }}>
              Top {100 - comparisonToOtherCandidates.percentile}%
            </span>
          </div>
          <p style={{ fontSize: '0.625rem', color: '#6B7280', marginTop: '0.375rem' }}>
            Ranked higher than {comparisonToOtherCandidates.percentile}% of {comparisonToOtherCandidates.totalCandidates} candidates
          </p>
        </div>
      )}

      {/* AI Explanation */}
      <div className="card" style={{ 
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)',
        border: '1px solid rgba(233, 30, 99, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Dna size={14} color="#E91E63" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1F2937' }}>AI Explanation</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.6, fontStyle: 'italic' }}>
          "{summary}"
        </p>
      </div>

      {/* Key Strengths */}
      <div className="card" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <CheckCircle size={14} color="#10B981" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1F2937' }}>Key Strengths</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {keyStrengths.map((strength, i) => (
            <li key={i} style={{ fontSize: '0.6875rem', color: '#065F46', marginBottom: '0.25rem' }}>{strength}</li>
          ))}
        </ul>
      </div>

      {/* Key Concerns */}
      {keyConcerns.length > 0 && (
        <div className="card" style={{ padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={14} color="#F59E0B" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1F2937' }}>Key Concerns</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {keyConcerns.map((concern, i) => (
              <li key={i} style={{ fontSize: '0.6875rem', color: '#92400E', marginBottom: '0.25rem' }}>{concern}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
