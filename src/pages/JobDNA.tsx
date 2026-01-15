import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Dna, AlertTriangle, Save, Shield, FileText, Clock, Loader, Plus } from 'lucide-react';
import api from '../services/api';

type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

interface DNATrait {
  id: string;
  name: string;
  description: string;
  importance: ImportanceLevel;
  signals: string[];
}

interface JobDNAData {
  _id?: string;
  title: string;
  department: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  jobDNA?: {
    skillDNA: DNATrait[];
    experienceDNA: DNATrait[];
    behavioralDNA: DNATrait[];
    communicationDNA: DNATrait[];
    culturalDNA: DNATrait[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function JobDNA() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  const [job, setJob] = useState<JobDNAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [culturalDNAEnabled, setCulturalDNAEnabled] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      if (jobId) {
        const data = await api.jobs.getById(jobId);
        setJob(data);
        setError(null);
      } else {
        const state = location.state as { jobData?: JobDNAData } | null;
        if (state?.jobData) {
          setJob(state.jobData);
        } else {
          setJob(null);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job';
      console.error('Failed to load job:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDNA = async () => {
    if (!job?._id) return;
    try {
      setGenerating(true);
      const result = await api.jobs.generateDNA(job._id);
      setJob(prev => prev ? { ...prev, jobDNA: result.jobDNA } : null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Job DNA';
      console.error('Failed to generate DNA:', err);
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = () => {
    if (job?._id) {
      navigate(`/dashboard/jobs/${job._id}/ai-training`);
    } else {
      navigate('/dashboard/jobs/interview-builder');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" />
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading Job DNA...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Dna size={40} color="#E91E63" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1F2937' }}>No Job Selected</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Create a new job or select an existing one to view and manage its Job DNA</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/jobs/create')}><Plus size={18} /> Create New Job</button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>View Dashboard</button>
        </div>
      </div>
    );
  }

  const jobDNA = job.jobDNA || { skillDNA: [], experienceDNA: [], behavioralDNA: [], communicationDNA: [], culturalDNA: [] };
  const hasDNA = jobDNA.skillDNA.length > 0 || jobDNA.experienceDNA.length > 0;
  const totalTraits = jobDNA.skillDNA.length + jobDNA.experienceDNA.length + jobDNA.behavioralDNA.length + jobDNA.communicationDNA.length + (culturalDNAEnabled ? jobDNA.culturalDNA.length : 0);

  if (!hasDNA) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Dna size={20} color="#E91E63" />
            <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '0.75rem' }}>Job DNA</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.25rem' }}>{job.title}</h1>
          <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{job.department || 'No department'} - Created {new Date(job.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Dna size={40} color="#E91E63" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Generate Job DNA</h2>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>Analyze the job description to extract skills, experience requirements, behavioral traits, and communication patterns.</p>
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.875rem' }}>{error}</div>}
          <button className="btn btn-primary" onClick={handleGenerateDNA} disabled={generating}>
            {generating ? <><Loader size={18} /> Generating DNA...</> : <><Dna size={18} /> Generate Job DNA</>}
          </button>
        </div>
        <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><FileText size={16} color="#6366F1" /><span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Job Description</span></div>
          <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{job.description || 'No description provided'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Dna size={20} color="#E91E63" />
              <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '0.75rem' }}>Job DNA</span>
              <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 500, background: job.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: job.status === 'active' ? '#059669' : '#D97706' }}>{job.status}</span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.25rem' }}>{job.title}</h1>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{job.department || 'No department'} - Last updated {new Date(job.updatedAt).toLocaleDateString()}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={14} color="#F59E0B" />
              <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 500 }}>Human Review Required</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={16} color="#6366F1" />
          <div style={{ flex: 1 }}><p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#1F2937' }}>AI-Generated Job DNA</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} color="#6B7280" /><span style={{ fontSize: '0.625rem', color: '#6B7280' }}>Created {new Date(job.createdAt).toLocaleDateString()}</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <DNASection title="Skill DNA" traits={jobDNA.skillDNA} color="#6366F1" />
          <DNASection title="Experience DNA" traits={jobDNA.experienceDNA} color="#10B981" />
          <DNASection title="Behavioral DNA" traits={jobDNA.behavioralDNA} color="#F59E0B" />
          <DNASection title="Communication DNA" traits={jobDNA.communicationDNA} color="#3B82F6" />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Dna size={16} color="#E91E63" /><span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Cultural DNA</span><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>(Optional)</span></div>
            <button type="button" onClick={() => setCulturalDNAEnabled(!culturalDNAEnabled)} style={{ width: '44px', height: '24px', background: culturalDNAEnabled ? '#E91E63' : '#E5E7EB', borderRadius: '12px', position: 'relative', transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: culturalDNAEnabled ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          {culturalDNAEnabled && jobDNA.culturalDNA.length > 0 && <div style={{ marginTop: '0.75rem' }}><DNASection title="Cultural DNA" traits={jobDNA.culturalDNA} color="#E91E63" /></div>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>DNA Quality</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>{totalTraits}</span></div>
            <div><p style={{ fontWeight: 600, color: '#1F2937' }}>Total Traits</p><p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Across all dimensions</p></div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', borderRadius: '9999px' }}>Skills: {jobDNA.skillDNA.length}</span>
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '9999px' }}>Experience: {jobDNA.experienceDNA.length}</span>
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderRadius: '9999px' }}>Behavioral: {jobDNA.behavioralDNA.length}</span>
            <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', borderRadius: '9999px' }}>Communication: {jobDNA.communicationDNA.length}</span>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleApprove} style={{ width: '100%', marginBottom: '0.5rem' }}><Shield size={14} /> Approve and Train AI</button>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '0.5rem' }}><Save size={14} /> Save Draft</button>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>Edit Later</button>
        </div>
        <div style={{ padding: '0.75rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '0.625rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={10} />AI training blocked until Job DNA is approved</p>
        </div>
      </div>
    </div>
  );
}

function DNASection({ title, traits, color }: { title: string; traits: DNATrait[]; color: string }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><Dna size={14} color={color} /><span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>{title}</span><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>({traits.length})</span></div>
      {traits.length === 0 ? <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>No traits defined</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {traits.slice(0, 5).map((trait, i) => (
            <div key={trait.id || i} style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '0.375rem', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1F2937' }}>{trait.name}</span>
                <span style={{ fontSize: '0.5625rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', background: trait.importance === 'critical' ? 'rgba(239, 68, 68, 0.1)' : trait.importance === 'high' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: trait.importance === 'critical' ? '#DC2626' : trait.importance === 'high' ? '#D97706' : '#6B7280', fontWeight: 500, textTransform: 'capitalize' }}>{trait.importance}</span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#6B7280' }}>{trait.description}</p>
            </div>
          ))}
          {traits.length > 5 && <p style={{ fontSize: '0.75rem', color: '#6366F1', cursor: 'pointer' }}>+{traits.length - 5} more traits</p>}
        </div>
      )}
    </div>
  );
}
