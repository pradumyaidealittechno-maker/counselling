import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, CheckCircle, Loader, Dna, ArrowRight, Shield, X } from 'lucide-react';

const trainingSteps = [
  { label: 'Reading Job DNA', duration: 1500 },
  { label: 'Mapping competencies from DNA traits', duration: 2000 },
  { label: 'Preparing interview intelligence', duration: 2500 },
];

export default function AITraining() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [mappedDimensions, setMappedDimensions] = useState([
    'Skill DNA',
    'Experience DNA',
    'Behavioral DNA',
    'Communication DNA',
    'Cultural DNA'
  ]);

  const removeDimension = (dim: string) => {
    setMappedDimensions(prev => prev.filter(d => d !== dim));
  };

  useEffect(() => {
    if (currentStep < trainingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setProgress(((currentStep + 1) / trainingSteps.length) * 100);
      }, trainingSteps[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      setComplete(true);
    }
  }, [currentStep]);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: complete
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: complete
            ? '0 0 40px rgba(16, 185, 129, 0.4)'
            : '0 0 40px rgba(99, 102, 241, 0.4)'
        }}>
          {complete ? (
            <CheckCircle size={48} color="white" />
          ) : (
            <Brain size={48} color="white" style={{ animation: 'pulse 2s infinite' }} />
          )}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {complete ? 'AI Agent Ready!' : 'Training AI Interview Agent'}
        </h1>
        <p style={{ color: 'var(--gray-500)' }}>
          {complete
            ? 'Your AI interview agent has been trained on the approved Job DNA'
            : 'Training AI agent on approved Job DNA for Senior Software Engineer'}
        </p>
      </div>

      {/* Job DNA Source */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '0.75rem',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <Dna size={24} color="#6366f1" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Training Source: Job DNA</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Senior Software Engineer • 18 traits across 5 dimensions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Shield size={14} color="#10b981" />
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Human Approved</span>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Training Progress</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: complete
                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '6px',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>

        {/* Training Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {trainingSteps.map((step, i) => {
            const isComplete = i < currentStep;
            const isCurrent = i === currentStep && !complete;
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: isComplete ? 'rgba(16, 185, 129, 0.05)' : isCurrent ? 'rgba(99, 102, 241, 0.05)' : '#f9fafb',
                borderRadius: '0.75rem',
                border: isCurrent ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isComplete ? '#10b981' : isCurrent ? '#6366f1' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isComplete ? (
                    <CheckCircle size={20} color="white" />
                  ) : isCurrent ? (
                    <Loader size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <span style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, color: isComplete || isCurrent ? '#374151' : '#9ca3af' }}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p style={{ fontSize: '0.75rem', color: '#6366f1' }}>Processing...</p>
                  )}
                </div>
                {isComplete && (
                  <span className="badge badge-success">Complete</span>
                )}
              </div>
            );
          })}
        </div>

        {/* DNA Dimensions Mapped */}
        {complete && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Dna size={18} color="#6366f1" />
              <span style={{ fontWeight: 600 }}>Job DNA Dimensions Mapped</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {mappedDimensions.map((dim) => (
                <span key={dim} style={{
                  background: 'var(--white)',
                  border: '1px solid #e5e7eb',
                  padding: '0.5rem 0.75rem 0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={14} color="#10b981" />
                  {dim}
                  <button
                    onClick={() => removeDimension(dim)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--gray-400)',
                      marginLeft: '0.25rem'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray-400)')}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {complete && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '2rem' }}
            onClick={() => navigate(jobId ? `/dashboard/jobs/${jobId}/interview-builder` : '/dashboard/jobs/interview-builder')}
          >
            View Interview Questions <ArrowRight size={18} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
