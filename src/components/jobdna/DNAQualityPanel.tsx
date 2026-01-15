import { AlertTriangle, Lightbulb, Dna, TrendingUp } from 'lucide-react';
import { QualityScore } from '../ui';
import type { DNAQualityMetrics } from '../../types/jobDNA';

interface DNAQualityPanelProps {
  quality: DNAQualityMetrics;
  totalTraits: number;
  culturalDNAEnabled?: boolean;
}

export default function DNAQualityPanel({ 
  quality, 
  totalTraits,
  culturalDNAEnabled = true 
}: DNAQualityPanelProps) {
  const { completenessScore, balanceScore, coverageByDimension, warnings, suggestions } = quality;
  const overallScore = Math.round((completenessScore + balanceScore) / 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Overall Quality Score */}
      <div className="card" style={{ 
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(233, 30, 99, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Dna size={16} color="#E91E63" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>DNA Quality</span>
        </div>
        
        {/* Main Score */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto',
            position: 'relative'
          }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="35" fill="none" stroke="#F3F4F6" strokeWidth="8" />
              <circle 
                cx="40" cy="40" r="35" fill="none" 
                stroke="url(#qualityGradient)" strokeWidth="8"
                strokeDasharray={`${overallScore * 2.2} 220`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E91E63" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>{overallScore}%</p>
            </div>
          </div>
          <p style={{ fontSize: '0.625rem', color: '#6B7280', marginTop: '0.5rem' }}>
            {totalTraits} Total Traits
          </p>
        </div>

        {/* Sub-scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ 
            padding: '0.5rem',
            background: 'white',
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#E91E63' }}>{completenessScore}%</p>
            <p style={{ fontSize: '0.625rem', color: '#6B7280' }}>Completeness</p>
          </div>
          <div style={{ 
            padding: '0.5rem',
            background: 'white',
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#6366F1' }}>{balanceScore}%</p>
            <p style={{ fontSize: '0.625rem', color: '#6B7280' }}>Balance</p>
          </div>
        </div>
      </div>

      {/* Dimension Coverage */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <TrendingUp size={14} color="#6366F1" />
          <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#1F2937' }}>Coverage by Dimension</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(coverageByDimension)
            .filter(([key]) => key !== 'culturalDNA' || culturalDNAEnabled)
            .map(([key, value]) => {
              const labels: Record<string, string> = {
                skillDNA: 'Skill',
                experienceDNA: 'Experience',
                behavioralDNA: 'Behavioral',
                communicationDNA: 'Communication',
                culturalDNA: 'Cultural'
              };
              return (
                <QualityScore 
                  key={key} 
                  score={value} 
                  label={labels[key]} 
                  size="sm" 
                />
              );
            })}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={14} color="#F59E0B" />
            <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#1F2937' }}>Warnings</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {warnings.map((warning, i) => (
              <div key={i} style={{
                padding: '0.5rem',
                background: 'rgba(245, 158, 11, 0.05)',
                borderRadius: '0.375rem',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <p style={{ fontSize: '0.625rem', color: '#92400E' }}>{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb size={14} color="#6366F1" />
            <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#1F2937' }}>Suggestions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {suggestions.map((suggestion, i) => (
              <div key={i} style={{
                padding: '0.5rem',
                background: 'rgba(99, 102, 241, 0.05)',
                borderRadius: '0.375rem',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <p style={{ fontSize: '0.625rem', color: '#4338CA' }}>{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
