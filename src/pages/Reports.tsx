import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Report {
  _id: string;
  candidateInformation: {
    fullName: string;
    email?: string;
    positionAppliedFor: string;
    interviewDate?: string;
  };
  competencyAssessment: {
    overallScore: string; // "18/50"
  };
  recommendation: {
    hiringRecommendation: string;
  };
  metadata?: {
    reportGenerated?: string;
  };
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.reports.getAll();
      console.log('Reports Page - Data:', data);
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    const fullName = r.candidateInformation?.fullName?.toLowerCase() || '';
    const pos = r.candidateInformation?.positionAppliedFor?.toLowerCase() || '';
    const matchesSearch = fullName.includes(term) || pos.includes(term);
    
    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      const dateStr = r.candidateInformation?.interviewDate || r.metadata?.reportGenerated;
      if (dateStr) {
        try {
          let reportDate: Date;
          if (dateStr.includes('/') && dateStr.split('/').length === 3) {
            const parts = dateStr.split('/');
            if (parts[0].length <= 2 && parseInt(parts[0]) <= 31) {
              const [day, month, year] = parts;
              reportDate = new Date(`${year}-${month}-${day}`);
            } else {
              reportDate = new Date(dateStr);
            }
          } else {
            reportDate = new Date(dateStr);
          }
          const filterDate = new Date(dateFilter);
          matchesDate = reportDate.toDateString() === filterDate.toDateString();
        } catch {
          matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }
    
    // Status filter
    const recommendation = r.recommendation?.hiringRecommendation || '';
    const matchesStatus = !statusFilter || recommendation === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
          Analysis Reports
        </h1>
        <p style={{ color: 'var(--gray-500)' }}>
          View detailed AI analysis for completed interviews.
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '1.5rem',
        background: 'var(--white)',
        padding: '1rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--gray-200)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '200px' }}>
          <Search size={20} color="var(--gray-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none',
              background: 'var(--white)',
              color: 'var(--gray-900)'
            }}
          />
        </div>
        
        <div style={{ flex: '0 0 auto' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none',
              minWidth: '150px',
              background: 'var(--white)',
              color: 'var(--gray-900)'
            }}
          />
        </div>
        
        <div style={{ flex: '0 0 auto' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none',
              minWidth: '150px',
              backgroundColor: 'var(--white)',
              color: 'var(--gray-900)'
            }}
          >
            <option value="">All Status</option>
            <option value="Hire">Hire</option>
            <option value="Hold">Hold</option>
            <option value="MAYBE">Maybe</option>
            <option value="Reject">Reject</option>
          </select>
        </div>
        
        {(searchTerm || dateFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('');
              setStatusFilter('');
            }}
            style={{
              padding: '0.625rem 1rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: 'var(--white)',
              cursor: 'pointer',
              color: 'var(--gray-500)'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {error ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#FEF2F2', borderRadius: '0.75rem', border: '1px solid #FECACA' }}>
          <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#B91C1C', fontWeight: 500 }}>{error}</p>
          <button 
            onClick={loadReports}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <FileText size={48} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            No reports found
          </h3>
          <p style={{ color: 'var(--gray-500)' }}>
            {searchTerm ? `No results for "${searchTerm}"` : "Completed evaluations will appear here."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Candidate</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Score</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Interview Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Recommendation</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => {
                // Get raw score "18/50" directly
                const rawScore = report.competencyAssessment?.overallScore || 'N/A';
                
                // Parse for color coding only
                let percentage = 0;
                if (rawScore !== 'N/A') {
                   const [earned, total] = rawScore.split('/').map(Number);
                   if (!isNaN(earned) && !isNaN(total) && total > 0) {
                     percentage = Math.round((earned / total) * 100);
                   }
                }
                
                const recommendation = report.recommendation?.hiringRecommendation || 'Pending';
                
                return (
                  <tr key={report._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#E0E7FF',
                          color: '#4F46E5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase'
                        }}>
                          {report.candidateInformation?.fullName?.[0] || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                            {report.candidateInformation?.fullName || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            {report.candidateInformation?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-500)' }}>
                      {report.candidateInformation?.positionAppliedFor || '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: '0.95rem',
                        color: percentage >= 80 ? '#059669' : percentage >= 60 ? '#D97706' : '#DC2626'
                      }}>
                        {rawScore}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {(() => {
                        // Try multiple date sources
                        const dateStr = report.candidateInformation?.interviewDate || report.metadata?.reportGenerated;
                        if (!dateStr) return 'N/A';
                        
                        try {
                          let date: Date;
                          
                          // Check if date is in DD/MM/YYYY format (e.g., "16/01/2026")
                          if (dateStr.includes('/') && dateStr.split('/').length === 3) {
                            const parts = dateStr.split('/');
                            // Check if first part is day (DD/MM/YYYY format)
                            if (parts[0].length <= 2 && parseInt(parts[0]) <= 31) {
                              const [day, month, year] = parts;
                              // Convert to YYYY-MM-DD format for proper parsing
                              date = new Date(`${year}-${month}-${day}`);
                            } else {
                              date = new Date(dateStr);
                            }
                          } else {
                            date = new Date(dateStr);
                          }
                          
                          // Check if date is valid
                          if (isNaN(date.getTime())) return 'N/A';
                          
                          return date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          });
                        } catch (err) {
                          return 'N/A';
                        }
                      })()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: recommendation === 'Hire' ? '#ECFDF5' : recommendation === 'Hold' ? '#FFFBEB' : recommendation === 'MAYBE' ? '#FFFBEB' : '#FEF2F2',
                        color: recommendation === 'Hire' ? '#065F46' : recommendation === 'Hold' ? '#92400E' : recommendation === 'MAYBE' ? '#B45309' : '#991B1B'
                      }}>
                        {recommendation}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link 
                        to={`/dashboard/reports/${report._id}`}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#E91E63',
                          color: 'white',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <FileText size={14} /> View Report
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
