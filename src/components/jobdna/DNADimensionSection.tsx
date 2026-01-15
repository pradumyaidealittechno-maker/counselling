import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, AlertTriangle } from 'lucide-react';
import DNATraitCard from './DNATraitCard';
import type { DNATrait, DNADimension, ImportanceLevel } from '../../types/jobDNA';

interface DNADimensionSectionProps {
  dimension: DNADimension;
  traits: DNATrait[];
  defaultExpanded?: boolean;
  editable?: boolean;
  showWarnings?: boolean;
  onAddTrait?: () => void;
  onEditTrait?: (trait: DNATrait) => void;
  onDeleteTrait?: (traitId: string) => void;
  onImportanceChange?: (traitId: string, importance: ImportanceLevel) => void;
}

const dimensionDescriptions: Record<DNADimension, string> = {
  'Skill DNA': 'Technical and functional abilities required for the role',
  'Experience DNA': 'Level and type of experience expected',
  'Behavioral DNA': 'How the candidate is expected to behave at work',
  'Communication DNA': 'How the candidate should communicate',
  'Cultural DNA': 'Environment fit preferences (optional, transparent)'
};

export default function DNADimensionSection({
  dimension,
  traits,
  defaultExpanded = false,
  editable = true,
  showWarnings = true,
  onAddTrait,
  onEditTrait,
  onDeleteTrait,
  onImportanceChange
}: DNADimensionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const highCount = traits.filter(t => t.importance === 'High').length;
  const isCultural = dimension === 'Cultural DNA';
  const hasWarning = showWarnings && highCount > 3;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          background: isCultural ? 'rgba(168, 85, 247, 0.03)' : 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>
                {dimension}
              </h3>
              <span style={{ 
                background: 'rgba(233, 30, 99, 0.1)', 
                color: '#E91E63', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px', 
                fontSize: '0.625rem',
                fontWeight: 500
              }}>
                {traits.length} traits
              </span>
              {isCultural && (
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
              )}
              {hasWarning && (
                <AlertTriangle size={14} color="#F59E0B" />
              )}
            </div>
            <p style={{ fontSize: '0.625rem', color: '#6B7280', marginTop: '0.125rem' }}>
              {dimensionDescriptions[dimension]}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Importance breakdown */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {highCount > 0 && (
              <span style={{ 
                fontSize: '0.5rem', 
                padding: '0.125rem 0.375rem',
                borderRadius: '9999px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#DC2626'
              }}>
                {highCount}H
              </span>
            )}
            {traits.filter(t => t.importance === 'Medium').length > 0 && (
              <span style={{ 
                fontSize: '0.5rem', 
                padding: '0.125rem 0.375rem',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#D97706'
              }}>
                {traits.filter(t => t.importance === 'Medium').length}M
              </span>
            )}
            {traits.filter(t => t.importance === 'Low').length > 0 && (
              <span style={{ 
                fontSize: '0.5rem', 
                padding: '0.125rem 0.375rem',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#16A34A'
              }}>
                {traits.filter(t => t.importance === 'Low').length}L
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '0.75rem' }}>
          {/* Warning for too many high importance */}
          {hasWarning && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '0.375rem',
              marginBottom: '0.75rem'
            }}>
              <AlertTriangle size={12} color="#D97706" />
              <span style={{ fontSize: '0.625rem', color: '#92400E' }}>
                Consider reducing High importance traits ({highCount}) to prioritize better
              </span>
            </div>
          )}

          {/* Cultural DNA transparency notice */}
          {isCultural && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(168, 85, 247, 0.05)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '0.375rem',
              marginBottom: '0.75rem'
            }}>
              <AlertTriangle size={12} color="#A855F7" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '0.625rem', color: '#7C3AED', lineHeight: 1.5 }}>
                Cultural DNA evaluates environment fit, not personality. All criteria are transparent 
                and visible to candidates and reviewers.
              </p>
            </div>
          )}

          {/* Traits list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {traits.map((trait, i) => (
              <DNATraitCard
                key={trait.id}
                trait={trait}
                index={i}
                editable={editable}
                onEdit={onEditTrait}
                onDelete={onDeleteTrait}
                onImportanceChange={onImportanceChange}
              />
            ))}
          </div>

          {/* Add trait button */}
          {editable && (
            <button 
              onClick={onAddTrait}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#6366F1', 
                fontSize: '0.75rem', 
                cursor: 'pointer',
                marginTop: '0.75rem',
                padding: '0.25rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Plus size={14} /> Add Trait
            </button>
          )}
        </div>
      )}
    </div>
  );
}
