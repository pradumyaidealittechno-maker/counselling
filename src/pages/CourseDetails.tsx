import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, BarChart, FileText, Edit2, Loader } from 'lucide-react';
import api from '../services/api';

export default function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const data = await api.courses.getById(id!);
            setCourse(data);
        } catch (error) {
            console.error('Failed to fetch course details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Loader size={48} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
            </div>
        );
    }

    if (!course) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Course not found</h2>
                <button onClick={() => navigate('/dashboard/courses')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', width: '100%', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                >
                    <ArrowLeft size={16} />
                    Back to Courses
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)' }}>{course.title}</h1>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: 'var(--primary-50)',
                                color: 'var(--primary-700)',
                                borderRadius: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}>
                                {course.category}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/dashboard/courses/edit/${course._id}`)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Edit2 size={18} />
                        Edit Course
                    </button>
                </div>
            </div>

            {/* Course Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Clock size={20} style={{ color: 'var(--primary-600)' }} />
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase' }}>Duration</h3>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>{course.duration}</p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <BarChart size={20} style={{ color: 'var(--primary-600)' }} />
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase' }}>Level</h3>
                    </div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', textTransform: 'capitalize' }}>{course.level}</p>
                </div>

                {course.prerequisites && (
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <FileText size={20} style={{ color: 'var(--primary-600)' }} />
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase' }}>Prerequisites</h3>
                        </div>
                        <p style={{ fontSize: '1rem', color: 'var(--gray-700)' }}>{course.prerequisites}</p>
                    </div>
                )}
            </div>

            {/* Description */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={24} style={{ color: 'var(--primary-600)' }} />
                    Course Description
                </h2>
                <p style={{ fontSize: '1rem', color: 'var(--gray-700)', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
                    {course.description}
                </p>
            </div>

            {/* Course DNA Section */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart size={24} style={{ color: 'var(--primary-600)' }} />
                        Course DNA & Student Alignment
                    </h2>
                    {!course.courseDNA && (
                        <button
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    const result = await api.courses.generateDNA(course._id);
                                    setCourse({ ...course, courseDNA: result.courseDNA });
                                } catch (error) {
                                    console.error('Failed to generate DNA:', error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="btn btn-primary btn-sm"
                        >
                            Generate DNA Profile
                        </button>
                    )}
                </div>

                {course.courseDNA ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {Object.entries(course.courseDNA).map(([key, value]: [string, any]) => (
                            <div key={key} style={{ padding: '1.5rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px solid var(--gray-200)' }}>
                                <h3 style={{ textTransform: 'capitalize', fontSize: '1rem', fontWeight: 600, color: 'var(--primary-700)', marginBottom: '1rem' }}>
                                    {key.replace('DNA', ' Profile')}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {value.map((trait: any) => (
                                        <div key={trait.id} style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{trait.name}</span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '0.25rem',
                                                    background: trait.importance === 'critical' ? '#FEE2E2' : trait.importance === 'high' ? '#FEF3C7' : '#E0F2FE',
                                                    color: trait.importance === 'critical' ? '#991B1B' : trait.importance === 'high' ? '#92400E' : '#075985'
                                                }}>
                                                    {trait.importance}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{trait.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px dashed var(--gray-300)' }}>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                            No DNA profile generated yet. Use the button above to analyze this course with AI.
                        </p>
                    </div>
                )}
            </div>

            {/* Context File Content */}
            {course.contextFileContent && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={24} style={{ color: 'var(--primary-600)' }} />
                        Syllabus / Curriculum
                    </h2>
                    <div style={{
                        background: 'var(--gray-50)',
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--gray-200)',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        <pre style={{
                            fontSize: '0.875rem',
                            color: 'var(--gray-700)',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit'
                        }}>
                            {course.contextFileContent}
                        </pre>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
