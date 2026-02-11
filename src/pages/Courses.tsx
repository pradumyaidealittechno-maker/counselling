import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Clock, FileText, DollarSign, BarChart, Loader, X } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

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

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // New Course Form State
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        category: 'Career Guidance',
        duration: '',
        level: 'beginner' as const,
        fees: 0,
        status: 'draft' as const
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await api.courses.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            showToast.error('Could not load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.courses.create(newCourse);
            showToast.success('Course created successfully!');
            setShowAddModal(false);
            fetchCourses();
            setNewCourse({
                title: '',
                description: '',
                category: 'Career Guidance',
                duration: '',
                level: 'beginner',
                fees: 0,
                status: 'draft'
            });
        } catch (error: any) {
            console.error('Error creating course:', error);
            showToast.error(error.message || 'Failed to create course');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
                    onClick={() => setShowAddModal(true)}
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
                    <Loader className="animate-spin text-primary-600" size={48} />
                </div>
            ) : filteredCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                    {filteredCourses.map(course => (
                        <div key={course._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
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
                                        <Clock size={16} className="text-gray-400" />
                                        {course.duration}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)', textTransform: 'capitalize' }}>
                                        <BarChart size={16} className="text-gray-400" />
                                        {course.level}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        <DollarSign size={16} className="text-gray-400" />
                                        {course.fees === 0 ? 'Free' : `₹${course.fees}`}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        <FileText size={16} className="text-gray-400" />
                                        {course.enrolledStudentsCount} Enrolled
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                    <button className="btn btn-outline btn-sm flex-1">Edit</button>
                                    <button className="btn btn-primary btn-sm flex-1">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center p-12">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-500 mb-6">Start by creating your first counselling course or workshop.</p>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                        Add New Course
                    </button>
                </div>
            )}

            {/* Add Course Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="card w-full max-w-lg animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add New Course</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddCourse}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Course Title *</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g. Master Your Career Path"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Category *</label>
                                <select
                                    className="input w-full"
                                    value={newCourse.category}
                                    onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                                >
                                    <option>Career Guidance</option>
                                    <option>Soft Skills</option>
                                    <option>Technical Skills</option>
                                    <option>Communication</option>
                                    <option>Personal Development</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="label">Duration *</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="e.g. 4 Weeks"
                                        value={newCourse.duration}
                                        onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Fees (INR)</label>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        placeholder="0 for Free"
                                        value={newCourse.fees}
                                        onChange={e => setNewCourse({ ...newCourse, fees: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="label">Level</label>
                                    <select
                                        className="input w-full"
                                        value={newCourse.level}
                                        onChange={e => setNewCourse({ ...newCourse, level: e.target.value as any })}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Initial Status</label>
                                    <select
                                        className="input w-full"
                                        value={newCourse.status}
                                        onChange={e => setNewCourse({ ...newCourse, status: e.target.value as any })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="label">Description *</label>
                                <textarea
                                    className="input w-full"
                                    rows={4}
                                    placeholder="Summarize what students will learn..."
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <Loader className="animate-spin" size={18} /> : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
