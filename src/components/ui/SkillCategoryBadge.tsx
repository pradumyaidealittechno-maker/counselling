import { Check, Star } from 'lucide-react';
import type { SkillCategory } from '../../types/jobDNA';

interface SkillCategoryBadgeProps {
  category: SkillCategory;
  size?: 'sm' | 'md';
}

const categoryConfig: Record<SkillCategory, { bg: string; text: string; border: string; icon: typeof Check }> = {
  'must-have': { 
    bg: 'rgba(239, 68, 68, 0.1)', 
    text: '#DC2626', 
    border: 'rgba(239, 68, 68, 0.3)',
    icon: Check
  },
  'nice-to-have': { 
    bg: 'rgba(99, 102, 241, 0.1)', 
    text: '#6366F1', 
    border: 'rgba(99, 102, 241, 0.3)',
    icon: Star
  }
};

const sizeStyles = {
  sm: { padding: '0.125rem 0.5rem', fontSize: '0.625rem', iconSize: 10 },
  md: { padding: '0.25rem 0.625rem', fontSize: '0.75rem', iconSize: 12 }
};

export default function SkillCategoryBadge({ category, size = 'sm' }: SkillCategoryBadgeProps) {
  const config = categoryConfig[category];
  const sizeStyle = sizeStyles[size];
  const Icon = config.icon;
  const label = category === 'must-have' ? 'Must-have' : 'Nice-to-have';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: sizeStyle.padding,
      borderRadius: '9999px',
      fontSize: sizeStyle.fontSize,
      fontWeight: 500,
      background: config.bg,
      color: config.text,
      border: `1px solid ${config.border}`
    }}>
      <Icon size={sizeStyle.iconSize} />
      {label}
    </span>
  );
}
