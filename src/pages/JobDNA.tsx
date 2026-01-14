import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dna, AlertTriangle, Save, ChevronDown, ChevronUp,
  Sparkles, Shield
} from 'lucide-react';

const mockJobDNA = {
  title: 'Senior Software Engineer',
  skillDNA: [
    { trait: 'Distributed Systems', importance: 'High', editable: true },
    { trait: 'Microservices Architecture', importance: 'High', editable: true },
    { trait: 'Python / JavaScript', importance: 'High', editable: true },
    { trait: 'AWS / Cloud Services', importance: 'Medium', editable: true },
    { trait: 'PostgreSQL / Databases', importance: 'Medium', editable: true },
    { trait: 'Docker / Kubernetes', importance: 'Low', editable: true },
  ],
  experienceDNA: [
    { trait: '5+ years software development', importance: 'High', editable: true },
    { trait: 'Backend systems experience', importance: 'High', editable: true },
    { trait: 'Team leadership experience', importance: 'Medium', editable: true },
    { trait: 'Startup or scale-up environment', importance: 'Low', editable: true },
  ],
  behavioralDNA: [
    { trait: 'Problem-solving mindset', importance: 'High', editable: true },
    { trait: 'Mentorship capability', importance: 'Medium', editable: true },
    { trait: 'Ownership and accountability', importance: 'High', editable: true },
    { trait: 'Adaptability to change', importance: 'Medium', editable: true },
  ],
  communicationDNA: [
    { trait: 'Technical articulation', importance: 'High', editable: true },
    { trait: 'Cross-team collaboration', importance: 'Medium', editable: true },
    { trait: 'Documentation skills', importance: 'Medium', editable: true },
  ],
  culturalDNA: [
    { trait: 'Innovation-driven', importance: 'Medium', editable: true },
    { trait: 'Remote-friendly', importance: 'Low', editable: true },
  ],
};

const importanceColors = {
  High: { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' },
  Low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
};

type DNACategory = 'skillDNA' | 'experienceDNA' | 'behavioralDNA' | 'communicationDNA' | 'culturalDNA';

const dnaCategories: { key: DNACategory; label: string }[] = [
  { key: 'skillDNA', label: 'Skill DNA' },
  { key: 'experienceDNA', label: 'Experience DNA' },
  { key: 'behavioralDNA', label: 'Behavioral DNA' },
  { key: 'communicationDNA', label: 'Communication DNA' },
  { key: 'culturalDNA', label: 'Cultural DNA' },
];

export default function JobDNA() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<DNACategory[]>(['skillDNA', 'experienceDNA']);

  const toggleSection = (key: DNACategory) => {
    setExpandedSections(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleApprove = () => {
    navigate('/dashboard/jobs/ai-training');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Dna size={18} color="#E91E63" />
              <span style={{ color: '#E91E63', fontWeight: 500, fontSize: '0.75rem' }}>Job DNA</span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
              {mockJobDNA.title}
            </h1>
          </div>
          {/* Warning Badge */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 500 }}>Human Review Required</span>
          </div>
        </div>

        {/* DNA Sections - Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {dnaCategories.map(({ key, label }) => {
            const traits = mockJobDNA[key];
            const isExpanded = expandedSections.includes(key);
            
            return (
              <div key={key} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleSection(key)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</h3>
                      <span style={{ 
                        background: 'rgba(233, 30, 99, 0.1)', 
                        color: '#E91E63', 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.625rem',
                        fontWeight: 500
                      }}>{traits.length}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                </button>

                {isExpanded && (
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {traits.map((trait, i) => {
                        const colors = importanceColors[trait.importance as keyof typeof importanceColors];
                        return (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: '#f9fafb',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}>
                            <input
                              type="text"
                              defaultValue={trait.trait}
                              style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.75rem',
                                outline: 'none',
                                minWidth: 0
                              }}
                            />
                            <select
                              defaultValue={trait.importance}
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '9999px',
                                border: `1px solid ${colors.border}`,
                                background: colors.bg,
                                color: colors.text,
                                fontSize: '0.625rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                    <button style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#6366f1', 
                      fontSize: '0.75rem', 
                      cursor: 'pointer',
                      marginTop: '0.5rem',
                      padding: '0.25rem 0'
                    }}>
                      + Add Trait
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Summary Card */}
        <div className="card" style={{ 
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '1px solid rgba(233, 30, 99, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={16} color="#E91E63" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>DNA Summary</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {dnaCategories.slice(0, 4).map(({ key, label }) => (
              <div key={key} style={{ 
                textAlign: 'center', 
                padding: '0.5rem',
                background: 'white',
                borderRadius: '0.5rem'
              }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E91E63' }}>{mockJobDNA[key].length}</p>
                <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>{label.replace(' DNA', '')}</p>
              </div>
            ))}
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '0.5rem',
            background: 'white',
            borderRadius: '0.5rem',
            marginTop: '0.5rem'
          }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E91E63' }}>{mockJobDNA.culturalDNA.length}</p>
            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>Cultural</p>
          </div>
          <div style={{ 
            marginTop: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid rgba(233, 30, 99, 0.15)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}>
              {Object.values(mockJobDNA).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 0), 0)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Traits</p>
          </div>
        </div>

        {/* Actions Card */}
        <div className="card" style={{ padding: '1rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleApprove} style={{ width: '100%', marginBottom: '0.5rem' }}>
            <Shield size={14} /> Approve & Train AI
          </button>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '0.5rem' }}>
            <Save size={14} /> Save Draft
          </button>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
            Edit Later
          </button>
        </div>

        {/* Info Card */}
        <div style={{ 
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '0.625rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={10} />
            AI training blocked until Job DNA is approved
          </p>
        </div>
      </div>
    </div>
  );
}
