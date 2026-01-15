import { History, User, FileEdit, CheckCircle, XCircle, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { DNAChangeRecord } from '../../types/jobDNA';

interface DNAChangeHistoryProps {
  history: DNAChangeRecord[];
  maxVisible?: number;
}

const actionConfig: Record<DNAChangeRecord['action'], { icon: typeof FileEdit; color: string; label: string }> = {
  created: { icon: FileEdit, color: '#6366F1', label: 'Created' },
  edited: { icon: FileEdit, color: '#F59E0B', label: 'Edited' },
  approved: { icon: CheckCircle, color: '#10B981', label: 'Approved' },
  rejected: { icon: XCircle, color: '#EF4444', label: 'Rejected' },
  archived: { icon: Archive, color: '#6B7280', label: 'Archived' }
};

export default function DNAChangeHistory({ history, maxVisible = 3 }: DNAChangeHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleHistory = showAll ? history : history.slice(0, maxVisible);
  const hasMore = history.length > maxVisible;

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <History size={14} color="#6B7280" />
        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#1F2937' }}>Change History</span>
        <span style={{
          padding: '0.125rem 0.375rem',
          borderRadius: '9999px',
          fontSize: '0.5rem',
          fontWeight: 500,
          background: '#F3F4F6',
          color: '#6B7280'
        }}>
          {history.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visibleHistory.map((record, i) => {
          const config = actionConfig[record.action];
          const Icon = config.icon;
          const date = new Date(record.timestamp);
          
          return (
            <div key={record.id} style={{
              padding: '0.5rem',
              background: '#F9FAFB',
              borderRadius: '0.375rem',
              border: '1px solid #E5E7EB',
              position: 'relative'
            }}>
              {/* Timeline connector */}
              {i < visibleHistory.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '2rem',
                  bottom: '-0.5rem',
                  width: '1px',
                  background: '#E5E7EB'
                }} />
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: `${config.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={10} color={config.color} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem' }}>
                    <span style={{ 
                      fontSize: '0.625rem', 
                      fontWeight: 600, 
                      color: config.color 
                    }}>
                      {config.label}
                    </span>
                    <span style={{ fontSize: '0.5rem', color: '#9CA3AF' }}>•</span>
                    <span style={{ fontSize: '0.5rem', color: '#6B7280' }}>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                    <User size={10} color="#9CA3AF" />
                    <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>{record.userName}</span>
                  </div>
                  
                  {record.comment && (
                    <p style={{ fontSize: '0.625rem', color: '#4B5563', fontStyle: 'italic' }}>
                      "{record.comment}"
                    </p>
                  )}
                  
                  {record.changes && record.changes.length > 0 && (
                    <div style={{ marginTop: '0.375rem' }}>
                      {record.changes.map((change, j) => (
                        <div key={j} style={{ 
                          fontSize: '0.5rem', 
                          color: '#6B7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <span>{change.field}:</span>
                          <span style={{ textDecoration: 'line-through', color: '#EF4444' }}>{change.oldValue}</span>
                          <span>→</span>
                          <span style={{ color: '#10B981' }}>{change.newValue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginTop: '0.5rem',
            background: 'none',
            border: '1px dashed #E5E7EB',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            fontSize: '0.625rem',
            color: '#6B7280'
          }}
        >
          {showAll ? (
            <>Show Less <ChevronUp size={12} /></>
          ) : (
            <>Show {history.length - maxVisible} More <ChevronDown size={12} /></>
          )}
        </button>
      )}
    </div>
  );
}
