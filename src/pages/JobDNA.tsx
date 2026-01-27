import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Dna, AlertTriangle, Save, Shield, FileText, Clock, Loader, Plus, Sparkles } from 'lucide-react';
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
  const [editingTrait, setEditingTrait] = useState<string | null>(null);
  const [editedTraits, setEditedTraits] = useState<Record<string, DNATrait>>({});

  // Confirmation Request State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    dimension: string;
    traitId: string;
    newValue: ImportanceLevel;
    traitName: string;
  } | null>(null);

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

  const handleApprove = async () => {
    if (!job?._id) return;
    try {
      setLoading(true);

      const updatedJobDNA = getUpdatedJobDNA();
      console.log('🚀 Approving with DNA Payload:', updatedJobDNA);

      await api.jobs.update(job._id, {
        status: 'active',
        jobDNA: updatedJobDNA || undefined
      });

      // Also regenerate questions on approval for freshness
      try {
        await api.jobs.generateQuestions(job._id, { count: 5 });
      } catch (e) { console.warn('Silent question gen fail', e); }

      navigate(`/dashboard/jobs/${job._id}/ai-training`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve job';
      console.error('Failed to approve job:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  /* Shared helper to merge edits into jobDNA */
  const getUpdatedJobDNA = (additionalTraits: Record<string, DNATrait> = {}) => {
    if (!job?.jobDNA) return null;

    // Deep clone to safely mutate
    const updatedJobDNA = JSON.parse(JSON.stringify(job.jobDNA));

    // Combine current state with any immediate updates (for auto-save)
    const traitsToMerge = { ...editedTraits, ...additionalTraits };

    Object.entries(traitsToMerge).forEach(([key, trait]) => {
      // Key format: `${dimension}-${traitId}`
      const firstDashIndex = key.indexOf('-');
      if (firstDashIndex === -1) return;

      const dimension = key.substring(0, firstDashIndex);
      const traitId = key.substring(firstDashIndex + 1);

      const dimensionKey = dimension as keyof typeof updatedJobDNA;
      if (updatedJobDNA[dimensionKey]) {
        const index = updatedJobDNA[dimensionKey].findIndex((t: DNATrait) => t.id === traitId);
        if (index !== -1) {
          updatedJobDNA[dimensionKey][index] = trait;
        }
      }
    });

    return updatedJobDNA;
  };

  const handleUpdateTrait = (dimension: string, traitId: string, field: keyof DNATrait, value: string) => {
    setEditedTraits(prev => {
      const key = `${dimension}-${traitId}`;
      const originalTrait = job?.jobDNA?.[dimension as keyof typeof job.jobDNA]?.find((t: DNATrait) => t.id === traitId);
      const currentState = prev[key] || originalTrait;

      if (!currentState) {
        return prev;
      }

      return {
        ...prev,
        [key]: { ...currentState, [field]: value }
      };
    });
  };

  const initiateImportanceChange = (dimension: string, traitId: string, newValue: ImportanceLevel, traitName: string) => {
    setPendingChange({
      dimension,
      traitId,
      newValue,
      traitName
    });
    setShowConfirmDialog(true);
  };

  const confirmImportanceChange = async () => {
    if (!pendingChange || !job?.jobDNA) return;

    const { dimension, traitId, newValue } = pendingChange;
    const key = `${dimension}-${traitId}`;

    // Find original trait to verify persistence
    const originalTrait = job.jobDNA[dimension as keyof typeof job.jobDNA]?.find((t: DNATrait) => t.id === traitId);
    if (!originalTrait) return;

    // Construct the new trait object
    const previousState = editedTraits[key] || originalTrait;
    const newTrait = { ...previousState, importance: newValue };

    // 1. Optimistic UI Update
    setEditedTraits(prev => ({
      ...prev,
      [key]: newTrait
    }));
    setShowConfirmDialog(false);
    setPendingChange(null);

    // 2. Auto-Save to Backend immediately
    try {
      setLoading(true);

      // We pass the newTrait specifically because state 'editedTraits' might not be updated yet in this closure
      const updatedJobDNA = getUpdatedJobDNA({ [key]: newTrait });
      console.log('💾 Auto-saving importance change:', updatedJobDNA);

      await api.jobs.update(job._id!, {
        status: job.status, // Keep existing status
        jobDNA: updatedJobDNA || undefined
      });

      // 3. Regenerate questions silently
      try {
        api.jobs.generateQuestions(job._id!, { count: 5 });
      } catch (e) {
        console.warn('Silent question regen failed', e);
      }

      // 4. Reload to sync
      await loadJob();
      // Note: We don't clear editedTraits here to prevent UI jumps, 
      // but since loadJob updates 'job', the 'originalTrait' will now match 'newTrait' eventually.

    } catch (err: unknown) {
      console.error('Failed to auto-save importance:', err);
      // Revert UI on failure? 
      const errorMessage = err instanceof Error ? err.message : 'Failed to save change';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!job?._id) return;
    try {
      setLoading(true);

      const updatedJobDNA = getUpdatedJobDNA();
      console.log('📝 Saving Draft with DNA Payload:', updatedJobDNA);

      await api.jobs.update(job._id, {
        status: 'draft',
        jobDNA: updatedJobDNA || undefined
      });

      try {
        await api.jobs.generateQuestions(job._id, { count: 5 });
      } catch (genErr) {
        console.warn('Auto-generation of questions failed', genErr);
      }

      await loadJob();
      setEditedTraits({});

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      console.error('Failed to save draft:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleEditLater = () => {
    navigate('/dashboard/jobs');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" className="animate-spin" />
        <p style={{ marginTop: '1.2rem', color: 'var(--gray-500)' }}>Loading Job DNA...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Dna size={40} color="#E91E63" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gray-900)' }}>No Job Selected</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Create a new job or select an existing one to view and manage its Job DNA</p>
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
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(233, 30, 99, 0.05)',
            borderRadius: '9999px',
            border: '1px solid rgba(233, 30, 99, 0.1)'
          }}>
            <Dna size={16} color="#E91E63" />
            <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.5px' }}>JOB DNA CONFIGURATION</span>
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--gray-900)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.5px'
          }}>
            {job.title}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto' }}>
            {job.department || 'General'} • Created on {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Generator Card */}
        <div className="card" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background element */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 50%, #E91E63 100%)'
          }} />

          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Sparkles size={40} color="#E91E63" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-900)' }}>
            Generate AI Job DNA
          </h2>

          <p style={{
            color: 'var(--gray-600)',
            fontSize: '1rem',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            Our AI will analyze the job description to extract key skills, required experience, behavioral traits, and communication patterns to create the perfect candidate profile.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#DC2626',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerateDNA}
            disabled={generating}
            style={{
              minWidth: '240px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.2)'
            }}
          >
            {generating ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing Description...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Job DNA
              </>
            )}
          </button>
        </div>

        {/* Job Description Preview */}
        <div style={{ opacity: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
            <FileText size={18} color="#6B7280" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Source Job Description</span>
          </div>

          <div className="card" style={{
            padding: '2rem',
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            boxShadow: 'none'
          }}>
            <div style={{
              fontSize: '0.95rem',
              color: 'var(--gray-700)',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit'
            }}>
              {job.description || 'No description provided'}
            </div>
          </div>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{job.title}</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-500)' }}>{job.department || 'No department'} - Last updated {new Date(job.updatedAt).toLocaleDateString()}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#F59E0B" />
              <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 500 }}>Human Review Required</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={16} color="#6366F1" />
          <div style={{ flex: 1 }}><p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--gray-900)' }}>AI-Generated Job DNA</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} color="var(--gray-400)" /><span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Created {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <DNASection title="Skill DNA" dimension="skillDNA" traits={jobDNA.skillDNA} color="#6366F1" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onImportanceChange={initiateImportanceChange} editedTraits={editedTraits} />
          <DNASection title="Experience DNA" dimension="experienceDNA" traits={jobDNA.experienceDNA} color="#10B981" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onImportanceChange={initiateImportanceChange} editedTraits={editedTraits} />
          <DNASection title="Behavioral DNA" dimension="behavioralDNA" traits={jobDNA.behavioralDNA} color="#F59E0B" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onImportanceChange={initiateImportanceChange} editedTraits={editedTraits} />
          <DNASection title="Communication DNA" dimension="communicationDNA" traits={jobDNA.communicationDNA} color="#3B82F6" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onImportanceChange={initiateImportanceChange} editedTraits={editedTraits} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Dna size={16} color="#E91E63" /><span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--gray-900)' }}>Cultural DNA</span><span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>(Optional)</span></div>
            <button type="button" onClick={() => setCulturalDNAEnabled(!culturalDNAEnabled)} style={{ width: '44px', height: '24px', background: culturalDNAEnabled ? '#E91E63' : 'var(--gray-200)', borderRadius: '12px', position: 'relative', transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', background: 'var(--white)', borderRadius: '50%', position: 'absolute', top: '2px', left: culturalDNAEnabled ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          {culturalDNAEnabled && jobDNA.culturalDNA.length > 0 && <div style={{ marginTop: '0.75rem' }}><DNASection title="Cultural DNA" dimension="culturalDNA" traits={jobDNA.culturalDNA} color="#E91E63" editingTrait={editingTrait} setEditingTrait={setEditingTrait} onUpdate={handleUpdateTrait} onImportanceChange={initiateImportanceChange} editedTraits={editedTraits} /></div>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="card" style={{ padding: '1rem', background: 'var(--white)' }}>
          <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>DNA Quality</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontWeight: 700, fontSize: '1.0rem' }}>{totalTraits}</span></div>
            <div><p style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1rem' }}>Total Traits</p><p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Across all dimensions</p></div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', borderRadius: '9999px' }}>Skills: {jobDNA.skillDNA.length}</span>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '9999px' }}>Experience: {jobDNA.experienceDNA.length}</span>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderRadius: '9999px' }}>Behavioral: {jobDNA.behavioralDNA.length}</span>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', borderRadius: '9999px' }}>Communication: {jobDNA.communicationDNA.length}</span>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem', background: 'var(--white)' }}>
          <button className="btn btn-primary" onClick={handleApprove} style={{ width: '100%', marginBottom: '0.5rem' }}><Shield size={16} /> Approve and Train AI</button>
          <button className="btn btn-secondary" onClick={handleSaveDraft} style={{ width: '100%', marginBottom: '0.5rem' }}><Save size={16} /> Save Draft</button>
          <button className="btn btn-ghost" onClick={handleEditLater} style={{ width: '100%' }}>Edit Later</button>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={12} />AI training blocked until Job DNA is approved</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && pendingChange && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
              Confirm Importance Change
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to change the importance of <strong>{pendingChange.traitName}</strong> to <strong style={{ textTransform: 'capitalize' }}>{pendingChange.newValue}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => { setShowConfirmDialog(false); setPendingChange(null); }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmImportanceChange}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background: '#E91E63',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DNASection({ title, dimension, traits, color, editingTrait, setEditingTrait, onUpdate, onImportanceChange, editedTraits }: {
  title: string;
  dimension: string;
  traits: DNATrait[];
  color: string;
  editingTrait: string | null;
  setEditingTrait: (id: string | null) => void;
  onUpdate: (dimension: string, traitId: string, field: keyof DNATrait, value: string) => void;
  onImportanceChange: (dimension: string, traitId: string, newValue: ImportanceLevel, traitName: string) => void;
  editedTraits: Record<string, DNATrait>;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayTraits = expanded ? traits : traits.slice(0, 5);
  const remainingCount = traits.length - 5;

  const getTrait = (trait: DNATrait) => {
    const key = `${dimension}-${trait.id}`;
    return editedTraits[key] || trait;
  };

  return (
    <div className="card" style={{ padding: '1rem', background: 'var(--white)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Dna size={16} color={color} />
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--gray-900)' }}>{title}</span>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>({traits.length})</span>
      </div>
      {traits.length === 0 ? <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>No traits defined</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {displayTraits.map((trait, i) => {
            const currentTrait = getTrait(trait);
            const isEditing = editingTrait === `${dimension}-${trait.id}`;

            return (
              <div
                key={trait.id || i}
                style={{
                  padding: '0.75rem',
                  background: isEditing ? 'rgba(245, 158, 11, 0.05)' : 'var(--gray-50)',
                  borderRadius: '0.5rem',
                  border: isEditing ? '2px solid #F59E0B' : '1px solid var(--gray-200)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => !isEditing && setEditingTrait(`${dimension}-${trait.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentTrait.name}
                      onChange={(e) => onUpdate(dimension, trait.id, 'name', e.target.value)}
                      onBlur={() => setEditingTrait(null)}
                      autoFocus
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: 'var(--gray-900)',
                        background: 'var(--white)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        flex: 1,
                        marginRight: '0.5rem'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>{currentTrait.name}</span>
                  )}
                  <select
                    value={currentTrait.importance}
                    onChange={(e) => {
                      e.stopPropagation();
                      onImportanceChange(dimension, trait.id, e.target.value as ImportanceLevel, currentTrait.name);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      background: currentTrait.importance === 'critical' ? 'rgba(239, 68, 68, 0.1)' : currentTrait.importance === 'high' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: currentTrait.importance === 'critical' ? '#DC2626' : currentTrait.importance === 'high' ? '#D97706' : '#6B7280',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                {isEditing ? (
                  <textarea
                    value={currentTrait.description}
                    onChange={(e) => onUpdate(dimension, trait.id, 'description', e.target.value)}
                    onBlur={() => setEditingTrait(null)}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--gray-500)',
                      background: 'var(--white)',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      width: '100%',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <p style={{ fontSize: '1rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{currentTrait.description}</p>
                )}
              </div>
            );
          })}
          {traits.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                fontSize: '0.875rem',
                color: '#6366F1',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                textAlign: 'left',
                width: 'fit-content',
                fontWeight: 500
              }}
            >
              {expanded ? 'Show less' : `+${remainingCount} more traits`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
