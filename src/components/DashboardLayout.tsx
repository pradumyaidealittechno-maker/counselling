import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  Bell,
  Search,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs/create', icon: Briefcase },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Reports', href: '/dashboard', icon: FileText },
  { name: 'Settings', href: '/dashboard', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'white',
        color: '#1F2937',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e5e7eb'
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '2rem'
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
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>Intelligens</span>
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
                  color: isActive ? '#6366F1' : '#6B7280',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F9FAFB';
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
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>AI Assistant</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem' }}>
            Get AI-powered insights for your hiring decisions
          </p>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Ask AI
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{
          height: '70px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
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
            background: '#f3f4f6',
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
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Notifications */}
            <button style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
              <Bell size={22} color="#6b7280" />
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

            {/* User Menu */}
            <div style={{
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
                JD
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem', color: '#1F2937' }}>John Doe</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>HR Manager</p>
              </div>
              <ChevronDown size={16} color="#6b7280" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto', background: 'white' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}