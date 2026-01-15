import { Shield, Clock, User, Calendar } from 'lucide-react';
import type { JobDNAApproval } from '../../types/jobDNA';

interface ApprovalBadgeProps {
  approval: JobDNAApproval;
  showDetails?: boolean;
  size?: 'sm' | 'md';
}

export default function ApprovalBadge({ approval, showDetails = false, size = 'md' }: ApprovalBadgeProps) {
  const isApproved = approval.approved;
  const sizeStyle = size === 'sm' 
    ? { padding: '0.25rem 0.5rem', fontSize: '0.625rem', iconSize: 10 }
    : { padding: '0.375rem 0.75rem', fontSize: '0.75rem', iconSize: 12 };

  if (!showDetails) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: sizeStyle.padding,
        borderRadius: '9999px',
        fontSize: sizeStyle.fontSize,
        fontWeight: 500,
        background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        color: isApproved ? '#059669' : '#D97706',
        border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
      }}>
        {isApproved ? <Shield size={sizeStyle.iconSize} /> : <Clock size={sizeStyle.iconSize} />}
        {isApproved ? 'Human Approved' : 'Pending Approval'}
      </span>
    );
  }

  return (
    <div style={{
      padding: '0.75rem',
      background: isApproved ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
      border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
      borderRadius: '0.5rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: isApproved ? '0.5rem' : 0 
      }}>
        {isApproved ? (
          <Shield size={16} color="#059669" />
        ) : (
          <Clock size={16} color="#D97706" />
        )}
        <span style={{ 
          fontWeight: 600, 
          fontSize: '0.75rem',
          color: isApproved ? '#059669' : '#D97706'
        }}>
          {isApproved ? 'Human Approved' : 'Pending Approval'}
        </span>
      </div>
      
      {isApproved && approval.approvedBy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.625rem', color: '#6B7280' }}>
            <User size={10} />
            <span>{approval.approvedBy}</span>
            {approval.approverRole && (
              <span style={{ color: '#9CA3AF' }}>({approval.approverRole})</span>
            )}
          </div>
          {approval.approvedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.625rem', color: '#6B7280' }}>
              <Calendar size={10} />
              <span>{new Date(approval.approvedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
