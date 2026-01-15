import { AlertTriangle, Info } from 'lucide-react';

interface CulturalDNAToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  showWarning?: boolean;
}

export default function CulturalDNAToggle({ enabled, onToggle, showWarning = true }: CulturalDNAToggleProps) {
  return (
    <div style={{
      padding: '1rem',
      background: enabled ? 'rgba(168, 85, 247, 0.05)' : '#F9FAFB',
      border: `1px solid ${enabled ? 'rgba(168, 85, 247, 0.2)' : '#E5E7EB'}`,
      borderRadius: '0.75rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>
              Cultural DNA
            </span>
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#A855F7',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              Optional
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            Evaluates environment fit, not personality
          </p>
        </div>
        
        <button
          onClick={() => onToggle(!enabled)}
          style={{
            width: '48px',
            height: '28px',
            background: enabled ? '#A855F7' : '#E5E7EB',
            borderRadius: '14px',
            position: 'relative',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: enabled ? '22px' : '2px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
        </button>
      </div>

      {showWarning && enabled && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          padding: '0.75rem',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '0.5rem',
          marginTop: '0.75rem'
        }}>
          <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 500, marginBottom: '0.25rem' }}>
              Transparency Notice
            </p>
            <p style={{ fontSize: '0.625rem', color: '#B45309', lineHeight: 1.5 }}>
              Cultural DNA evaluates work environment preferences (pace, autonomy, structure), 
              not personality traits. All Cultural DNA criteria are visible to candidates and 
              reviewers for full transparency.
            </p>
          </div>
        </div>
      )}

      {!enabled && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: '#F3F4F6',
          borderRadius: '0.375rem',
          marginTop: '0.75rem'
        }}>
          <Info size={12} color="#6B7280" />
          <p style={{ fontSize: '0.625rem', color: '#6B7280' }}>
            Enable to add work environment preferences to evaluation criteria
          </p>
        </div>
      )}
    </div>
  );
}
