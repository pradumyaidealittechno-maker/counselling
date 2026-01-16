import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Filter, Loader, Trash2, Edit } from 'lucide-react';
import api from '../services/api';

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

    useEffect(() => {
        loadJobs();
    }, []);

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
        if (window.confirm('Are you sure you want to delete this job? \n\n⚠️ WARNING: This will permanently delete the Job AND ALL associated Candidates, Resumes, and Interview Data. This action cannot be undone.')) {
            try {
                await api.jobs.delete(jobId);
                await loadJobs(); // Refresh list
            } catch (err) {
                console.error('Failed to delete job:', err);
                alert('Failed to delete job. Please try again.');
            }
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading jobs...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Jobs</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Manage your open positions and job descriptions</p>
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
                        style={{ paddingLeft: '36px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.875rem' }}
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
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Job Title</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Company</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Location</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Status</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Date Created</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, fontSize: '0.75rem', color: '#6B7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                                    <Briefcase size={40} color="#D1D5DB" style={{ marginBottom: '0.75rem' }} />
                                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>No jobs found</p>
                                    <Link to="/dashboard/jobs/create" className="btn btn-primary btn-sm">
                                        <Plus size={14} /> Create First Job
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            filteredJobs.map((job) => (
                                <tr key={job._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{job.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{job.department}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{job.company}</td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{job.location}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <Link to={`/dashboard/jobs/${job._id}/job-dna`} className="btn btn-sm btn-ghost" style={{ padding: '0.25rem' }} title="Edit Job DNA">
                                                <Edit size={14} color="#6B7280" />
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                style={{ padding: '0.25rem' }}
                                                onClick={() => handleDelete(job._id)}
                                                title="Delete Job"
                                            >
                                                <Trash2 size={14} color="#EF4444" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
