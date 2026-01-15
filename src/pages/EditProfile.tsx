import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, X } from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          company: data.company || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        alert('✅ Profile updated successfully!');
        navigate('/dashboard/profile');
      } else {
        alert('❌ Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
          ✏️ Update Profile
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem' }}>
          Update your name and profile photo
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          {/* Profile Photo */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 700,
              position: 'relative'
            }}>
              {userData.firstName?.[0]}{userData.lastName?.[0]}
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '40px',
                height: '40px',
                background: '#6366F1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                <Camera size={20} color="white" />
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Click camera icon to upload photo (Coming soon)
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                First Name
              </label>
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366F1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Last Name
              </label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366F1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email (Read-only)
              </label>
              <input
                type="email"
                value={userData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: '#f9fafb',
                  color: '#6b7280'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Company (Read-only)
              </label>
              <input
                type="text"
                value={userData.company}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: '#f9fafb',
                  color: '#6b7280'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              background: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
