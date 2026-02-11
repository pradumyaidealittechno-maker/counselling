import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    Target,
    CheckCircle,
    Clock,
    Award,
    ArrowRight,
    Laptop,
    PenTool,
    BookOpen,
    Star,
    Zap,
    Lock
} from 'lucide-react';



interface Assessment {
    id: string;
    title: string;
    description: string;
    type: 'Aptitude' | 'Technical' | 'Personality' | 'Career';
    qualificationLevel: '10th' | '12th' | 'Undergraduate' | 'Any';
    duration: string;
    questions: number;
    xp: number;
    status: 'Locked' | 'Unlocked' | 'In Progress' | 'Completed';
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

const MOCK_ASSESSMENTS: Assessment[] = [
    {
        id: '1',
        title: 'Stream Selector Test',
        description: 'Find out which stream (Science, Commerce, Arts) is best suited for your personality and aptitude.',
        type: 'Career',
        qualificationLevel: '10th',
        duration: '30 min',
        questions: 20,
        xp: 500,
        status: 'Unlocked',
        category: 'Career Guidance',
        difficulty: 'Easy'
    },
    {
        id: '2',
        title: 'PCM Proficiency Test',
        description: 'Assess your grasp on Physics, Chemistry, and Math core concepts.',
        type: 'Technical',
        qualificationLevel: '12th',
        duration: '45 min',
        questions: 30,
        xp: 750,
        status: 'Locked',
        category: 'Science',
        difficulty: 'Hard'
    },
    {
        id: '3',
        title: 'Logical Reasoning Basics',
        description: 'Test your problem-solving and logical thinking abilities.',
        type: 'Aptitude',
        qualificationLevel: 'Any',
        duration: '20 min',
        questions: 15,
        xp: 300,
        status: 'Completed',
        category: 'General Aptitude',
        difficulty: 'Medium'
    },
    {
        id: '4',
        title: 'Coding Logic Starter',
        description: 'A beginner-friendly test to check your programming logic potential.',
        type: 'Technical',
        qualificationLevel: 'Undergraduate',
        duration: '60 min',
        questions: 25,
        xp: 1000,
        status: 'Unlocked',
        category: 'Computer Science',
        difficulty: 'Medium'
    }
];

export default function Assessments() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock student qualification
    const studentQualification = '12th';

    // Filter logic: Show recommended assessments based on qualification + general ones
    const filteredAssessments = MOCK_ASSESSMENTS.filter(a => {
        if (filter === 'Recommended') {
            return a.qualificationLevel === studentQualification || a.qualificationLevel === 'Any';
        }
        return filter === 'All' || a.type === filter;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'Technical': return <Laptop size={20} className="text-blue-500" />;
            case 'Personality': return <Brain size={20} className="text-purple-500" />;
            case 'Career': return <Target size={20} className="text-green-500" />;
            default: return <PenTool size={20} className="text-orange-500" />;
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'bg-green-100 text-green-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header with Gamification */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                color: 'white',
                marginBottom: '3rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                {/* Abstract Background Shapes */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={14} className="text-green-400" /> Qualification: Class {studentQualification}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: '1.2' }}>
                            Skill Assessment Center
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px' }}>
                            Complete tasks and quizzes tailored to your grade to unlock career insights and earn badges.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.25rem' }}>Total XP</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>1,250</h3>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.25rem' }}>Tests Passed</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>4</h3>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.25rem' }}>Rank</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>Top 10%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Section (If any) */}
            {filter === 'All' && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={20} fill="#f59e0b" className="text-yellow-500" /> Recommended for Class {studentQualification}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {MOCK_ASSESSMENTS.filter(a => a.qualificationLevel === studentQualification || a.qualificationLevel === 'Any').slice(0, 3).map(assessment => (
                            <div key={assessment.id} style={{
                                background: 'white',
                                borderRadius: '1rem',
                                border: '1px solid var(--gray-200)',
                                padding: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '4px',
                                    height: '100%',
                                    background: assessment.status === 'Completed' ? 'var(--success-500)' : 'var(--primary-500)'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'var(--primary-50)',
                                        color: 'var(--primary-700)',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem'
                                    }}>
                                        {getIcon(assessment.type)}
                                        {assessment.category}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Star size={12} fill="#f59e0b" /> +{assessment.xp} XP
                                        </span>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                    {assessment.title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem', minHeight: '40px' }}>
                                    {assessment.description}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {assessment.duration}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={14} /> {assessment.questions} Qs</span>
                                    <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(assessment.difficulty)}`}>{assessment.difficulty}</span>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={assessment.status === 'Locked'}
                                    onClick={() => assessment.status !== 'Locked' && navigate(`/assessment/run/${assessment.id}`)}
                                >
                                    {assessment.status === 'Locked' ? <><Lock size={16} /> Locked</> :
                                        assessment.status === 'Completed' ? <><Award size={16} /> View Result</> :
                                            <><Target size={16} /> Start Assessment</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {['All', 'Recommended', 'Aptitude', 'Technical', 'Personality', 'Career'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '2rem',
                            border: filter === f ? '1px solid var(--primary-600)' : '1px solid var(--gray-200)',
                            background: filter === f ? 'var(--primary-600)' : 'white',
                            color: filter === f ? 'white' : 'var(--gray-600)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            boxShadow: filter === f ? '0 4px 6px rgba(99, 102, 241, 0.2)' : 'none'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* All Assessments List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredAssessments.map(assessment => (
                    <div key={assessment.id} style={{
                        background: 'white',
                        borderRadius: '1rem',
                        border: '1px solid var(--gray-200)',
                        padding: '1.5rem',
                        opacity: assessment.status === 'Locked' ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {getIcon(assessment.type)}
                            </div>
                            {assessment.status === 'Completed' && (
                                <span style={{ padding: '0.25rem 0.5rem', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle size={12} /> Done
                                </span>
                            )}
                        </div>

                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>{assessment.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: '1.5' }}>
                            {assessment.description}
                        </p>

                        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                Min. Qualification: <strong>{assessment.qualificationLevel}</strong>
                            </div>
                            <button
                                style={{
                                    color: assessment.status === 'Locked' ? 'var(--gray-400)' : 'var(--primary-600)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: assessment.status === 'Locked' ? 'not-allowed' : 'pointer'
                                }}
                                onClick={() => assessment.status !== 'Locked' && navigate(`/assessment/run/${assessment.id}`)}
                            >
                                {assessment.status === 'Locked' ? 'Unlock' : 'Start'} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
