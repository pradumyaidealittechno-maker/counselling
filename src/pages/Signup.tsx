import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Building, ArrowRight, Dna, Video, Brain } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/onboarding');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #faf5ff 100%)'
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(233, 30, 99, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={28} color="white" />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1F2937' }}>Intelligens</span>
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
            Start hiring smarter
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', maxWidth: '400px', marginBottom: '2rem' }}>
            Create your account and experience AI-powered recruitment that saves time and improves hiring quality.
          </p>

          {/* Feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Dna, title: 'Job DNA Framework', desc: 'Structured role intelligence' },
              { icon: Video, title: 'AI Video Interviews', desc: 'Automated candidate screening' },
              { icon: Brain, title: 'Smart Recommendations', desc: 'Explainable hiring decisions' }
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                background: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 12px rgba(233, 30, 99, 0.08)',
                border: '1px solid rgba(233, 30, 99, 0.1)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <item.icon size={22} color="#E91E63" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>{item.title}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width: '480px',
        background: 'white',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '-10px 0 40px rgba(233, 30, 99, 0.05)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1F2937' }}>Create account</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#E91E63', fontWeight: 500 }}>Sign in</Link>
        </p>

        {/* SSO Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
            Google
          </button>
          <button style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" width="20" height="20" />
            Microsoft
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="label">First Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input" placeholder="John" style={{ paddingLeft: '40px' }} />
              </div>
            </div>
            <div>
              <label className="label">Last Name</label>
              <input type="text" className="input" placeholder="Doe" />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" className="input" placeholder="you@company.com" style={{ paddingLeft: '40px' }} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Company Name</label>
            <div style={{ position: 'relative' }}>
              <Building size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="input" placeholder="Acme Inc." style={{ paddingLeft: '40px' }} />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" className="input" placeholder="••••••••" style={{ paddingLeft: '40px' }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            boxShadow: '0 4px 14px rgba(233, 30, 99, 0.3)'
          }}>
            Create Account <ArrowRight size={18} />
          </button>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}
