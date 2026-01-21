import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  Search,
  ChevronDown,
  Sparkles,
  Video,
  LogOut,
  UserCircle,
  Edit,
  Moon,
  Sun
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import ChatbotDialog from './ChatbotDialog';
import api from '../services/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Interviews', href: '/dashboard/interviews', icon: Video },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/profile', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('HR Manager');
  const [userInitials, setUserInitials] = useState('HM');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Fetch user info from API
    const fetchUserData = async () => {
      try {
        console.log('🔍 Fetching user data for header...');
        const userData = await api.auth.getMe();
        
        if (userData && userData.firstName && userData.lastName) {
          const fullName = `${userData.firstName} ${userData.lastName}`;
          console.log('👤 Setting user name to:', fullName);
          setUserName(fullName);
          setUserInitials(`${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase());
        }
      } catch (error) {
        console.error('❌ Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

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
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Intelligens</span>
        </Link>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
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
                  background: isActive ? '#EDE9FE' : 'transparent',
                  color: isActive ? '#6366F1' : 'var(--gray-500)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--gray-50)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon size={20} />
                <span style={{ fontWeight: 500 }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(163, 139, 250, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid rgba(163, 139, 250, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={18} color="#A78BFA" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)' }}>AI Assistant</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
            Get AI-powered insights for your hiring decisions
          </p>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => setChatbotOpen(true)}>
            Ask AI
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
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--gray-100)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            width: '400px'
          }}>
            <Search size={18} color="#6b7280" />
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
                color: 'var(--gray-900)',
              }}
            />
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Theme Toggle */}
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

            {/* Notifications - Commented out as requested */}
            {/* 
            <button style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-500)'
            }}>
              <Bell size={22} />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                background: '#E91E63',
                borderRadius: '50%',
                fontSize: '0.625rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>3</span>
            </button>
            */}

            {/* User Menu */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600
              }}>
                {userInitials}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-900)' }}>{userName}</p>
              </div>
              <ChevronDown size={16} color="var(--gray-500)" />
            </div>
              {showProfileMenu && (
                <div style={{position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '220px', background: 'var(--white)', borderRadius: '0.75rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', border: '1px solid var(--gray-200)', padding: '0.5rem', zIndex: 50}}>
                  <Link to="/dashboard/profile" onClick={() => setShowProfileMenu(false)} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--gray-700)', textDecoration: 'none', cursor: 'pointer'}}>
                    <UserCircle size={18} />
                    <span style={{fontSize: '0.875rem'}}>View Profile</span>
                  </Link>
                  <Link to="/dashboard/profile/edit" onClick={() => setShowProfileMenu(false)} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--gray-700)', textDecoration: 'none', cursor: 'pointer'}}>
                    <Edit size={18} />
                    <span style={{fontSize: '0.875rem'}}>Update Profile</span>
                  </Link>
                  <div style={{height: '1px', background: 'var(--gray-200)', margin: '0.5rem 0'}} />
                  <div onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: '#DC2626', cursor: 'pointer'}}>
                    <LogOut size={18} />
                    <span style={{fontSize: '0.875rem', fontWeight: 500}}>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto', background: 'var(--gray-50)' }}>
          <Outlet />
        </main>
      </div>

      {/* Chatbot Dialog */}
      <ChatbotDialog 
        isOpen={chatbotOpen} 
        onClose={() => setChatbotOpen(false)}
      />
    </div>
  );
}