import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Filter, Loader, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import { confirmToast, showToast } from '../utils/toast';

interface Job {
    _id: string;
    title: string;
    department: string;
    company: string;
    location: string;
    status: string;
    jobDNA?: any;
    createdAt: string;
    candidateCount?: number;
}

export default function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await api.jobs.getAll();
            // Since the API might not return candidate counts, we could fetch them or just show what we have.
            // For now, let's assume the API returns standard job data.
            setJobs(data || []);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId: string) => {
        const confirmed = await confirmToast('Are you sure you want to delete this job? \n\n⚠️ WARNING: This will permanently delete the Job AND ALL associated Candidates, Resumes, and Interview Data. This action cannot be undone.');
        if (confirmed) {
            try {
                await api.jobs.delete(jobId);
                showToast.success('Job and all associated data deleted successfully');
                await loadJobs(); // Refresh list
            } catch (err) {
                console.error('Failed to delete job:', err);
                showToast.error('Failed to delete job. Please try again.');
            }
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const currentJobs = filteredJobs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading jobs...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--gray-900)' }}>Jobs</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Manage your open positions and job descriptions</p>
                </div>
                <Link to="/dashboard/jobs/create" className="btn btn-primary btn-sm">
                    <Plus size={16} /> Create Job
                </Link>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search jobs..."
                        style={{
                            paddingLeft: '36px',
                            padding: '0.5rem 0.75rem 0.5rem 36px',
                            fontSize: '0.875rem',
                            backgroundColor: 'var(--white)',
                            color: 'var(--gray-900)',
                            border: '1px solid var(--gray-200)'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-ghost btn-sm">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {/* Jobs Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '1rem', color: 'var(--gray-700)', width: '30%' }}>Job Title</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '1rem', color: 'var(--gray-700)' }}>Company</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '1rem', color: 'var(--gray-700)' }}>Location</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '1rem', color: 'var(--gray-700)' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '1rem', color: 'var(--gray-700)' }}>Date Created</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '1rem', color: 'var(--gray-700)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    <Briefcase size={40} color="var(--gray-300)" style={{ marginBottom: '0.75rem' }} />
                                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>No jobs found</p>
                                    <Link to="/dashboard/jobs/create" className="btn btn-primary btn-sm">
                                        <Plus size={14} /> Create First Job
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            currentJobs.map((job) => (
                                <tr key={job._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                    <td style={{ padding: '0.6rem 1rem', width: '30%' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--gray-900)' }}>{job.title.replace(/-/g, ' ')}</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--gray-500)' }}>{job.department}</div>
                                    </td>
                                    <td style={{ padding: '0.6rem 1rem', fontSize: '1.05rem', color: 'var(--gray-500)' }}>{job.company}</td>
                                    <td style={{ padding: '0.6rem 1rem', fontSize: '1.05rem', color: 'var(--gray-500)' }}>{job.location}</td>
                                    <td style={{ padding: '0.6rem 1rem' }}>
                                        <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.95rem', padding: '0.25rem 0.625rem' }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.6rem 1rem', fontSize: '1.05rem', color: 'var(--gray-500)' }}>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.5rem' }}>
                                            <Link
                                                to={`/dashboard/jobs/${job._id}/job-dna`}
                                                className="btn btn-icon btn-ghost"
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px'
                                                }}
                                                title="Edit Job DNA"
                                            >
                                                <Edit size={20} color="var(--gray-500)" />
                                            </Link>
                                            <button
                                                className="btn btn-icon btn-ghost"
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px'
                                                }}
                                                onClick={() => handleDelete(job._id)}
                                                title="Delete Job"
                                            >
                                                <Trash2 size={20} color="#EF4444" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredJobs.length > itemsPerPage && (
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
                        Showing <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{((currentPage - 1) * itemsPerPage) + 1}</span> to <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{filteredJobs.length}</span> results
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
