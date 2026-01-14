import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Search, Loader, CheckCircle, ArrowRight } from 'lucide-react';

export default function LinkedInImport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'fetching'>('input');
  const [fetchProgress, setFetchProgress] = useState(0);

  const handleFetch = () => {
    setStep('fetching');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setFetchProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => navigate('/dashboard/jobs/job-dna'), 500);
      }
    }, 700);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Import from LinkedIn
        </h1>
        <p style={{ color: '#6b7280' }}>
          Paste a LinkedIn job URL to extract job details and generate Job DNA™
        </p>
      </div>

      {step === 'input' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(10, 102, 194, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Linkedin size={24} color="#0a66c2" />
            </div>
            <div>
              <h3 style={{ fontWeight: 600 }}>LinkedIn Job URL</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Enter the URL of the LinkedIn job posting</p>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="url"
              className="input"
              placeholder="https://www.linkedin.com/jobs/view/..."
              style={{ paddingLeft: '40px' }}
              defaultValue="https://www.linkedin.com/jobs/view/3847291056"
            />
          </div>

          <button className="btn btn-primary" onClick={handleFetch}>
            Fetch & Generate Job DNA™ <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 'fetching' && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Loader size={36} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
            Generating Job DNA™
          </h3>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              {[
                { label: 'Fetching job content', done: fetchProgress >= 25 },
                { label: 'Analyzing job description', done: fetchProgress >= 50 },
                { label: 'Identifying skills & experience', done: fetchProgress >= 75 },
                { label: 'Extracting behavioral signals', done: fetchProgress >= 100 }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.done ? (
                    <CheckCircle size={20} color="#10b981" />
                  ) : (
                    <div style={{ width: '20px', height: '20px', border: '2px solid #e5e7eb', borderRadius: '50%' }} />
                  )}
                  <span style={{ color: item.done ? '#374151' : '#9ca3af' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${fetchProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
