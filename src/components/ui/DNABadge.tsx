import { Dna } from 'lucide-react';
import type { DNADimension, ImportanceLevel } from '../../types/jobDNA';

interface DNABadgeProps {
  dimension?: DNADimension;
  importance?: ImportanceLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
}

const dimensionColors: Record<DNADimension, { bg: string; text: string; border: string }> = {
  'Skill DNA': { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366F1', border: 'rgba(99, 102, 241, 0.3)' },
  'Experience DNA': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  'Behavioral DNA': { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  'Communication DNA': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  'Cultural DNA': { bg: 'rgba(168, 85, 247, 0.1)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' }
};

const importanceColors: Record<ImportanceLevel, { bg: string; text: string; border: string }> = {
  High: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626', border: 'rgba(239, 68, 68, 0.3)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706', border: 'rgba(245, 158, 11, 0.3)' },
  Low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16A34A', border: 'rgba(34, 197, 94, 0.3)' }
};

const sizeStyles = {
  sm: { padding: '0.125rem 0.5rem', fontSize: '0.625rem', iconSize: 10 },
  md: { padding: '0.25rem 0.75rem', fontSize: '0.75rem', iconSize: 12 },
  lg: { padding: '0.375rem 1rem', fontSize: '0.875rem', iconSize: 14 }
};

export default function DNABadge({ 
  dimension, 
  importance, 
  showIcon = true, 
  size = 'md',
  variant = 'default'
}: DNABadgeProps) {
  const colors = dimension ? dimensionColors[dimension] : importance ? importanceColors[importance] : dimensionColors['Skill DNA'];
  const sizeStyle = sizeStyles[size];
  const label = dimension || importance;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: sizeStyle.padding,
      borderRadius: '9999px',
      fontSize: sizeStyle.fontSize,
      fontWeight: 500,
      background: variant === 'outline' ? 'transparent' : colors.bg,
      color: colors.text,
      border: variant !== 'filled' ? `1px solid ${colors.border}` : 'none',
      whiteSpace: 'nowrap'
    }}>
      {showIcon && dimension && <Dna size={sizeStyle.iconSize} />}
      {label}
    </span>
  );
}

export { dimensionColors, importanceColors };
