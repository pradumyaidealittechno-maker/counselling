import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, Edit3, Trash2, Plus, Video, Mic, CheckCircle, GripVertical, Info } from 'lucide-react';

const mockQuestions = {
  technical: [
    { id: 1, text: 'Describe your experience with distributed systems and microservices architecture.', dna: 'Distributed Systems', dnaType: 'Skill DNA', importance: 'High' },
    { id: 2, text: 'How would you design a scalable API that handles millions of requests per day?', dna: 'Microservices Architecture', dnaType: 'Skill DNA', importance: 'High' },
    { id: 3, text: 'Explain your approach to writing maintainable and testable code.', dna: 'Python / JavaScript', dnaType: 'Skill DNA', importance: 'High' },
  ],
  behavioral: [
    { id: 4, text: 'Tell me about a time when you had to mentor a junior developer.', dna: 'Mentorship capability', dnaType: 'Behavioral DNA', importance: 'Medium' },
    { id: 5, text: 'Describe a situation where you took ownership of a challenging project.', dna: 'Ownership and accountability', dnaType: 'Behavioral DNA', importance: 'High' },
  ],
  situational: [
    { id: 6, text: 'How would you handle a production outage affecting critical services?', dna: 'Problem-solving mindset', dnaType: 'Behavioral DNA', importance: 'High' },
    { id: 7, text: 'How would you explain a complex technical concept to a non-technical stakeholder?', dna: 'Technical articulation', dnaType: 'Communication DNA', importance: 'High' },
  ],
};

const importanceColors = {
  High: { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' },
  Medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
  Low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' },
};

export default function InterviewBuilder() {
  const navigate = useNavigate();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Dna size={20} color="#6366f1" />
          <span style={{ color: '#6366f1', fontWeight: 500, fontSize: '0.875rem' }}>Job DNA™ Powered</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Interview Question Builder
        </h1>
        <p style={{ color: '#6b7280' }}>
          Questions generated from Job DNA™ for Senior Software Engineer
        </p>
      </div>

      {/* DNA Linkage Info */}
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
        <Info size={20} color="#6366f1" />
        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
          Each question is linked to specific Job DNA™ traits. This ensures consistent, fair evaluation across all candidates.
        </p>
      </div>

      {/* Interview Settings */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Interview Settings</h3>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{
              width: '48px',
              height: '28px',
              background: videoEnabled ? '#6366f1' : '#e5e7eb',
              borderRadius: '14px',
              position: 'relative',
              transition: 'background 0.2s'
            }} onClick={() => setVideoEnabled(!videoEnabled)}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: videoEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
            <Video size={20} color={videoEnabled ? '#6366f1' : '#9ca3af'} />
            <span style={{ color: videoEnabled ? '#374151' : '#9ca3af' }}>Video Interview</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{
              width: '48px',
              height: '28px',
              background: voiceEnabled ? '#6366f1' : '#e5e7eb',
              borderRadius: '14px',
              position: 'relative',
              transition: 'background 0.2s'
            }} onClick={() => setVoiceEnabled(!voiceEnabled)}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: voiceEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
            <Mic size={20} color={voiceEnabled ? '#6366f1' : '#9ca3af'} />
            <span style={{ color: voiceEnabled ? '#374151' : '#9ca3af' }}>Voice Interview</span>
          </label>
        </div>
      </div>

      {/* Question Categories */}
      {Object.entries(mockQuestions).map(([category, questions]) => (
        <div key={category} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {category} Questions
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: 400 }}>
                ({questions.length})
              </span>
            </h3>
            <button className="btn btn-ghost btn-sm">
              <Plus size={16} /> Add Question
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions.map((q, i) => {
              const colors = importanceColors[q.importance as keyof typeof importanceColors];
              return (
                <div key={q.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <GripVertical size={18} color="#9ca3af" style={{ cursor: 'grab', marginTop: '2px' }} />
                    <span style={{ 
                      width: '24px', 
                      height: '24px', 
                      background: '#6366f1', 
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>{i + 1}</span>
                    <p style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.6 }}>{q.text}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <Edit3 size={16} color="#6b7280" />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                  {/* DNA Linkage */}
                  <div style={{ marginLeft: '54px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Dna size={14} color="#6366f1" />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Evaluates:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>{q.dna}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({q.dnaType})</span>
                    <span style={{
                      fontSize: '0.625rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      background: colors.bg,
                      color: colors.text,
                      fontWeight: 500
                    }}>{q.importance}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/candidates')}
        >
          <CheckCircle size={18} /> Finalize Interview
        </button>
        <button className="btn btn-secondary">Save as Draft</button>
      </div>
    </div>
  );
}
