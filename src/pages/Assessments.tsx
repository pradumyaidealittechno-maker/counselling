import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    Target,
    ArrowRight,
    Laptop,
    PenTool,
    Zap,
    Loader
} from 'lucide-react';
import api from '../services/api';

interface Assessment {
    _id: string;
    title: string;
    type: string;
    category: string;
    status: 'assigned' | 'in_progress' | 'completed';
    score?: number;
    maxScore?: number;
    studentId: {
        firstName: string;
        lastName: string;
    };
    aiAnalysis?: any;
    createdAt: string;
}

export default function Assessments() {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const data = await api.assessments.getAll();
            setAssessments(data);
        } catch (error) {
            console.error('Failed to fetch assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Technical': return <Laptop size={20} className="text-blue-500" />;
            case 'Personality': return <Brain size={20} className="text-purple-500" />;
            case 'Career': return <Target size={20} className="text-green-500" />;
            default: return <PenTool size={20} className="text-orange-500" />;
        }
    };

    const filteredAssessments = assessments.filter(a => {
        if (filter === 'All') return true;
        if (filter === 'Completed') return a.status === 'completed';
        return a.type === filter;
    });

    return (
        <div style={{ padding: '2rem', width: '100%', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                color: 'white',
                marginBottom: '3rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Skill Assessment Hub
                </h1>
                <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px' }}>
                    Monitor student progress through assigned career and aptitude assessments.
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {['All', 'Completed', 'Aptitude', 'Technical', 'Personality', 'Career'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: '2rem', whiteSpace: 'nowrap' }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Assessments List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin text-primary-600" size={48} />
                </div>
            ) : filteredAssessments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredAssessments.map(assessment => (
                        <div key={assessment._id} className="card hover:shadow-lg transition-all">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getIcon(assessment.type)}
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    background: assessment.status === 'completed' ? 'var(--success-50)' : 'var(--blue-50)',
                                    color: assessment.status === 'completed' ? 'var(--success-700)' : 'var(--blue-700)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize'
                                }}>
                                    {assessment.status.replace('_', ' ')}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                                {assessment.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)', fontWeight: 500, marginBottom: '1rem' }}>
                                For: {assessment.studentId ? `${assessment.studentId.firstName} ${assessment.studentId.lastName}` : 'Unknown Student'}
                            </p>

                            {assessment.status === 'completed' && (
                                <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        <span className="text-gray-500">Score</span>
                                        <span className="font-bold">{assessment.score} / {assessment.maxScore}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${((assessment.score || 0) / (assessment.maxScore || 1)) * 100}%`,
                                            height: '100%',
                                            background: 'var(--success-500)'
                                        }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                    Assigned on {new Date(assessment.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => navigate(`/assessment/run/${assessment._id}`)}
                                    className="text-primary-600 font-semibold text-sm flex items-center gap-1 bg-none border-none cursor-pointer"
                                >
                                    Details <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center p-12">
                    <Zap size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No assessments found</h3>
                    <p className="text-gray-500">Start assigning skill tests to your students.</p>
                </div>
            )}
        </div>
    );
}
