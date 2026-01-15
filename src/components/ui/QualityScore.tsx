import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface QualityScoreProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showBar?: boolean;
}

const getScoreConfig = (score: number) => {
  if (score >= 90) {
    return { 
      color: '#10B981', 
      bg: 'rgba(16, 185, 129, 0.1)', 
      border: 'rgba(16, 185, 129, 0.3)',
      label: 'Excellent',
      icon: CheckCircle
    };
  } else if (score >= 75) {
    return { 
      color: '#F59E0B', 
      bg: 'rgba(245, 158, 11, 0.1)', 
      border: 'rgba(245, 158, 11, 0.3)',
      label: 'Good',
      icon: AlertTriangle
    };
  } else {
    return { 
      color: '#EF4444', 
      bg: 'rgba(239, 68, 68, 0.1)', 
      border: 'rgba(239, 68, 68, 0.3)',
      label: 'Needs Improvement',
      icon: AlertCircle
    };
  }
};

const sizeStyles = {
  sm: { fontSize: '0.75rem', barHeight: 4, iconSize: 12 },
  md: { fontSize: '0.875rem', barHeight: 6, iconSize: 14 },
  lg: { fontSize: '1rem', barHeight: 8, iconSize: 16 }
};

export default function QualityScore({ 
  score, 
  label, 
  size = 'md', 
  showIcon = false,
  showBar = true 
}: QualityScoreProps) {
  const config = getScoreConfig(score);
  const sizeStyle = sizeStyles[size];
  const Icon = config.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {showIcon && <Icon size={sizeStyle.iconSize} color={config.color} />}
          {label && (
            <span style={{ fontSize: sizeStyle.fontSize, color: '#6B7280' }}>{label}</span>
          )}
        </div>
        <span style={{ 
          fontSize: sizeStyle.fontSize, 
          fontWeight: 600, 
          color: config.color 
        }}>
          {score}%
        </span>
      </div>
      {showBar && (
        <div style={{ 
          height: sizeStyle.barHeight, 
          background: '#E5E7EB', 
          borderRadius: sizeStyle.barHeight / 2,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            background: config.color,
            borderRadius: sizeStyle.barHeight / 2,
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
    </div>
  );
}

export { getScoreConfig };
