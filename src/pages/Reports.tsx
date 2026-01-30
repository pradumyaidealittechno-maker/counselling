import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Report {
  _id: string;
  data?: {
    candidateInformation?: {
      fullName: string;
      email?: string;
      positionAppliedFor: string;
      interviewDate?: string;
    };
    competencyAssessment?: {
      overallScore: string;
    };
    recommendation?: {
      hiringRecommendation: string;
    };
    metadata?: {
      reportGenerated?: string;
    };
  };
  candidateInformation?: {
    fullName: string;
    email?: string;
    positionAppliedFor: string;
    interviewDate?: string;
  };
  competencyAssessment?: {
    overallScore: string; // "18/50"
  };
  recommendation?: {
    hiringRecommendation: string;
  };
  metadata?: {
    reportGenerated?: string;
  };
}

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, statusFilter]);

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
    const info = r.candidateInformation || r.data?.candidateInformation;
    const rec = r.recommendation || r.data?.recommendation;
    const meta = r.metadata || r.data?.metadata;

    const term = searchTerm.toLowerCase();
    const fullName = info?.fullName?.toLowerCase() || '';
    const pos = info?.positionAppliedFor?.toLowerCase() || '';
    const matchesSearch = fullName.includes(term) || pos.includes(term);

    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      const dateStr = info?.interviewDate || meta?.reportGenerated;
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
    const recommendation = rec?.hiringRecommendation || '';
    let matchesStatus = !statusFilter || recommendation === statusFilter;

    // Handle status aliasing (backend vs frontend display)
    if (statusFilter === 'Reject' && recommendation === 'NO') matchesStatus = true;
    if (statusFilter === 'NO' && recommendation === 'Reject') matchesStatus = true;
    if (statusFilter === 'Hold' && recommendation === 'Further Review') matchesStatus = true;
    if (statusFilter === 'Hire' && (recommendation === 'recommended' || recommendation === 'Recommended')) matchesStatus = true;

    return matchesSearch && matchesDate && matchesStatus;
  }).sort((a, b) => {
    // Sort purely by Interview Date (Latest First)
    const getDate = (report: Report) => {
      const info = report.candidateInformation || report.data?.candidateInformation;
      const meta = report.metadata || report.data?.metadata;

      // Try multiple sources for the date
      // @ts-ignore - createdAt might exist on the object even if not in interface
      const dateStr = info?.interviewDate || meta?.reportGenerated || report.createdAt;
      if (!dateStr) return 0;

      try {
        // Handle DD/MM/YYYY format specifically if present
        if (dateStr.includes('/') && dateStr.split('/').length === 3) {
          const parts = dateStr.split('/');
          if (parts[0].length <= 2 && parseInt(parts[0]) <= 31) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`).getTime();
          }
        }
        return new Date(dateStr).getTime();
      } catch {
        return 0;
      }
    };

    return getDate(b) - getDate(a);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <option value="Hire">Recommended</option>
            <option value="Hold">Further Review</option>
            <option value="MAYBE">Maybe</option>
            <option value="Reject">No</option>
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
        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--white)', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
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
              {currentReports.map((report) => {
                const info = report.candidateInformation || report.data?.candidateInformation;
                const assess = report.competencyAssessment || report.data?.competencyAssessment;
                const recomm = report.recommendation || report.data?.recommendation;
                const meta = report.metadata || report.data?.metadata;

                // Get raw score "18/50" directly
                const rawScore = assess?.overallScore || 'N/A';

                const recommendation = recomm?.hiringRecommendation || 'Pending';
                const isRecommended = recommendation === 'Hire' || recommendation.toLowerCase() === 'recommended';

                const getBaseColor = (status: string) => {
                  if (status === 'Hire' || status.toLowerCase() === 'recommended') return 'rgba(16, 185, 129, 0.04)'; // success
                  switch (status) {
                    case 'Hold': return 'rgba(59, 130, 246, 0.04)'; // accent
                    case 'MAYBE': return 'rgba(245, 158, 11, 0.04)'; // warning
                    case 'Reject':
                    case 'NO': return 'rgba(239, 68, 68, 0.04)'; // danger
                    default: return 'transparent';
                  }
                };

                const getHoverColor = (status: string) => {
                  if (status === 'Hire' || status.toLowerCase() === 'recommended') return 'rgba(16, 185, 129, 0.08)';
                  switch (status) {
                    case 'Hold': return 'rgba(59, 130, 246, 0.08)';
                    case 'MAYBE': return 'rgba(245, 158, 11, 0.08)';
                    case 'Reject':
                    case 'NO': return 'rgba(239, 68, 68, 0.08)';
                    default: return 'var(--gray-50)';
                  }
                };

                const baseColor = getBaseColor(recommendation);
                const hoverColor = getHoverColor(recommendation);

                return (
                  <tr
                    key={report._id}
                    onClick={() => navigate(`/dashboard/reports/${report._id}`)}
                    style={{
                      borderBottom: '1px solid var(--gray-100)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: baseColor
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverColor}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = baseColor}
                  >
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
                          {info?.fullName?.[0] || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                            {info?.fullName || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            {info?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-500)' }}>
                      {info?.positionAppliedFor || '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: isRecommended ? '#059669' :
                          recommendation === 'Hold' ? '#2563EB' :
                            recommendation === 'MAYBE' ? '#D97706' : '#DC2626'
                      }}>
                        {rawScore.split('/')[0]}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {(() => {
                        // Try multiple date sources
                        const dateStr = info?.interviewDate || meta?.reportGenerated;
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
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
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
                        backgroundColor: isRecommended ? '#ECFDF5' : recommendation === 'Hold' ? '#EFF6FF' : recommendation === 'MAYBE' ? '#FFFBEB' : '#FEF2F2',
                        color: isRecommended ? '#065F46' : recommendation === 'Hold' ? '#1E40AF' : recommendation === 'MAYBE' ? '#B45309' : '#B91C1C'
                      }}>
                        {recommendation === 'Hold' ? 'Further Review' : recommendation === 'Reject' ? 'No' : isRecommended ? 'Recommended' : recommendation}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/reports/${report._id}`);
                        }}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#E91E63',
                          color: 'white',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontWeight: 600,
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FileText size={14} /> View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredReports.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--white)',
          borderRadius: '0.75rem',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Showing <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{((currentPage - 1) * itemsPerPage) + 1}</span> to <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> of <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{filteredReports.length}</span> results
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost"
              style={{ padding: '0.5rem 0.75rem', height: 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show current page, 1, total, and pages around current
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} style={{ color: 'var(--gray-400)' }}>...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-ghost"
              style={{ padding: '0.5rem 0.75rem', height: 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
