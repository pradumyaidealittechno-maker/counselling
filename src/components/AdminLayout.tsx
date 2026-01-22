import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Users,
    LogOut,
    Shield,
    Moon,
    Sun
} from 'lucide-react';
import { useEffect, useState } from 'react';

const navigation = [
    { name: 'User Management', href: '/admin', icon: Users },
];

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                navigate('/dashboard');
            }
        } catch (e) {
            navigate('/login');
        }
    }, [navigate]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--white)',
                color: 'var(--gray-900)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--gray-200)',
                flexShrink: 0
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Shield size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Admin Panel</span>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1 }}>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href ||
                            (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '0.25rem',
                                    background: isActive ? '#D1FAE5' : 'transparent',
                                    color: isActive ? '#059669' : 'var(--gray-500)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <item.icon size={20} />
                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            color: '#DC2626',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            width: '100%',
                            fontWeight: 500
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar */}
                <header style={{
                    height: '70px',
                    background: 'var(--white)',
                    borderBottom: '1px solid var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 2rem'
                }}>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--gray-500)',
                        }}
                    >
                        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                    </button>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto', background: 'var(--gray-50)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
