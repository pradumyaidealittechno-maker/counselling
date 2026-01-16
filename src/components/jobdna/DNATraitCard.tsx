import { Edit3, Trash2, GripVertical, Info } from 'lucide-react';
import { ImportanceBadge, SkillCategoryBadge, SkillDepthIndicator } from '../ui';
import type { DNATrait, SkillDNATrait, ExperienceDNATrait, ImportanceLevel } from '../../types/jobDNA';

interface DNATraitCardProps {
  trait: DNATrait;
  index: number;
  onEdit?: (trait: DNATrait) => void;
  onDelete?: (traitId: string) => void;
  onImportanceChange?: (traitId: string, importance: ImportanceLevel) => void;
  editable?: boolean;
  showDetails?: boolean;
}

export default function DNATraitCard({
  trait,
  index,
  onEdit,
  onDelete,
  onImportanceChange,
  editable = true,
  showDetails = true
}: DNATraitCardProps) {
  const isSkillTrait = trait.dimension === 'Skill DNA';
  const isExperienceTrait = trait.dimension === 'Experience DNA';
  const skillTrait = isSkillTrait ? trait as SkillDNATrait : null;
  const experienceTrait = isExperienceTrait ? trait as ExperienceDNATrait : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '0.75rem',
      background: '#F9FAFB',
      borderRadius: '0.5rem',
      border: '1px solid #E5E7EB',
      transition: 'all 0.2s'
    }}>
      {/* Main Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        {editable && (
          <GripVertical
            size={16}
            color="#9CA3AF"
            style={{ cursor: 'grab', marginTop: '2px', flexShrink: 0 }}
          />
        )}

        <span style={{
          width: '20px',
          height: '20px',
          background: '#E91E63',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.625rem',
          fontWeight: 600,
          flexShrink: 0
        }}>
          {index + 1}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {editable ? (
            <input
              type="text"
              defaultValue={trait.trait}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: '0.8125rem',
                fontWeight: 500,
                outline: 'none',
                color: '#1F2937'
              }}
            />
          ) : (
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1F2937' }}>
              {trait.trait}
            </p>
          )}

          {trait.description && showDetails && (
            <p style={{ fontSize: '0.625rem', color: '#6B7280', marginTop: '0.125rem' }}>
              {trait.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {editable ? (
            <select
              defaultValue={trait.importance}
              onChange={(e) => onImportanceChange?.(trait.id, e.target.value as ImportanceLevel)}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
                border: '1px solid #E5E7EB',
                background: 'white',
                fontSize: '0.625rem',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          ) : (
            <ImportanceBadge importance={trait.importance} size="sm" />
          )}

          {editable && (
            <>
              <button
                onClick={() => onEdit?.(trait)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Edit3 size={14} color="#6B7280" />
              </button>
              <button
                onClick={() => onDelete?.(trait.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Trash2 size={14} color="#EF4444" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Skill DNA specific details */}
      {skillTrait && showDetails && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginLeft: editable ? '2.25rem' : '1.75rem',
          flexWrap: 'wrap'
        }}>
          <SkillCategoryBadge category={skillTrait.category} size="sm" />
          <SkillDepthIndicator depth={skillTrait.depth} size="sm" />

          {skillTrait.tools && skillTrait.tools.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={10} color="#9CA3AF" />
              <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>
                {skillTrait.tools.slice(0, 3).join(', ')}
                {skillTrait.tools.length > 3 && ` +${skillTrait.tools.length - 3}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Experience DNA specific details */}
      {experienceTrait && showDetails && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginLeft: editable ? '2.25rem' : '1.75rem',
          flexWrap: 'wrap'
        }}>
          {experienceTrait.yearsRange && (
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {experienceTrait.yearsRange.min}-{experienceTrait.yearsRange.max} years
              {experienceTrait.yearsRange.flexible && ' (flexible)'}
            </span>
          )}

          {experienceTrait.seniorityLevel && (
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#6366F1',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              {experienceTrait.seniorityLevel}
            </span>
          )}

          {experienceTrait.decisionMakingLevel && (
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#D97706',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              {experienceTrait.decisionMakingLevel} decisions
            </span>
          )}
        </div>
      )}
    </div>
  );
}
