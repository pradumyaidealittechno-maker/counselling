import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    GraduationCap,
    Calendar,
    FileText,
    TrendingUp,
    Loader
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    currentGrade: string;
    currentSchool?: string;
    status: string;
    lastSessionDate?: string;
    counsellorId?: {
        firstName: string;
        lastName: string;
    };
}

export default function Students() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchStudents();
    }, [gradeFilter]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (gradeFilter) params.grade = gradeFilter;
            if (searchTerm) params.search = searchTerm;

            const data = await api.students.getAll(params);
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students', error);
            showToast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents();
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        Student Management
                    </h1>
                    <p style={{ color: 'var(--gray-500)' }}>
                        Track progress, schedule sessions, and manage student profiles.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/students/new')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                    <Plus size={20} /> Add New Student
                </button>
            </div>

            {/* Filters & Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>

                {/* Search & Filter Bar */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '0.5rem', border: '1px solid var(--gray-200)', outline: 'none' }}
                        />
                    </form>

                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--gray-200)', background: 'white', minWidth: '150px' }}
                    >
                        <option value="">All Grades</option>
                        <option value="9th">Grade 9</option>
                        <option value="10th">Grade 10</option>
                        <option value="11th">Grade 11</option>
                        <option value="12th">Grade 12</option>
                        <option value="Undergraduate">Undergraduate</option>
                    </select>
                </div>

                {/* Quick Stat */}
                <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--primary-100)' }}>
                    <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary-600)' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 500 }}>Total Students</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-900)' }}>{students.length}</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid var(--gray-200)', overflow: 'hidden', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Student Name</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Current Grade</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Last Session</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                                        <Loader className="animate-spin" size={20} /> Loading students...
                                    </div>
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    No students found. Click "Add New Student" to get started.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student._id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-600)', fontWeight: 600 }}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{student.firstName} {student.lastName}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-700)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <GraduationCap size={16} className="text-gray-400" />
                                            {student.currentGrade}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: student.status === 'active' ? 'var(--success-50)' : 'var(--gray-100)',
                                            color: student.status === 'active' ? 'var(--success-700)' : 'var(--gray-600)'
                                        }}>
                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-700)' }}>
                                        {student.lastSessionDate ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={16} className="text-gray-400" />
                                                {new Date(student.lastSessionDate).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Never</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                                        <button
                                            onClick={(e) => toggleMenu(e, student._id)}
                                            style={{ padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--gray-400)', cursor: 'pointer', background: 'none', border: 'none' }}
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {activeMenuId === student._id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '1.5rem',
                                                top: '3rem',
                                                background: 'white',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                border: '1px solid var(--gray-200)',
                                                zIndex: 10,
                                                minWidth: '160px',
                                                overflow: 'hidden'
                                            }}>
                                                <button
                                                    onClick={() => navigate(`/dashboard/students/${student._id}`)}
                                                    style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <FileText size={16} /> View Profile
                                                </button>
                                                <button
                                                    onClick={() => console.log('Schedule')}
                                                    style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Calendar size={16} /> Schedule Session
                                                </button>
                                                <button
                                                    onClick={() => console.log('Analytics')}
                                                    style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <TrendingUp size={16} /> View Analytics
                                                </button>
                                            </div>
                                        )}
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
