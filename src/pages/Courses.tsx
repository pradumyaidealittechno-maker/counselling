import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen, Clock, FileText, DollarSign, BarChart, Loader } from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    fees: number;
    currency: string;
    status: 'draft' | 'published' | 'archived';
    enrolledStudentsCount: number;
}

const MOCK_COURSES: Course[] = [
    {
        _id: '1',
        title: 'Career Planning Fundamentals',
        description: 'A comprehensive guide to choosing the right career path based on skills and interests.',
        duration: '4 Weeks',
        level: 'beginner',
        fees: 2500,
        currency: 'INR',
        category: 'Career Guidance',
        enrolledStudentsCount: 120,
        status: 'published'
    },
    {
        _id: '2',
        title: 'Advanced Interview Mastery',
        description: 'Master the art of cracking interviews with mock sessions and expert tips.',
        duration: '6 Weeks',
        level: 'advanced',
        fees: 5000,
        currency: 'INR',
        category: 'Soft Skills',
        enrolledStudentsCount: 85,
        status: 'published'
    },
    {
        _id: '3',
        title: 'Public Speaking Workshop',
        description: 'Build confidence and learn effective public speaking techniques.',
        duration: '2 Weeks',
        level: 'intermediate',
        fees: 1500,
        currency: 'INR',
        category: 'Communication',
        enrolledStudentsCount: 45,
        status: 'draft'
    }
];

export default function Courses() {
    const navigate = useNavigate();
    const [courses] = useState<Course[]>(MOCK_COURSES);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading] = useState(false);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', width: '100%', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={32} style={{ color: 'var(--primary-600)' }} />
                        Courses Catalog
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Manage your counselling courses, curriculum, and workshops
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/courses/create')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} />
                    Add New Course
                </button>
            </div>

            {/* Filters and Search */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--gray-200)' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                        type="text"
                        placeholder="Search courses by title or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
                </div>
            ) : filteredCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                    {filteredCourses.map(course => (
                        <div key={course._id} style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'var(--primary-50)',
                                        color: 'var(--primary-700)',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                                        {course.category}
                                    </span>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: course.status === 'published' ? 'var(--success-50)' : 'var(--gray-100)',
                                        color: course.status === 'published' ? 'var(--success-700)' : 'var(--gray-600)',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                                        {course.status}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>{course.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: '1.5', height: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {course.description}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        <Clock size={16} style={{ color: 'var(--gray-400)' }} />
                                        {course.duration}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)', textTransform: 'capitalize' }}>
                                        <BarChart size={16} style={{ color: 'var(--gray-400)' }} />
                                        {course.level}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        <DollarSign size={16} style={{ color: 'var(--gray-400)' }} />
                                        {course.fees === 0 ? 'Free' : `₹${course.fees}`}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        <FileText size={16} style={{ color: 'var(--gray-400)' }} />
                                        {course.enrolledStudentsCount} Enrolled
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>Edit</button>
                                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
                    <BookOpen size={48} style={{ margin: '0 auto 1rem', color: 'var(--gray-300)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No courses found</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Start by creating your first counselling course or workshop.</p>
                    <button onClick={() => navigate('/dashboard/courses/create')} className="btn btn-primary">
                        Add New Course
                    </button>
                </div>
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
