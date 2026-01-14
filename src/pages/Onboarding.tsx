import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building, Users, MapPin, Linkedin, ArrowRight, Check, Dna, Video, Brain } from 'lucide-react';

const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Other'];
const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState('51-200');

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #faf5ff 100%)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(233, 30, 99, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(233, 30, 99, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />

      {/* Left Sidebar - Progress & Info */}
      <div style={{
        width: '320px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
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
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}>Intelligens</span>
        </div>

        {/* Progress Steps */}
        <div style={{ marginBottom: '3rem' }}>
          {[
            { num: 1, title: 'Company Info', desc: 'Tell us about your company' },
            { num: 2, title: 'Team Size', desc: 'How big is your team?' },
            { num: 3, title: 'Locations', desc: 'Where do you hire?' }
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', gap: '1rem', marginBottom: i < 2 ? '1.5rem' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step >= s.num 
                    ? 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)' 
                    : 'white',
                  border: step >= s.num ? 'none' : '2px solid #e5e7eb',
                  color: step >= s.num ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  {step > s.num ? <Check size={18} /> : s.num}
                </div>
                {i < 2 && (
                  <div style={{
                    width: '2px',
                    height: '24px',
                    background: step > s.num 
                      ? 'linear-gradient(180deg, #E91E63 0%, #6366F1 100%)' 
                      : '#e5e7eb',
                    marginTop: '0.5rem'
                  }} />
                )}
              </div>
              <div>
                <p style={{ 
                  fontWeight: 600, 
                  color: step >= s.num ? '#1F2937' : '#9ca3af',
                  fontSize: '0.875rem'
                }}>{s.title}</p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: step >= s.num ? '#6b7280' : '#d1d5db' 
                }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What you'll get
          </p>
          {[
            { icon: Dna, text: 'Job DNA Framework' },
            { icon: Video, text: 'AI Video Interviews' },
            { icon: Brain, text: 'Smart Recommendations' }
          ].map((item, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(233, 30, 99, 0.1)'
              }}>
                <item.icon size={16} color="#E91E63" />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 10px 40px rgba(233, 30, 99, 0.1)',
          border: '1px solid rgba(233, 30, 99, 0.1)'
        }}>
          {step === 1 && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2937' }}>
                Tell us about your company
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                This helps us customize your recruitment experience
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Company Name</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="input" placeholder="Acme Inc." style={{ paddingLeft: '40px' }} defaultValue="Acme Corporation" />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Industry</label>
                <select className="input">
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">LinkedIn Company Page (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Linkedin size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="url" className="input" placeholder="https://linkedin.com/company/..." style={{ paddingLeft: '40px' }} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2937' }}>
                How big is your team?
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Select your company size
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {companySizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '1.25rem 1rem',
                      border: selectedSize === size 
                        ? '2px solid #E91E63' 
                        : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      background: selectedSize === size 
                        ? 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' 
                        : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Users size={24} color={selectedSize === size ? '#E91E63' : '#9ca3af'} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 600, color: selectedSize === size ? '#E91E63' : '#374151' }}>{size}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>employees</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1F2937' }}>
                Where do you hire?
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Add your primary hiring locations
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Primary Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="input" placeholder="San Francisco, CA" style={{ paddingLeft: '40px' }} defaultValue="San Francisco, CA" />
                </div>
              </div>
              <div>
                <label className="label">Additional Locations (Optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['New York, NY', 'Austin, TX', 'Remote'].map((loc) => (
                    <span key={loc} style={{
                      background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      border: '1px solid rgba(233, 30, 99, 0.2)'
                    }}>{loc}</span>
                  ))}
                  <button style={{
                    background: 'white',
                    border: '1px dashed #d1d5db',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}>+ Add location</button>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
            ) : <div />}
            <button
              className="btn btn-primary"
              onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
              style={{
                background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                boxShadow: '0 4px 14px rgba(233, 30, 99, 0.3)'
              }}
            >
              {step < 3 ? 'Continue' : 'Complete Setup'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
