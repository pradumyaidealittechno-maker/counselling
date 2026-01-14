import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Dna, CheckCircle, AlertCircle, Award, Sparkles,
  MessageSquare, Brain, Target, TrendingUp
} from 'lucide-react';

const candidateData = {
  name: 'Sarah Johnson',
  role: 'Senior Software Engineer',
  date: 'January 10, 2026',
  duration: '24 minutes',
  recommendation: 'Hire',
  overallScore: 92,
  dnaScores: {
    skill: { score: 94, label: 'Skill DNA', icon: Target },
    experience: { score: 91, label: 'Experience DNA', icon: TrendingUp },
    behavioral: { score: 95, label: 'Behavioral DNA', icon: Brain },
    communication: { score: 88, label: 'Communication DNA', icon: MessageSquare },
  },
  strengths: [
    { text: 'Strong distributed systems expertise', dna: 'Skill DNA' },
    { text: 'Demonstrated ownership mindset', dna: 'Behavioral DNA' },
    { text: '7 years experience (exceeds 5+ req)', dna: 'Experience DNA' },
  ],
  concerns: [
    { text: 'Could improve technical articulation', dna: 'Communication DNA' },
    { text: 'Limited Kubernetes experience', dna: 'Skill DNA' },
  ],
  explanation: 'Strong Skill DNA alignment with minor Communication gaps. Exceeds Experience DNA requirements with excellent Behavioral DNA traits.'
};

export default function AnalysisReport() {
  const { id } = useParams();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/dashboard/candidates" style={{ color: '#6b7280', display: 'flex' }}>
              <ArrowLeft size={18} />
            </Link>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>SJ</div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937' }}>{candidateData.name}</h1>
              <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{candidateData.role} • {candidateData.date}</p>
            </div>
          </div>
          <Link to={`/dashboard/candidates/${id}/decision`} className="btn btn-primary btn-sm">
            Make Decision
          </Link>
        </div>

        {/* AI Recommendation + Score Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={20} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', color: '#059669', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={10} /> AI Recommendation
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{candidateData.recommendation}</p>
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(233, 30, 99, 0.15)',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontSize: '0.625rem', color: '#E91E63', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Dna size={10} /> Job DNA Match
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E91E63' }}>{candidateData.overallScore}%</p>
            </div>
            <div style={{ width: '60px', height: '60px', position: 'relative' }}>
              <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="30" cy="30" r="25" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                <circle 
                  cx="30" cy="30" r="25" fill="none" 
                  stroke="url(#gradient)" strokeWidth="6"
                  strokeDasharray={`${candidateData.overallScore * 1.57} 157`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E91E63" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* DNA Score Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {Object.entries(candidateData.dnaScores).map(([key, data]) => (
            <div key={key} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <data.icon size={18} color="#E91E63" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151' }}>{data.score}%</p>
              <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>{data.label}</p>
            </div>
          ))}
        </div>

        {/* DNA Visualization */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>DNA Match Visualization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(candidateData.dnaScores).map(([key, data]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '100px', fontSize: '0.75rem', color: '#6b7280' }}>{data.label}</span>
                <div style={{ flex: 1, height: '20px', background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${data.score}%`,
                    height: '100%',
                    background: data.score >= 90 
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      : data.score >= 80 
                      ? 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)'
                      : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.5rem'
                  }}>
                    <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: 600 }}>{data.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Concerns - Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle size={16} color="#10b981" />
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Strengths</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {candidateData.strengths.map((item, i) => (
                <div key={i} style={{
                  padding: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.05)',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem'
                }}>
                  <span>{item.text}</span>
                  <span style={{ display: 'block', fontSize: '0.625rem', color: '#10b981', marginTop: '0.25rem' }}>
                    {item.dna}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertCircle size={16} color="#f59e0b" />
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Concerns</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {candidateData.concerns.map((item, i) => (
                <div key={i} style={{
                  padding: '0.5rem',
                  background: 'rgba(245, 158, 11, 0.05)',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem'
                }}>
                  <span>{item.text}</span>
                  <span style={{ display: 'block', fontSize: '0.625rem', color: '#d97706', marginTop: '0.25rem' }}>
                    {item.dna}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* AI Explanation */}
        <div className="card" style={{ 
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '1px solid rgba(233, 30, 99, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={16} color="#E91E63" />
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>AI Explanation</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{candidateData.explanation}"
          </p>
        </div>

        {/* Interview Details */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Interview Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Date</span>
              <span style={{ fontWeight: 500 }}>{candidateData.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Duration</span>
              <span style={{ fontWeight: 500 }}>{candidateData.duration}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Questions</span>
              <span style={{ fontWeight: 500 }}>5 answered</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to={`/dashboard/candidates/${id}/decision`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              Make Decision
            </Link>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              View Transcript
            </button>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
              Download Report
            </button>
          </div>
        </div>

        {/* DNA Legend */}
        <div style={{ 
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Score Legend</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'linear-gradient(90deg, #10b981, #059669)' }} />
              <span style={{ color: '#6b7280' }}>90%+ Excellent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'linear-gradient(90deg, #E91E63, #6366F1)' }} />
              <span style={{ color: '#6b7280' }}>80-89% Good</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
              <span style={{ color: '#6b7280' }}>&lt;80% Needs Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
