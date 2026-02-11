import { useState } from 'react';
import { Plus, Search, BookOpen, Clock, FileText, DollarSign, BarChart } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    fees: string;
    category: string;
    enrolledStudents: number;
    status: 'Published' | 'Draft';
}

const MOCK_COURSES: Course[] = [
    {
        id: '1',
        title: 'Career Planning Fundamentals',
        description: 'A comprehensive guide to choosing the right career path based on skills and interests.',
        duration: '4 Weeks',
        level: 'Beginner',
        fees: '₹2,500',
        category: 'Career Guidance',
        enrolledStudents: 120,
        status: 'Published'
    },
    {
        id: '2',
        title: 'Advanced Interview Mastery',
        description: 'Master the art of cracking interviews with mock sessions and expert tips.',
        duration: '6 Weeks',
        level: 'Advanced',
        fees: '₹5,000',
        category: 'Soft Skills',
        enrolledStudents: 85,
        status: 'Published'
    },
    {
        id: '3',
        title: 'Public Speaking Workshop',
        description: 'Build confidence and learn effective public speaking techniques.',
        duration: '2 Weeks',
        level: 'Intermediate',
        fees: '₹1,500',
        category: 'Communication',
        enrolledStudents: 45,
        status: 'Draft'
    }
];

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New Course Form State
    const [newCourse, setNewCourse] = useState<Partial<Course>>({
        title: '',
        category: 'Career Guidance',
        level: 'Beginner',
        status: 'Draft',
        duration: '',
        fees: ''
    });

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        const course: Course = {
            id: Date.now().toString(),
            title: newCourse.title || 'Untitled Course',
            description: newCourse.description || '',
            duration: newCourse.duration || 'TBD',
            level: newCourse.level as any,
            fees: newCourse.fees || 'Free',
            category: newCourse.category || 'General',
            enrolledStudents: 0,
            status: newCourse.status as any
        };

        setCourses([course, ...courses]);
        setShowAddModal(false);
        setNewCourse({
            title: '',
            category: 'Career Guidance',
            level: 'Beginner',
            status: 'Draft',
            duration: '',
            fees: ''
        });
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
                        Courses
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Manage your counselling courses and workshops
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
                        placeholder="Search courses..."
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

            {/* Courses Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredCourses.map(course => (
                    <div key={course.id} style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: 'var(--primary-50)',
                                    color: 'var(--primary-700)',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {course.category}
                                </span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: course.status === 'Published' ? 'var(--success-50)' : 'var(--gray-100)',
                                    color: course.status === 'Published' ? 'var(--success-700)' : 'var(--gray-600)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {course.status}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>{course.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                {course.description}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    <Clock size={16} className="text-gray-400" />
                                    {course.duration}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    <BarChart size={16} className="text-gray-400" />
                                    {course.level}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    <DollarSign size={16} className="text-gray-400" />
                                    {course.fees}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    <FileText size={16} className="text-gray-400" />
                                    {course.enrolledStudents} Enrolled
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

            {/* Add Course Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Course</h2>
                        <form onSubmit={handleAddCourse}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Course Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Category</label>
                                <select
                                    className="input"
                                    value={newCourse.category}
                                    onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                                >
                                    <option>Career Guidance</option>
                                    <option>Soft Skills</option>
                                    <option>Technical Skills</option>
                                    <option>Communication</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="label">Duration</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. 4 Weeks"
                                        value={newCourse.duration}
                                        onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Fees</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. ₹2,500"
                                        value={newCourse.fees}
                                        onChange={e => setNewCourse({ ...newCourse, fees: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Level</label>
                                <select
                                    className="input"
                                    value={newCourse.level}
                                    onChange={e => setNewCourse({ ...newCourse, level: e.target.value as any })}
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="label">Description</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
