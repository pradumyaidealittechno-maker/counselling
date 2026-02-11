import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/toast';

export default function AddStudent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentGrade: '10th',
        currentSchool: '',
        currentBoard: 'CBSE',
        academicYear: '2025-2026',
        status: 'active'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.students.create(formData);
            showToast.success('Student added successfully');
            navigate('/dashboard/students');
        } catch (error: any) {
            console.error('Error adding student:', error);
            showToast.error(error.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <button
                onClick={() => navigate('/dashboard/students')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <ArrowLeft size={20} /> Back to Students
            </button>

            <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--gray-200)', padding: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--gray-900)' }}>Add New Student</h1>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="input"
                                style={{ width: '100%' }}
                                placeholder="e.g. Rahul"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="input"
                                style={{ width: '100%' }}
                                placeholder="e.g. Sharma"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input"
                                style={{ width: '100%' }}
                                placeholder="student@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input"
                                style={{ width: '100%' }}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '0.5rem', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-800)' }}>Academic Information</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Current Grade *</label>
                                <select
                                    name="currentGrade"
                                    value={formData.currentGrade}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                >
                                    <option value="8th">8th Grade</option>
                                    <option value="9th">9th Grade</option>
                                    <option value="10th">10th Grade</option>
                                    <option value="11th">11th Grade</option>
                                    <option value="12th">12th Grade</option>
                                    <option value="Undergraduate">Undergraduate</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Academic Year</label>
                                <select
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                >
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2025-2026">2025-2026</option>
                                    <option value="2026-2027">2026-2027</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>School/College Name</label>
                                <input
                                    type="text"
                                    name="currentSchool"
                                    value={formData.currentSchool}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                    placeholder="e.g. DPS R.K. Puram"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Board/University</label>
                                <select
                                    name="currentBoard"
                                    value={formData.currentBoard}
                                    onChange={handleChange}
                                    className="input"
                                    style={{ width: '100%' }}
                                >
                                    <option value="CBSE">CBSE</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="State Board">State Board</option>
                                    <option value="IB">IB</option>
                                    <option value="IGCSE">IGCSE</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/students')}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                            Create Student Profile
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
