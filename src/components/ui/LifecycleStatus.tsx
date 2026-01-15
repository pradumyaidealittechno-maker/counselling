import { 
  FileEdit, 
  Clock, 
  CheckCircle, 
  Brain, 
  Sparkles, 
  Play, 
  Archive 
} from 'lucide-react';
import type { JobDNALifecycleStatus } from '../../types/jobDNA';

interface LifecycleStatusProps {
  status: JobDNALifecycleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<JobDNALifecycleStatus, { 
  label: string; 
  bg: string; 
  text: string; 
  border: string;
  icon: typeof FileEdit;
}> = {
  draft: { 
    label: 'Draft', 
    bg: 'rgba(107, 114, 128, 0.1)', 
    text: '#6B7280', 
    border: 'rgba(107, 114, 128, 0.3)',
    icon: FileEdit
  },
  pending_review: { 
    label: 'Pending Review', 
    bg: 'rgba(245, 158, 11, 0.1)', 
    text: '#D97706', 
    border: 'rgba(245, 158, 11, 0.3)',
    icon: Clock
  },
  approved: { 
    label: 'Approved', 
    bg: 'rgba(16, 185, 129, 0.1)', 
    text: '#059669', 
    border: 'rgba(16, 185, 129, 0.3)',
    icon: CheckCircle
  },
  ai_training: { 
    label: 'AI Training', 
    bg: 'rgba(99, 102, 241, 0.1)', 
    text: '#6366F1', 
    border: 'rgba(99, 102, 241, 0.3)',
    icon: Brain
  },
  ai_trained: { 
    label: 'AI Trained', 
    bg: 'rgba(139, 92, 246, 0.1)', 
    text: '#8B5CF6', 
    border: 'rgba(139, 92, 246, 0.3)',
    icon: Sparkles
  },
  active: { 
    label: 'Active', 
    bg: 'rgba(233, 30, 99, 0.1)', 
    text: '#E91E63', 
    border: 'rgba(233, 30, 99, 0.3)',
    icon: Play
  },
  archived: { 
    label: 'Archived', 
    bg: 'rgba(156, 163, 175, 0.1)', 
    text: '#9CA3AF', 
    border: 'rgba(156, 163, 175, 0.3)',
    icon: Archive
  }
};

const sizeStyles = {
  sm: { padding: '0.25rem 0.5rem', fontSize: '0.625rem', iconSize: 10, gap: '0.25rem' },
  md: { padding: '0.375rem 0.75rem', fontSize: '0.75rem', iconSize: 12, gap: '0.375rem' },
  lg: { padding: '0.5rem 1rem', fontSize: '0.875rem', iconSize: 14, gap: '0.5rem' }
};

export default function LifecycleStatus({ status, size = 'md', showIcon = true }: LifecycleStatusProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeStyles[size];
  const Icon = config.icon;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: sizeStyle.gap,
      padding: sizeStyle.padding,
      borderRadius: '9999px',
      fontSize: sizeStyle.fontSize,
      fontWeight: 500,
      background: config.bg,
      color: config.text,
      border: `1px solid ${config.border}`
    }}>
      {showIcon && <Icon size={sizeStyle.iconSize} />}
      {config.label}
    </span>
  );
}

export { statusConfig };
