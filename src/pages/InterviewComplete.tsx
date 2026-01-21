import { CheckCircle, Sparkles, Clock, Dna } from 'lucide-react';
import { useLocation } from 'react-router-dom';


export default function InterviewComplete() {
  const location = useLocation();
  
  // Get job details from navigation state or sessionStorage
  const jobTitle = location.state?.jobTitle || 
                   sessionStorage.getItem('job_title') || 
                   'Software Engineer';
  
  const companyName = location.state?.companyName || 
                      sessionStorage.getItem('company_name') || 
                      'Our Company';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #faf5ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
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
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-800)' }}>Intelligens</span>
        </div>

        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle size={48} color="white" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1rem' }}>
          Interview Completed!
        </h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
          Thank you for completing your interview for the {jobTitle} position at {companyName}.
        </p>

        {/* What's Next */}
        <div style={{
          background: 'var(--white)',
          borderRadius: '1rem',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '2rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: 'var(--gray-800)', fontWeight: 600, marginBottom: '1rem' }}>What happens next?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              // { icon: Dna, text: 'AI analyzes your responses against Job DNA', color: '#E91E63' },
              { icon: Clock, text: 'Hiring team reviews within 3-5 business days', color: '#6366F1' },
              { icon: CheckCircle, text: 'You\'ll receive an update via email', color: '#10b981' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: `${item.color}15`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 30%; }
          50% { width: 70%; }
          100% { width: 30%; }
        }
      `}</style>
    </div>
  );
}
