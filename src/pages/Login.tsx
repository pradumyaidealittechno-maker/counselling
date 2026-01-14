import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Dna, CheckCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #faf5ff 100%)'
    }}>
      {/* Left Panel - Branding */}
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
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(233, 30, 99, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
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
            Welcome back
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', maxWidth: '400px', marginBottom: '2rem' }}>
            Sign in to access your AI-powered recruitment dashboard and continue making smarter hiring decisions.
          </p>

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Dna, text: 'Job DNA powered interviews' },
              { icon: CheckCircle, text: 'AI-driven candidate insights' },
              { icon: Sparkles, text: 'Explainable hiring recommendations' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(233, 30, 99, 0.1)'
                }}>
                  <item.icon size={18} color="#E91E63" />
                </div>
                <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '480px',
        background: 'white',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '-10px 0 40px rgba(233, 30, 99, 0.05)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1F2937' }}>Sign in</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#E91E63', fontWeight: 500 }}>Sign up</Link>
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
            cursor: 'pointer',
            transition: 'all 0.2s'
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
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" width="20" height="20" />
            Microsoft
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" className="input" placeholder="you@company.com" style={{ paddingLeft: '40px' }} defaultValue="john@acme.com" />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" className="input" placeholder="••••••••" style={{ paddingLeft: '40px' }} defaultValue="password" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Remember me</span>
            </label>
            <a href="#" style={{ fontSize: '0.875rem', color: '#E91E63' }}>Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary" style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            boxShadow: '0 4px 14px rgba(233, 30, 99, 0.3)'
          }}>
            Sign in <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
