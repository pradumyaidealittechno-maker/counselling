import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dna, Edit3, Trash2, Plus, Video, Mic, CheckCircle, GripVertical,
  Info, ChevronDown, ChevronUp, Target, Loader
} from 'lucide-react';
import api from '../services/api';
import { confirmToast } from '../utils/toast';

interface InterviewQuestion {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'situational' | 'communication';
  estimatedDuration: number;
  dnaMapping: {
    dimension: string;
    trait: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    signalsToEvaluate: string[];
  }[];
  evaluationCriteria: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
  followUpQuestions?: string[];
}

interface Job {
  _id: string;
  title: string;
  interviewQuestions?: InterviewQuestion[];
  jobDNA?: any;
}

export default function InterviewBuilder() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      if (jobId) {
        const data = await api.jobs.getById(jobId);
        setJob(data);
      }
    } catch (err: any) {
      console.error('Failed to load job:', err);
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!job?._id) return;

    try {
      setGenerating(true);
      const result = await api.jobs.generateQuestions(job._id, {
        count: questionCount,
        customPrompt: customPrompt
      });
      setJob(prev => prev ? { ...prev, interviewQuestions: result.questions } : null);
    } catch (err: any) {
      console.error('Failed to generate questions:', err);
      setError(err.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!job?._id) return;

    try {
      await api.jobs.deleteQuestion(job._id, questionId);
      setJob(prev => prev ? {
        ...prev,
        interviewQuestions: prev.interviewQuestions?.filter(q => q.id !== questionId)
      } : null);
    } catch (err: any) {
      console.error('Failed to delete question:', err);
      setError(err.message || 'Failed to delete question');
    }
  };

  const handleEditQuestion = (question: InterviewQuestion) => {
    setEditingQuestionId(question.id);
  };

  const handleSaveQuestion = async (updatedQuestion: InterviewQuestion) => {
    if (!job?._id) return;
    try {
      if (updatedQuestion.id.startsWith('temp-')) {
        // Create new
        const { id, ...newQuestionData } = updatedQuestion;
        const savedQuestion = await api.jobs.addQuestion(job._id, newQuestionData);
        setJob(prev => prev ? {
          ...prev,
          interviewQuestions: prev.interviewQuestions?.map(q => q.id === updatedQuestion.id ? savedQuestion : q)
        } : null);
      } else {
        // Update existing
        await api.jobs.updateQuestion(job._id, updatedQuestion.id, updatedQuestion);
        setJob(prev => prev ? {
          ...prev,
          interviewQuestions: prev.interviewQuestions?.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
        } : null);
      }
      setEditingQuestionId(null);
    } catch (err: any) {
      console.error('Failed to save question:', err);
      setError(err.message || 'Failed to save question');
    }
  };

  const handleAddQuestion = (category: string) => {
    const tempId = `temp-${Date.now()}`;
    const newQuestion: InterviewQuestion = {
      id: tempId,
      text: '',
      category: category as any,
      estimatedDuration: 5,
      dnaMapping: [],
      evaluationCriteria: { excellent: '', good: '', average: '', poor: '' }
    };
    setJob(prev => prev ? {
      ...prev,
      interviewQuestions: [...(prev.interviewQuestions || []), newQuestion]
    } : null);
    setEditingQuestionId(tempId);
    setExpandedQuestion(tempId);
  };

  const handleCancelEdit = (questionId: string) => {
    setEditingQuestionId(null);
    if (questionId.startsWith('temp-')) {
      setJob(prev => prev ? {
        ...prev,
        interviewQuestions: prev.interviewQuestions?.filter(q => q.id !== questionId)
      } : null);
    }
  };

  const handleFinalizeInterview = async () => {
    if (!job?._id) return;

    try {
      setSyncing(true);
      // Sync questions to n8n
      await api.jobs.syncQuestions(job._id);

      // Navigate to candidates page
      navigate(`/dashboard/candidates?jobId=${jobId}`);
    } catch (err: any) {
      console.error('Failed to sync to n8n:', err);
      // Even if sync fails, we might want to let them proceed, but warning is better
      const errorMessage = err.message || 'Failed to sync to n8n';
      setError(errorMessage);

      // Optional: Confirm with user if they want to proceed despite error
      const confirmed = await confirmToast(`Failed to sync questions to n8n: ${errorMessage}. Proceed anyway?`);
      if (confirmed) {
        navigate(`/dashboard/candidates?jobId=${jobId}`);
      }
    } finally {
      setSyncing(false);
    }
  };



  const questions = job?.interviewQuestions || [];

  const getDNACoverage = () => {
    const coverage = { skill: 0, experience: 0, behavioral: 0, communication: 0, cultural: 0, total: 0 };
    questions.forEach(q => {
      q.dnaMapping?.forEach(m => {
        if (m.dimension.toLowerCase().includes('skill')) coverage.skill++;
        else if (m.dimension.toLowerCase().includes('experience')) coverage.experience++;
        else if (m.dimension.toLowerCase().includes('behavioral')) coverage.behavioral++;
        else if (m.dimension.toLowerCase().includes('communication')) coverage.communication++;
        else if (m.dimension.toLowerCase().includes('cultural')) coverage.cultural++;
        coverage.total++;
      });
    });
    return coverage;
  };

  const coverage = getDNACoverage();

  const questionsByCategory = {
    technical: questions.filter(q => q.category === 'technical'),
    behavioral: questions.filter(q => q.category === 'behavioral'),
    situational: questions.filter(q => q.category === 'situational'),
    communication: questions.filter(q => q.category === 'communication')
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading interview builder...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <Dna size={48} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Job Selected</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Select a job to build interview questions</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/jobs/create')}>
          <Plus size={18} /> Create New Job
        </button>
      </div>
    );
  }

  // No questions yet - show generate option
  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Dna size={20} color="#E91E63" />
            <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '0.875rem' }}>Job DNA™ Powered</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Interview Question Builder
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Generate questions for {job.title}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
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
            <Dna size={40} color="#E91E63" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Generate Interview Questions
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {job.jobDNA
              ? 'Use Job DNA™ to generate tailored interview questions that evaluate candidates against your specific requirements.'
              : 'Generate Job DNA first to create tailored interview questions.'}
          </p>

          {job.jobDNA && (
            <div style={{ maxWidth: '400px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 8)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Focus heavily on React proficiency..."
                  className="input"
                  style={{ width: '100%', minHeight: '80px' }}
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#DC2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {job.jobDNA ? (
            <button
              className="btn btn-primary"
              onClick={handleGenerateQuestions}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Dna size={18} /> Generate Questions from DNA
                </>
              )}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/dashboard/jobs/${job._id}/job-dna`)}
            >
              <Dna size={18} /> Generate Job DNA First
            </button>
          )}
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '0 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Dna size={20} color="#E91E63" />
          <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '0.875rem' }}>Job DNA™ Powered</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Interview Question Builder
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Questions generated from Job DNA™ for {job.title}
        </p>
      </div>

      {/* DNA Coverage & Settings Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* DNA Coverage */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Target size={16} color="#E91E63" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>DNA Coverage</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#6366F1'
            }}>
              Skill: {coverage.skill} traits
            </span>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981'
            }}>
              Experience: {coverage.experience} traits
            </span>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B'
            }}>
              Behavioral: {coverage.behavioral} traits
            </span>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.625rem',
              fontWeight: 500,
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6'
            }}>
              Communication: {coverage.communication} traits
            </span>
          </div>
          <p style={{ fontSize: '0.625rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            {coverage.total} total DNA traits evaluated across {questions.length} questions
          </p>
        </div>

        {/* Interview Settings */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>Interview Settings</h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div style={{
                width: '44px',
                height: '24px',
                background: videoEnabled ? '#E91E63' : '#E5E7EB',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background 0.2s'
              }} onClick={() => setVideoEnabled(!videoEnabled)}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'var(--white)',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: videoEnabled ? '22px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
              <Video size={18} color={videoEnabled ? '#E91E63' : '#9CA3AF'} />
              <span style={{ color: videoEnabled ? '#374151' : '#9CA3AF', fontSize: '0.875rem' }}>Video</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div style={{
                width: '44px',
                height: '24px',
                background: voiceEnabled ? '#E91E63' : '#E5E7EB',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background 0.2s'
              }} onClick={() => setVoiceEnabled(!voiceEnabled)}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'var(--white)',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: voiceEnabled ? '22px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
              <Mic size={18} color={voiceEnabled ? '#E91E63' : '#9CA3AF'} />
              <span style={{ color: voiceEnabled ? '#374151' : '#9CA3AF', fontSize: '0.875rem' }}>Voice</span>
            </label>
          </div>
        </div>
      </div>

      {/* DNA Linkage Info */}
      <div style={{
        background: 'rgba(233, 30, 99, 0.05)',
        border: '1px solid rgba(233, 30, 99, 0.15)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <Info size={18} color="#E91E63" />
        <p style={{ fontSize: '0.8125rem', color: '#831843' }}>
          Each question is linked to specific Job DNA™ traits with signals to evaluate.
          This ensures consistent, fair evaluation across all candidates.
        </p>
      </div>

      {/* Question Categories */}
      {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
        categoryQuestions.length > 0 && (
          <div key={category} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.9375rem' }}>
                {category} Questions
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 400 }}>
                  ({categoryQuestions.length})
                </span>
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleAddQuestion(category)}
              >
                <Plus size={14} /> Add Question
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categoryQuestions.map((q, i) => (
                <QuestionCard
                  key={q.id || i}
                  question={q}
                  index={i}
                  isExpanded={expandedQuestion === (q.id || `${category}-${i}`)}
                  onToggle={() => setExpandedQuestion(expandedQuestion === (q.id || `${category}-${i}`) ? null : (q.id || `${category}-${i}`))}
                  onEdit={() => handleEditQuestion(q)}
                  onDelete={() => handleDeleteQuestion(q.id)}
                  isEditing={editingQuestionId === q.id}
                  onSave={handleSaveQuestion}
                  onCancel={() => handleCancelEdit(q.id)}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>

        <button
          className="btn btn-primary"
          onClick={handleFinalizeInterview}
          disabled={syncing}
          style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
        >
          {syncing ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Finalizing...
            </>
          ) : (
            <>
              <CheckCircle size={18} /> Finalize Interview
            </>
          )}
        </button>
        <button className="btn btn-ghost">Save as Draft</button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  isEditing,
  onSave,
  onCancel
}: {
  question: InterviewQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  onSave: (q: InterviewQuestion) => void;
  onCancel: () => void;
}) {
  const primaryMapping = question.dnaMapping?.[0];
  const [editedText, setEditedText] = useState(question.text);

  useEffect(() => {
    setEditedText(question.text);
  }, [question.text]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave({ ...question, text: editedText });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div style={{
      background: '#F9FAFB',
      borderRadius: '0.75rem',
      border: '1px solid #E5E7EB',
      overflow: 'hidden'
    }}>
      {/* Question Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem',
        cursor: 'pointer'
      }} onClick={!isEditing ? onToggle : undefined}>
        <GripVertical size={16} color="#9CA3AF" style={{ cursor: 'grab', marginTop: '2px' }} />
        <span style={{
          width: '24px',
          height: '24px',
          background: '#E91E63',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          flexShrink: 0
        }}>{index + 1}</span>

        <div style={{ flex: 1 }}>
          {isEditing ? (
            <div onClick={e => e.stopPropagation()}>
              <textarea
                className="input"
                style={{
                  width: '100%',
                  minHeight: '80px',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  padding: '0.75rem'
                }}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Enter question text..."
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--gray-800)' }}>{question.text}</p>

              {/* DNA Mapping Preview */}
              {question.dnaMapping && question.dnaMapping.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <Dna size={12} color="#E91E63" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Evaluates:</span>
                  {question.dnaMapping.slice(0, 2).map((mapping, i) => (
                    <span key={i} style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--gray-700)',
                      padding: '0.125rem 0.375rem',
                      background: 'var(--white)',
                      borderRadius: '0.25rem',
                      border: '1px solid #E5E7EB'
                    }}>
                      {mapping.trait}
                    </span>
                  ))}
                  {question.dnaMapping.length > 2 && (
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      +{question.dnaMapping.length - 2} more
                    </span>
                  )}
                  {primaryMapping && (
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '9999px',
                      background: primaryMapping.importance === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                        primaryMapping.importance === 'high' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: primaryMapping.importance === 'critical' ? '#DC2626' :
                        primaryMapping.importance === 'high' ? '#D97706' : '#6B7280',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}>
                      {primaryMapping.importance}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              title="Edit question"
            >
              <Edit3 size={14} color="#6B7280" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              title="Delete question"
            >
              <Trash2 size={14} color="#EF4444" />
            </button>
            {isExpanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && !isEditing && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #E5E7EB',
          background: 'var(--white)'
        }}>
          {/* DNA Mappings */}
          {question.dnaMapping && question.dnaMapping.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
                DNA Trait Mappings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {question.dnaMapping.map((mapping, i) => (
                  <div key={i} style={{
                    padding: '0.75rem',
                    background: '#F9FAFB',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', background: 'rgba(233, 30, 99, 0.1)', color: '#E91E63', borderRadius: '0.25rem' }}>
                          {mapping.dimension}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--gray-800)' }}>{mapping.trait}</span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '9999px',
                        background: mapping.importance === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                          mapping.importance === 'high' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: mapping.importance === 'critical' ? '#DC2626' :
                          mapping.importance === 'high' ? '#D97706' : '#6B7280',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {mapping.importance}
                      </span>
                    </div>

                    {mapping.signalsToEvaluate && mapping.signalsToEvaluate.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                          Signals to Evaluate:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {mapping.signalsToEvaluate.map((signal, j) => (
                            <span key={j} style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              background: 'rgba(233, 30, 99, 0.1)',
                              color: '#BE185D',
                              borderRadius: '9999px'
                            }}>
                              {signal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Criteria */}
          {question.evaluationCriteria && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
                Evaluation Criteria
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {Object.entries(question.evaluationCriteria).map(([level, criteria]) => {
                  const colors: Record<string, { bg: string; border: string; text: string }> = {
                    excellent: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#065F46' },
                    good: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#1E40AF' },
                    average: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#92400E' },
                    poor: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#991B1B' }
                  };
                  const color = colors[level] || colors.average;
                  return (
                    <div key={level} style={{
                      padding: '0.5rem',
                      background: color.bg,
                      border: `1px solid ${color.border}`,
                      borderRadius: '0.375rem'
                    }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: color.text, textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                        {level}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: color.text }}>{criteria}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {question.followUpQuestions && question.followUpQuestions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
                Follow-up Questions
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {question.followUpQuestions.map((fq, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>{fq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
