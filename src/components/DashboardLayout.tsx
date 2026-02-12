import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
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
  Sun,
  Menu,
  X,
  GraduationCap,
  Calendar,
  BarChart3,
  BookOpen,
  RefreshCw,
  BookMarked
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import ChatbotDialog from './ChatbotDialog';
import NotificationDropdown from './NotificationDropdown';
import api from '../services/api';

// Recruitment Module Navigation
const recruitmentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Interviews', href: '/dashboard/interviews', icon: Video },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/profile', icon: Settings },
];

// Counselling Module Navigation
const counsellingNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Students', href: '/dashboard/students', icon: GraduationCap },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
  { name: 'Assessments', href: '/dashboard/assessments', icon: BarChart3 },
  { name: 'Resources', href: '/dashboard/resources', icon: BookMarked },
  { name: 'Analytics', href: '/dashboard/analytics', icon: FileText },
  { name: 'Settings', href: '/dashboard/profile', icon: Settings },
];

// Student Portal Navigation
const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Schedule', href: '/dashboard/sessions', icon: Calendar },
  { name: 'My Assessments', href: '/dashboard/assessments', icon: BarChart3 },
  { name: 'My Courses', href: '/dashboard/courses', icon: GraduationCap },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('HR Manager');
  const [userInitials, setUserInitials] = useState('HM');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<'recruitment' | 'counselling'>(
    (localStorage.getItem('selected_module') as 'recruitment' | 'counselling') || 'recruitment'
  );
  const userRole = localStorage.getItem('user_role') || 'staff';
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userRole === 'student') {
      setUserName('Rahul Sharma');
      setUserInitials('RS');
    }
  }, [userRole]);

  // Check if current page needs full-width content (no padding)
  const isFullWidthContent = location.pathname === '/dashboard/students' ||
    (location.pathname === '/dashboard' && selectedModule === 'counselling');

  // Get navigation based on selected module & role
  let navigation = userRole === 'student' ? studentNavigation : (selectedModule === 'recruitment' ? recruitmentNavigation : counsellingNavigation);

  // Handle module switch
  const handleModuleSwitch = () => {
    if (userRole === 'student') return;
    const newModule = selectedModule === 'recruitment' ? 'counselling' : 'recruitment';
    setSelectedModule(newModule);
    localStorage.setItem('selected_module', newModule);

    // Dispatch custom event to notify DashboardRouter
    window.dispatchEvent(new Event('moduleChanged'));

    navigate('/dashboard');
  };

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

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

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
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
              display: 'none'
            }}
            className="mobile-overlay"
          />
        )}

        {/* Sidebar */}
        <aside
          className="dashboard-sidebar"
          style={{
            width: '260px',
            background: 'var(--white)',
            color: 'var(--gray-900)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--gray-200)',
            flexShrink: 0,
            position: 'fixed',
            height: '100vh',
            left: isMobileMenuOpen ? 0 : '-260px',
            top: 0,
            zIndex: 999,
            transition: 'left 0.3s ease-in-out',
            overflowY: 'auto'
          }}
        >
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-close-btn"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
              padding: '0.5rem',
              color: 'var(--gray-500)'
            }}
          >
            <X size={24} />
          </button>

          {/* Logo */}
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              textDecoration: 'none'
            }}
          >
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '0.25rem',
                    background: isActive ? '#EDE9FE' : 'transparent',
                    color: isActive ? '#6366F1' : 'var(--gray-500)',
                    transition: 'all 0.2s',
                    textDecoration: 'none'
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
              {selectedModule === 'counselling'
                ? 'Get AI-powered insights for student counselling'
                : 'Get AI-powered insights for your hiring decisions'}
            </p>
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => { setChatbotOpen(true); setIsMobileMenuOpen(false); }}>
              Ask AI
            </button>
          </div>


          {/* Module Switcher - Only for Staff */}
          {userRole !== 'student' && (
            <div style={{
              background: selectedModule === 'recruitment' ? 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '1rem',
              padding: '1.25rem',
              border: selectedModule === 'recruitment' ? '1px solid rgba(233, 30, 99, 0.3)' : '1px solid rgba(102, 126, 234, 0.3)',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                {selectedModule === 'recruitment' ? (
                  <Briefcase size={18} color="#E91E63" />
                ) : (
                  <GraduationCap size={18} color="#667eea" />
                )}
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                  {selectedModule === 'recruitment' ? 'Recruitment' : 'Counselling'} Module
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                Switch to {selectedModule === 'recruitment' ? 'Counselling' : 'Recruitment'} module
              </p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => { handleModuleSwitch(); setIsMobileMenuOpen(false); }}
              >
                <RefreshCw size={14} />
                Switch Module
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '260px', transition: 'margin-left 0.3s ease-in-out' }}>
          {/* Top Bar */}
          <header className="dashboard-header" style={{
            height: '70px',
            background: 'var(--white)',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            {/* Left Section - Hamburger + Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'none',
                  padding: '0.5rem',
                  color: 'var(--gray-700)'
                }}
              >
                <Menu size={24} />
              </button>

              {/* Search */}
              {/* <div className="header-search" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--gray-100)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                flex: 1,
                maxWidth: '400px'
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
              </div> */}
            </div>

            {/* Right Section */}
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
                  padding: '0.5rem'
                }}
              >
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              </button>

              {/* Notifications */}
              <div className="hide-mobile">
                <NotificationDropdown />
              </div>

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
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    {userInitials}
                  </div>
                  <div className="hide-mobile">
                    <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-900)', whiteSpace: 'nowrap' }}>{userName}</p>
                  </div>
                  <ChevronDown size={16} color="var(--gray-500)" className="hide-mobile" />
                </div>
                {showProfileMenu && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '220px', background: 'var(--white)', borderRadius: '0.75rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', border: '1px solid var(--gray-200)', padding: '0.5rem', zIndex: 1000 }}>
                    <Link to="/dashboard/profile" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--gray-700)', textDecoration: 'none', cursor: 'pointer' }}>
                      <UserCircle size={18} />
                      <span style={{ fontSize: '0.875rem' }}>View Profile</span>
                    </Link>
                    <Link to="/dashboard/profile/edit" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--gray-700)', textDecoration: 'none', cursor: 'pointer' }}>
                      <Edit size={18} />
                      <span style={{ fontSize: '0.875rem' }}>Update Profile</span>
                    </Link>
                    <div style={{ height: '1px', background: 'var(--gray-200)', margin: '0.5rem 0' }} />
                    <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: '#DC2626', cursor: 'pointer' }}>
                      <LogOut size={18} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main style={{
            flex: 1,
            padding: isFullWidthContent ? '0' : '1.5rem',
            overflow: 'auto',
            background: 'var(--gray-50)'
          }}>
            <Outlet />
          </main>
        </div>

        {/* Chatbot Dialog */}
        <ChatbotDialog
          isOpen={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
          module={selectedModule}
        />
      </div>

      {/* Responsive Styles */}
      <style>{`
        /* Desktop - sidebar always visible */
        @media (min-width: 1025px) {
          .dashboard-sidebar {
            left: 0 !important;
            position: relative !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
          .mobile-menu-btn,
          .mobile-close-btn {
            display: none !important;
          }
        }

        /* Tablets and below */
        @media (max-width: 1024px) {
          .dashboard-sidebar {
            position: fixed !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .dashboard-header {
            padding: 0 1rem !important;
          }
          .header-search {
            max-width: 250px !important;
          }
          .header-actions {
            gap: 0.75rem !important;
          }
        }

        /* Mobile devices */
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .dashboard-header {
            height: 60px !important;
            padding: 0 0.75rem !important;
          }
          .header-search {
            max-width: none !important;
            padding: 0.375rem 0.75rem !important;
          }
          .header-search input {
            font-size: 0.8125rem !important;
          }
          .header-actions {
            gap: 0.5rem !important;
          }
          main {
            padding: 1rem !important;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .header-search {
            display: none !important;
          }
          .dashboard-header {
            padding: 0 0.5rem !important;
          }
          main {
            padding: 0.75rem !important;
          }
        }
      `}</style>
    </>
  );
}