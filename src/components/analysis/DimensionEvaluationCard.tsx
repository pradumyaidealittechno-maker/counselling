import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { DNABadge } from '../ui';
import type { DimensionEvaluation, TraitEvaluation } from '../../types/jobDNA';

interface DimensionEvaluationCardProps {
  evaluation: DimensionEvaluation;
  defaultExpanded?: boolean;
}

export default function DimensionEvaluationCard({ 
  evaluation, 
  defaultExpanded = false 
}: DimensionEvaluationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { dimension, overallScore, traitEvaluations, strengths, gaps, impact } = evaluation;

  const impactColors = {
    positive: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#059669' },
    neutral: { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.2)', text: '#6B7280' },
    negative: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#DC2626' }
  };

  const impactConfig = impactColors[impact];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <DNABadge dimension={dimension} size="sm" />
          <span style={{ 
            fontSize: '1.125rem', 
            fontWeight: 700, 
            color: overallScore >= 90 ? '#10B981' : overallScore >= 80 ? '#6366F1' : '#F59E0B'
          }}>
            {overallScore}%
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.625rem',
            fontWeight: 500,
            background: impactConfig.bg,
            color: impactConfig.text,
            border: `1px solid ${impactConfig.border}`,
            textTransform: 'capitalize'
          }}>
            {impact} Impact
          </span>
          {isExpanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '1rem' }}>
          {/* Strengths & Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {/* Strengths */}
            <div style={{
              padding: '0.75rem',
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={12} color="#10B981" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>Strengths</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.625rem', color: '#065F46', marginBottom: '0.25rem' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div style={{
              padding: '0.75rem',
              background: gaps.length > 0 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '0.5rem',
              border: `1px solid ${gaps.length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={12} color={gaps.length > 0 ? '#F59E0B' : '#10B981'} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: gaps.length > 0 ? '#D97706' : '#059669' }}>
                  {gaps.length > 0 ? 'Gaps' : 'No Gaps'}
                </span>
              </div>
              {gaps.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                  {gaps.map((g, i) => (
                    <li key={i} style={{ fontSize: '0.625rem', color: '#92400E', marginBottom: '0.25rem' }}>{g}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.625rem', color: '#065F46' }}>All requirements met</p>
              )}
            </div>
          </div>

          {/* Trait-level evaluations */}
          {traitEvaluations.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                Trait-Level Evaluation
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {traitEvaluations.map((trait) => (
                  <TraitEvaluationRow key={trait.traitId} evaluation={trait} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TraitEvaluationRow({ evaluation }: { evaluation: TraitEvaluation }) {
  const [showDetails, setShowDetails] = useState(false);
  const { trait, importance, score, evidence, transcriptExcerpts } = evaluation;

  return (
    <div style={{
      padding: '0.5rem 0.75rem',
      background: '#F9FAFB',
      borderRadius: '0.375rem',
      border: '1px solid #E5E7EB'
    }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: evidence.length > 0 ? 'pointer' : 'default'
        }}
        onClick={() => evidence.length > 0 && setShowDetails(!showDetails)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>{trait}</span>
          <span style={{
            padding: '0.125rem 0.375rem',
            borderRadius: '9999px',
            fontSize: '0.5rem',
            fontWeight: 500,
            background: importance === 'High' ? 'rgba(239, 68, 68, 0.1)' : importance === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            color: importance === 'High' ? '#DC2626' : importance === 'Medium' ? '#D97706' : '#16A34A'
          }}>
            {importance}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: score >= 90 ? '#10B981' : score >= 80 ? '#6366F1' : '#F59E0B'
          }}>
            {score}%
          </span>
          {evidence.length > 0 && (
            showDetails ? <ChevronUp size={12} color="#6B7280" /> : <ChevronDown size={12} color="#6B7280" />
          )}
        </div>
      </div>

      {showDetails && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E5E7EB' }}>
          {/* Evidence */}
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.25rem' }}>Evidence:</p>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {evidence.map((e, i) => (
                <li key={i} style={{ fontSize: '0.625rem', color: '#4B5563', marginBottom: '0.125rem' }}>{e}</li>
              ))}
            </ul>
          </div>

          {/* Transcript excerpts */}
          {transcriptExcerpts && transcriptExcerpts.length > 0 && (
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MessageSquare size={10} /> Transcript Excerpts:
              </p>
              {transcriptExcerpts.map((excerpt, i) => (
                <div key={i} style={{
                  padding: '0.375rem 0.5rem',
                  background: 'white',
                  borderRadius: '0.25rem',
                  border: '1px solid #E5E7EB',
                  marginBottom: '0.25rem'
                }}>
                  <p style={{ fontSize: '0.625rem', color: '#4B5563', fontStyle: 'italic' }}>"{excerpt.text}"</p>
                  <p style={{ fontSize: '0.5rem', color: '#9CA3AF', marginTop: '0.125rem' }}>@ {excerpt.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
