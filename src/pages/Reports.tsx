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
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    return fullName.includes(term) || pos.includes(term);
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' }}>
          Analysis Reports
        </h1>
        <p style={{ color: '#6B7280' }}>
          View detailed AI analysis for completed interviews.
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        background: 'white',
        padding: '1rem',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={20} color="#9CA3AF" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={16} /> Filter
        </button>
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
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            No reports found
          </h3>
          <p style={{ color: '#6B7280' }}>
            {searchTerm ? `No results for "${searchTerm}"` : "Completed evaluations will appear here."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Candidate</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Score</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Interview Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Recommendation</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => {
                // Parse score "18/50" -> percentage
                let percentage = 0;
                const scoreStr = report.competencyAssessment?.overallScore;
                if (scoreStr) {
                   const [earned, total] = scoreStr.split('/').map(Number);
                   if (!isNaN(earned) && !isNaN(total) && total > 0) {
                     percentage = Math.round((earned / total) * 100);
                   }
                }
                
                const recommendation = report.recommendation?.hiringRecommendation || 'Pending';
                
                return (
                  <tr key={report._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
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
                          <div style={{ fontWeight: 500, color: '#111827' }}>
                            {report.candidateInformation?.fullName || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {report.candidateInformation?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#6B7280' }}>
                      {report.candidateInformation?.positionAppliedFor || '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: percentage >= 80 ? '#059669' : percentage >= 60 ? '#D97706' : '#DC2626'
                      }}>
                        {percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      {report.candidateInformation?.interviewDate 
                        ? new Date(report.candidateInformation.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
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
