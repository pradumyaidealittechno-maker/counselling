import { Link } from 'react-router-dom';
import { Upload, Search, Filter, Mail, MoreVertical, FileText, Eye } from 'lucide-react';

const candidates = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Senior Software Engineer', experience: '7 years', score: 92, status: 'Interview Complete', avatar: 'SJ' },
  { id: 2, name: 'Michael Chen', email: 'mchen@email.com', role: 'Senior Software Engineer', experience: '5 years', score: 88, status: 'AI Analysis Ready', avatar: 'MC' },
  { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', role: 'Senior Software Engineer', experience: '6 years', score: 85, status: 'Pending Interview', avatar: 'ED' },
  { id: 4, name: 'James Wilson', email: 'jwilson@email.com', role: 'Senior Software Engineer', experience: '4 years', score: 78, status: 'Resume Screened', avatar: 'JW' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa.a@email.com', role: 'Senior Software Engineer', experience: '8 years', score: 94, status: 'Interview Complete', avatar: 'LA' },
  { id: 6, name: 'David Kim', email: 'dkim@email.com', role: 'Senior Software Engineer', experience: '3 years', score: 72, status: 'Resume Screened', avatar: 'DK' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Interview Complete': return 'badge-success';
    case 'AI Analysis Ready': return 'badge-primary';
    case 'Pending Interview': return 'badge-warning';
    default: return 'badge-primary';
  }
};

export default function Candidates() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Candidates</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage and track all candidates in your pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/candidates/invite" className="btn btn-secondary btn-sm">
            <Mail size={16} /> Send Invitation
          </Link>
          <button className="btn btn-primary btn-sm">
            <Upload size={16} /> Upload Resumes
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div style={{
        border: '2px dashed #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        textAlign: 'center',
        marginBottom: '1rem',
        background: '#f9fafb'
      }}>
        <Upload size={24} color="#9ca3af" style={{ marginBottom: '0.5rem' }} />
        <p style={{ fontWeight: 500, marginBottom: '0.125rem', fontSize: '0.875rem' }}>Drag and drop resumes here</p>
        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>or click to browse (PDF, DOC, DOCX)</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="input" placeholder="Search candidates..." style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }} />
        </div>
        <button className="btn btn-ghost btn-sm">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Candidates Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6b7280' }}>Candidate</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6b7280' }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6b7280' }}>Experience</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 500, fontSize: '0.75rem', color: '#6b7280' }}>Match Score</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, fontSize: '0.75rem', color: '#6b7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.625rem'
                    }}>{candidate.avatar}</div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{candidate.name}</p>
                      <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>{candidate.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>{candidate.role}</td>
                <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>{candidate.experience}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: candidate.score >= 90 ? '#10b981' : candidate.score >= 80 ? '#6366f1' : '#f59e0b'
                  }}>{candidate.score}%</span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span className={`badge ${getStatusColor(candidate.status)}`} style={{ fontSize: '0.625rem' }}>{candidate.status}</span>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    {candidate.status === 'Interview Complete' || candidate.status === 'AI Analysis Ready' ? (
                      <Link to={`/dashboard/candidates/${candidate.id}/report`} className="btn btn-sm btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.625rem' }}>
                        <Eye size={12} /> View Report
                      </Link>
                    ) : candidate.status === 'Pending Interview' ? (
                      <Link to="/dashboard/candidates/invite" className="btn btn-sm btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.625rem' }}>
                        <Mail size={12} /> Send Invite
                      </Link>
                    ) : (
                      <button className="btn btn-sm btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.625rem' }}>
                        <FileText size={12} /> View Resume
                      </button>
                    )}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                      <MoreVertical size={14} color="#6b7280" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
