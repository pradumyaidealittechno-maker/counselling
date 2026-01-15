import type { SkillDepth } from '../../types/jobDNA';

interface SkillDepthIndicatorProps {
  depth: SkillDepth;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const depthConfig: Record<SkillDepth, { level: number; color: string; label: string }> = {
  beginner: { level: 1, color: '#22C55E', label: 'Beginner' },
  intermediate: { level: 2, color: '#F59E0B', label: 'Intermediate' },
  expert: { level: 3, color: '#EF4444', label: 'Expert' }
};

export default function SkillDepthIndicator({ depth, showLabel = true, size = 'sm' }: SkillDepthIndicatorProps) {
  const config = depthConfig[depth];
  const barWidth = size === 'sm' ? 16 : 20;
  const barHeight = size === 'sm' ? 4 : 6;
  const gap = size === 'sm' ? 2 : 3;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: `${gap}px` }}>
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: 2,
              background: level <= config.level ? config.color : '#E5E7EB'
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span style={{ 
          fontSize: size === 'sm' ? '0.625rem' : '0.75rem', 
          color: '#6B7280',
          fontWeight: 500
        }}>
          {config.label}
        </span>
      )}
    </div>
  );
}
