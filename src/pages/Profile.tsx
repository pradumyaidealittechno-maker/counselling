import { useEffect, useState } from 'react';
import { Mail, Building, Briefcase, Calendar } from 'lucide-react';


export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#DC2626' }}>Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
        padding: '2rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 40px rgba(233, 30, 99, 0.25)'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          Profile
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem' }}>
          View and manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 700
          }}>
            {userData.firstName?.[0]}{userData.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
              {userData.firstName} {userData.lastName}
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{userData.jobTitle || userData.role || 'User'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={20} color="#6366F1" />
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Email</p>
              <p style={{ fontSize: '1.1rem', color: 'var(--gray-900)', fontWeight: 500 }}>{userData.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(233, 30, 99, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building size={20} color="#E91E63" />
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Company</p>
              <p style={{ fontSize: '1.1rem', color: 'var(--gray-900)', fontWeight: 500 }}>{userData.company}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={20} color="#10B981" />
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Role</p>
              <p style={{ fontSize: '1.1rem', color: 'var(--gray-900)', fontWeight: 500 }}>{userData.jobTitle || userData.role || 'Not set'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(249, 115, 22, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={20} color="#F97316" />
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Member Since</p>
              <p style={{ fontSize: '1.1rem', color: 'var(--gray-900)', fontWeight: 500 }}>
                {new Date(userData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
