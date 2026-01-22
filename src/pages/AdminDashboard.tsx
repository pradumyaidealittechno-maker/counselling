import { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    jobTitle: string;
    role: 'user' | 'admin';
    isActive: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getUsers();
            setUsers(data);
        } catch (err: any) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean, role: string) => {
        if (role === 'admin') {
            alert('Cannot change status of admin users.');
            return;
        }

        try {
            await api.admin.toggleUserStatus(userId, !currentStatus);
            // Optimistic update
            setUsers(users.map(u =>
                u._id === userId ? { ...u, isActive: !currentStatus } : u
            ));
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading users...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>User Management</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Manage user access and accounts</p>
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--gray-300)',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ background: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Company</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Joined</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.875rem'
                                        }}>
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{user.firstName} {user.lastName}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {user.role === 'admin' ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#DBEAFE', color: '#1E40AF' }}>
                                            <Shield size={12} /> Admin
                                        </span>
                                    ) : (
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#F3F4F6', color: '#374151' }}>
                                            User
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ color: 'var(--gray-900)' }}>{user.company}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{user.jobTitle}</div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {user.isActive ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <UserCheck size={16} /> Active
                                        </span>
                                    ) : (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#DC2626', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <UserX size={16} /> Inactive
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => handleToggleStatus(user._id, user.isActive, user.role)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                background: user.isActive ? '#FEF2F2' : '#ECFDF5',
                                                color: user.isActive ? '#DC2626' : '#059669',
                                                border: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
