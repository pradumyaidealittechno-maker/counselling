import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Search, Loader, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function LinkedInImport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'fetching' | 'error'>('input');
  const [fetchProgress, setFetchProgress] = useState(0);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    const url = linkedInUrl.trim();

    if (!url) {
      setError('Please enter a LinkedIn job URL');
      return;
    }

    // Validate LinkedIn URL pattern
    const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/jobs\//i;
    if (!linkedInPattern.test(url)) {
      setError('Invalid URL. Please enter a valid LinkedIn Job URL (e.g., https://www.linkedin.com/jobs/view/...)');
      return;
    }

    setStep('fetching');
    setError(null);

    // Simulate progress while creating job
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setFetchProgress(Math.min(progress, 80));
    }, 500);

    try {
      // Create a new job with the LinkedIn URL as source
      const jobData = {
        title: 'Imported Job',
        description: `Job imported from LinkedIn: ${url}\n\nPlease update the job details and generate Job DNA.`,
        department: 'To be updated',
        location: 'To be updated',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        source: {
          type: 'linkedin',
          linkedInUrl: url
        }
      };

      const job = await api.jobs.create(jobData);

      clearInterval(interval);
      setFetchProgress(100);

      // Navigate to job DNA page with the new job
      setTimeout(() => {
        navigate(`/dashboard/jobs/${job._id}/job-dna`);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Failed to create job:', err);
      setError(err.message || 'Failed to import job from LinkedIn');
      setStep('error');
    }
  };

  const handleRetry = () => {
    setStep('input');
    setFetchProgress(0);
    setError(null);
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

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#DC2626',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="url"
              className="input"
              placeholder="https://www.linkedin.com/jobs/view/..."
              style={{ paddingLeft: '40px' }}
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
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
            Creating Job from LinkedIn
          </h3>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              {[
                { label: 'Validating LinkedIn URL', done: fetchProgress >= 20 },
                { label: 'Creating job record', done: fetchProgress >= 40 },
                { label: 'Setting up Job DNA framework', done: fetchProgress >= 60 },
                { label: 'Preparing for analysis', done: fetchProgress >= 80 },
                { label: 'Redirecting to Job DNA', done: fetchProgress >= 100 }
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

      {step === 'error' && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <AlertCircle size={36} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#DC2626' }}>
            Import Failed
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
            {error || 'Something went wrong while importing the job'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleRetry}>
              Try Again
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard/jobs/create')}>
              Create Manually
            </button>
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
