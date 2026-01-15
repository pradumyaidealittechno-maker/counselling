import { CheckCircle, AlertCircle, Dna } from 'lucide-react';
import type { DNADimension } from '../../types/jobDNA';

interface DNACoverageIndicatorProps {
  coverage: {
    skillDNA: number;
    experienceDNA: number;
    behavioralDNA: number;
    communicationDNA: number;
    culturalDNA: number;
  };
  culturalDNAEnabled?: boolean;
  compact?: boolean;
}

const dimensionLabels: Record<string, { label: string; dimension: DNADimension; color: string }> = {
  skillDNA: { label: 'Skill', dimension: 'Skill DNA', color: '#6366F1' },
  experienceDNA: { label: 'Experience', dimension: 'Experience DNA', color: '#10B981' },
  behavioralDNA: { label: 'Behavioral', dimension: 'Behavioral DNA', color: '#F59E0B' },
  communicationDNA: { label: 'Communication', dimension: 'Communication DNA', color: '#3B82F6' },
  culturalDNA: { label: 'Cultural', dimension: 'Cultural DNA', color: '#A855F7' }
};

export default function DNACoverageIndicator({ 
  coverage, 
  culturalDNAEnabled = true,
  compact = false 
}: DNACoverageIndicatorProps) {
  const dimensions = Object.entries(coverage).filter(
    ([key]) => key !== 'culturalDNA' || culturalDNAEnabled
  );
  
  const totalDimensions = dimensions.length;
  const coveredDimensions = dimensions.filter(([, value]) => value > 0).length;
  const allCovered = coveredDimensions === totalDimensions;

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        background: allCovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${allCovered ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '9999px'
      }}>
        <Dna size={12} color={allCovered ? '#10B981' : '#F59E0B'} />
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 500,
          color: allCovered ? '#059669' : '#D97706'
        }}>
          DNA Coverage: {coveredDimensions}/{totalDimensions}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem',
      background: '#F9FAFB',
      borderRadius: '0.75rem',
      border: '1px solid #E5E7EB'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Dna size={16} color="#E91E63" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>
            DNA Coverage
          </span>
        </div>
        <span style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.625rem',
          fontWeight: 600,
          background: allCovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: allCovered ? '#059669' : '#D97706'
        }}>
          {coveredDimensions}/{totalDimensions} Dimensions
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {dimensions.map(([key, value]) => {
          const config = dimensionLabels[key];
          const isCovered = value > 0;
          
          return (
            <div key={key} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              background: 'white',
              borderRadius: '0.375rem',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isCovered ? (
                  <CheckCircle size={14} color="#10B981" />
                ) : (
                  <AlertCircle size={14} color="#F59E0B" />
                )}
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: isCovered ? '#374151' : '#9CA3AF',
                  fontWeight: 500
                }}>
                  {config.label} DNA
                </span>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: isCovered ? config.color : '#9CA3AF'
              }}>
                {value} traits
              </span>
            </div>
          );
        })}
      </div>

      {!allCovered && (
        <p style={{ 
          fontSize: '0.625rem', 
          color: '#D97706', 
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <AlertCircle size={10} />
          Some dimensions need more traits for comprehensive evaluation
        </p>
      )}
    </div>
  );
}
