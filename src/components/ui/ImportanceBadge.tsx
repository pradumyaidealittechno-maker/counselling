import type { ImportanceLevel } from '../../types/jobDNA';

interface ImportanceBadgeProps {
  importance: ImportanceLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const importanceConfig: Record<ImportanceLevel, { bg: string; text: string; border: string; dot: string }> = {
  High: { 
    bg: 'rgba(239, 68, 68, 0.1)', 
    text: '#DC2626', 
    border: 'rgba(239, 68, 68, 0.3)',
    dot: '#EF4444'
  },
  Medium: { 
    bg: 'rgba(245, 158, 11, 0.1)', 
    text: '#D97706', 
    border: 'rgba(245, 158, 11, 0.3)',
    dot: '#F59E0B'
  },
  Low: { 
    bg: 'rgba(34, 197, 94, 0.1)', 
    text: '#16A34A', 
    border: 'rgba(34, 197, 94, 0.3)',
    dot: '#22C55E'
  }
};

const sizeStyles = {
  sm: { padding: '0.125rem 0.5rem', fontSize: '0.625rem', dotSize: 6 },
  md: { padding: '0.25rem 0.625rem', fontSize: '0.75rem', dotSize: 8 },
  lg: { padding: '0.375rem 0.875rem', fontSize: '0.875rem', dotSize: 10 }
};

export default function ImportanceBadge({ importance, size = 'sm', showDot = false }: ImportanceBadgeProps) {
  const config = importanceConfig[importance];
  const sizeStyle = sizeStyles[size];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: sizeStyle.padding,
      borderRadius: '9999px',
      fontSize: sizeStyle.fontSize,
      fontWeight: 500,
      background: config.bg,
      color: config.text,
      border: `1px solid ${config.border}`
    }}>
      {showDot && (
        <span style={{
          width: sizeStyle.dotSize,
          height: sizeStyle.dotSize,
          borderRadius: '50%',
          background: config.dot
        }} />
      )}
      {importance}
    </span>
  );
}

export { importanceConfig };
