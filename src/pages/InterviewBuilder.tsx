import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dna, Edit3, Trash2, Plus, Video, Mic, CheckCircle, GripVertical,
  Info, ChevronDown, ChevronUp, Target, Loader, ChevronLeft, ChevronRight,
  X, Briefcase, Users, Brain, Bot, Cpu
} from 'lucide-react';
import api from '../services/api';
import { confirmToast, showToast } from '../utils/toast';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Pagination & Finalize Input State
  const [currentPage, setCurrentPage] = useState(1);
  const [askQuestionCount, setAskQuestionCount] = useState<string>('');
  const itemsPerPage = 5;

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      if (jobId) {
        const data = await api.jobs.getById(jobId);
        // Normalize IDs: Ensure every question has a consistent 'id' property
        if (data.interviewQuestions) {
          data.interviewQuestions = data.interviewQuestions.map((q: any) => {
            const normalizedId = q.id || q._id?.toString();
            return {
              ...q,
              id: normalizedId
            };
          });
        }
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
      // Normalize IDs for generated questions
      const normalizedQuestions = (result.questions || []).map((q: any) => ({
        ...q,
        id: q.id || q._id
      }));
      setJob(prev => prev ? { ...prev, interviewQuestions: normalizedQuestions } : null);
    } catch (err: any) {
      console.error('Failed to generate questions:', err);
      setError(err.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  // const handleRegenerateQuestions = async () => {
  //   if (!job?._id) return;

  //   const confirmed = await confirmToast(
  //     'Are you sure you want to regenerate all questions? This will permanently delete existing questions and generate new ones based on the Job DNA.'
  //   );

  //   if (!confirmed) return;

  //   handleGenerateQuestions();
  // };

  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!job?._id || !questionToDelete) return;

    console.log('🗑️ Attempting to delete question:', questionToDelete);

    try {
      // If it's a temp ID, just remove it from the local state
      if (questionToDelete.startsWith('temp-')) {
        console.log('📝 Removing unsaved temp question');
        setJob(prev => {
          if (!prev) return null;
          return {
            ...prev,
            interviewQuestions: prev.interviewQuestions?.filter(q => q.id !== questionToDelete)
          };
        });
        showToast.success('Question removed');
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
        return;
      }

      // Otherwise, call the API for persistent questions
      await api.jobs.deleteQuestion(job._id, questionToDelete);
      console.log('✅ Backend deletion successful');

      setJob(prev => {
        if (!prev) return null;
        const updatedQuestions = (prev.interviewQuestions || []).filter(
          q => q.id !== questionToDelete && (q as any)._id !== questionToDelete
        );
        return { ...prev, interviewQuestions: updatedQuestions };
      });

      showToast.success('Question deleted successfully');
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    } catch (err: any) {
      console.error('❌ Failed to delete question:', err);
      showToast.error(err.message || 'Failed to delete question');
      setError(err.message || 'Failed to delete question');
    }
  };

  const handleEditQuestion = (question: InterviewQuestion) => {
    setEditingQuestionId(question.id || (question as any)._id);
  };

  const handleSaveQuestion = async (updatedQuestion: InterviewQuestion) => {
    if (!job?._id) return;

    if (!updatedQuestion.text || !updatedQuestion.text.trim()) {
      showToast.error('Question text cannot be empty');
      return;
    }

    try {
      if (updatedQuestion.id.startsWith('temp-')) {
        // Create new
        const { id, ...newQuestionData } = updatedQuestion;
        const response = await api.jobs.addQuestion(job._id, newQuestionData);
        // Backend returns { question: { ... } }, extract it
        const savedQuestion = response.question || response;
        const normalizedSaved = { ...savedQuestion, id: savedQuestion.id || savedQuestion._id };
        setJob(prev => prev ? {
          ...prev,
          interviewQuestions: prev.interviewQuestions?.map(q => q.id === updatedQuestion.id ? normalizedSaved : q)
        } : null);
      } else {
        // Update existing
        const response = await api.jobs.updateQuestion(job._id, updatedQuestion.id, updatedQuestion);
        // Backend returns { question: { ... } }, extract it
        const savedQuestion = response.question || response;
        const normalizedSaved = { ...savedQuestion, id: savedQuestion.id || savedQuestion._id };
        setJob(prev => prev ? {
          ...prev,
          interviewQuestions: prev.interviewQuestions?.map(q => q.id === updatedQuestion.id ? normalizedSaved : q)
        } : null);
      }
      setEditingQuestionId(null);
    } catch (err: any) {
      console.error('Failed to save question:', err);
      setError(err.message || 'Failed to save question');
    }
  };

  const handleAddQuestion = (category: string) => {
    if (editingQuestionId) {
      showToast.error('Please save or cancel the current question before adding a new one');
      return;
    }

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
      await api.jobs.syncQuestions(job._id, parseInt(askQuestionCount));

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

  // Sort questions by category order: Technical -> Behavioral -> Situational -> Communication
  const categoryOrder: Record<string, number> = {
    technical: 1,
    behavioral: 2,
    situational: 3,
    communication: 4
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
  });

  // Pagination Logic using sorted questions
  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const paginatedQuestions = sortedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    technical: paginatedQuestions.filter(q => q.category === 'technical'),
    behavioral: paginatedQuestions.filter(q => q.category === 'behavioral'),
    situational: paginatedQuestions.filter(q => q.category === 'situational'),
    communication: paginatedQuestions.filter(q => q.category === 'communication')
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
      <div style={{ position: 'relative', width: '100%', minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Background Animation */}
        {/* Animated Background Blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(233,30,99,0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 0, animation: 'float-slow 20s infinite alternate', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0) 70%)', zIndex: 0, animation: 'float-slow 15s infinite alternate-reverse', filter: 'blur(40px)' }} />

        {/* Floating Nodes */}
        {/* Node 1: DNA (Left Top) */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', zIndex: 0, animation: 'swap-med 25s ease-in-out infinite' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(233, 30, 99, 0.1)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 6s ease-in-out infinite' }}>
            <div style={{ background: 'rgba(233, 30, 99, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Dna size={24} color="#E91E63" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Analyzing</div>
              <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>Job DNA</div>
            </div>
          </div>
        </div>

        {/* Node 2: Brain (Right Top) */}
        <div style={{ position: 'absolute', top: '15%', left: '80%', zIndex: 0, animation: 'swap-med 25s ease-in-out infinite', animationDelay: '-12.5s' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 8s ease-in-out infinite alternate' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Brain size={24} color="#6366F1" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Detecting</div>
              <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>Traits</div>
            </div>
          </div>
        </div>

        {/* Node 3: Users (Left Bottom) */}
        <div style={{ position: 'absolute', bottom: '15%', left: '15%', zIndex: 0, animation: 'swap-narrow 28s ease-in-out infinite' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 7s ease-in-out infinite reverse' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Users size={24} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Matching</div>
              <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>Candidates</div>
            </div>
          </div>
        </div>

        {/* Node 4: Briefcase (Right Bottom) */}
        <div style={{ position: 'absolute', bottom: '15%', left: '75%', zIndex: 0, animation: 'swap-narrow 28s ease-in-out infinite', animationDelay: '-14s' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 9s ease-in-out infinite alternate-reverse' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Briefcase size={24} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Context</div>
              <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>Role Fit</div>
            </div>
          </div>
        </div>

        {/* Node 5: AI Model (Left Middle) */}
        <div style={{ position: 'absolute', top: '48%', left: '5%', zIndex: 0, animation: 'swap-wide 30s ease-in-out infinite' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 8s ease-in-out infinite' }}>
            <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Cpu size={24} color="#7C3AED" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>AI Model</div>
              <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>Job Analyzing</div>
            </div>
          </div>
        </div>

        {/* Node 6: AI Agent (Right Middle) */}
        <div style={{ position: 'absolute', top: '48%', left: '85%', zIndex: 0, animation: 'swap-wide 30s ease-in-out infinite', animationDelay: '-15s' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 7s ease-in-out infinite reverse' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Bot size={24} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>AI Agent</div>
              <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>Working on questions</div>
            </div>
          </div>
        </div>

        <style>{`
             @keyframes float {
               0% { transform: translateY(0px) rotate(0deg); }
               50% { transform: translateY(-15px) rotate(2deg); }
               100% { transform: translateY(0px) rotate(0deg); }
             }
             @keyframes float-slow {
               0% { transform: translate(0, 0); }
               100% { transform: translate(30px, 30px); }
             }
             @keyframes swap-med {
                0% { left: 10%; }
                50% { left: 80%; }
                100% { left: 10%; }
             }
             @keyframes swap-narrow {
                0% { left: 15%; }
                50% { left: 75%; }
                100% { left: 15%; }
             }
             @keyframes swap-wide {
                0% { left: 5%; }
                50% { left: 85%; }
                100% { left: 5%; }
             }
           `}</style>

        <div style={{ maxWidth: '750px', width: '100%', position: 'relative', zIndex: 1, paddingTop: '2rem' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(233, 30, 99, 0.08)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(233, 30, 99, 0.1)' }}>
              <Dna size={16} color="#E91E63" />
              <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.01em' }}>Job DNA™ Powered</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', background: 'linear-gradient(135deg, #111827 0%, #4B5563 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Interview Question Builder
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>
              Generate precise questions for <span style={{ fontWeight: 600, color: '#374151' }}>{job.title}</span>
            </p>
          </div>

          <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 24px 48px -12px rgba(17, 24, 39, 0.1)', borderRadius: '1.5rem' }}>
            <div style={{
              width: '96px',
              height: '96px',
              background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)'
            }}>
              <Dna size={48} color="#E91E63" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1F2937' }}>
              Generate Interview Questions
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
              {job.jobDNA
                ? 'Use Job DNA™ to generate tailored interview questions that evaluate candidates against your specific requirements and competency model.'
                : 'Generate Job DNA first to create tailored interview questions.'}
            </p>

            {job.jobDNA && (
              <div style={{ maxWidth: '440px', margin: '0 auto 2.5rem', textAlign: 'left' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 8)}
                    className="input"
                    style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', background: 'white' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., Focus heavily on React proficiency..."
                    className="input"
                    style={{ width: '100%', minHeight: '100px', padding: '0.875rem', fontSize: '0.95rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', background: 'white' }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '2rem',
                color: '#B91C1C',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Info size={16} color="#B91C1C" /> {error}
              </div>
            )}

            {job.jobDNA ? (
              <button
                className="btn btn-primary"
                onClick={handleGenerateQuestions}
                disabled={generating}
                style={{ padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 600, borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)', transition: 'all 0.2s', width: '100%' }}
              >
                {generating ? (
                  <>
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Dna size={20} /> Generate Questions from DNA
                  </>
                )}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/dashboard/jobs/${job._id}/job-dna`)}
                style={{ padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 600, borderRadius: '0.75rem', width: '100%' }}
              >
                <Dna size={20} /> Generate Job DNA First
              </button>
            )}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }



  return (
    <>
      <div style={{ width: '100%', padding: '0 1rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
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

          {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={handleRegenerateQuestions}
            disabled={generating}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)' }}
          >
            {generating ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {generating ? 'Regenerating...' : 'Regenerate Questions from DNA'}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'right', maxWidth: '300px' }}>
            💡 Regenerate questions after updating Job DNA to ensure alignment
          </p>
        </div> */}
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
            <strong> Questions are automatically regenerated when you approve Job DNA changes.</strong> You can also manually regenerate them anytime using the button above.
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
                  disabled={!!editingQuestionId}
                  style={{ opacity: editingQuestionId ? 0.5 : 1, cursor: editingQuestionId ? 'not-allowed' : 'pointer' }}
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
                    onDelete={() => handleDeleteClick(q.id || (q as any)._id)}
                    isEditing={editingQuestionId === (q.id || (q as any)._id)}
                    onSave={handleSaveQuestion}
                    onCancel={() => handleCancelEdit(q.id || (q as any)._id)}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: 500 }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Finalize Input & Actions */}
        <div style={{ marginTop: '1.5rem', background: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--gray-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>Finalize Interview</h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                How many questions do you want to ask? <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max={questions.length}
                value={askQuestionCount}
                onChange={(e) => setAskQuestionCount(e.target.value)}
                className="input"
                placeholder={`Max: ${questions.length}`}
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                Enter the number of questions to be selected for the actual interview.
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                Estimated Duration
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  readOnly
                  value={askQuestionCount ? `${parseInt(askQuestionCount) * 2} minutes` : '0 minutes'}
                  className="input"
                  style={{ width: '100%', background: 'var(--gray-50)', color: 'var(--gray-600)' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                Total time allocated for the candidate to complete the interview.
              </p>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleFinalizeInterview}
              disabled={syncing || !askQuestionCount || parseInt(askQuestionCount) <= 0 || parseInt(askQuestionCount) > questions.length}
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && questionToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '400px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <button
              onClick={() => setDeleteModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-400)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#FEF2F2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#EF4444'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Delete Question?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuestion}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  backgroundColor: '#EF4444',
                  borderColor: '#EF4444'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [editedDnaMapping, setEditedDnaMapping] = useState(question.dnaMapping || []);
  const [editedEvaluationCriteria, setEditedEvaluationCriteria] = useState(question.evaluationCriteria || { excellent: '', good: '', average: '', poor: '' });
  const [editedFollowUpQuestions, setEditedFollowUpQuestions] = useState(question.followUpQuestions || []);

  useEffect(() => {
    setEditedText(question.text);
    setEditedDnaMapping(question.dnaMapping || []);
    setEditedEvaluationCriteria(question.evaluationCriteria || { excellent: '', good: '', average: '', poor: '' });
    setEditedFollowUpQuestions(question.followUpQuestions || []);
  }, [question]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave({
      ...question,
      text: editedText,
      // Ensure we pass the updated arrays/objects
      dnaMapping: editedDnaMapping,
      evaluationCriteria: editedEvaluationCriteria,
      followUpQuestions: editedFollowUpQuestions
    });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  const handleAddMapping = () => {
    setEditedDnaMapping([
      ...editedDnaMapping,
      {
        dimension: 'Behavioral', // Default
        trait: '',
        importance: 'medium',
        signalsToEvaluate: []
      }
    ]);
  };

  const handleRemoveMapping = (index: number) => {
    const newMappings = [...editedDnaMapping];
    newMappings.splice(index, 1);
    setEditedDnaMapping(newMappings);
  };

  const handleUpdateMapping = (index: number, field: keyof typeof editedDnaMapping[0], value: any) => {
    const newMappings = [...editedDnaMapping];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setEditedDnaMapping(newMappings);
  };

  const handleSignalsChange = (index: number, value: string) => {
    const signals = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleUpdateMapping(index, 'signalsToEvaluate', signals);
  };

  const handleAddFollowUp = () => {
    setEditedFollowUpQuestions([...editedFollowUpQuestions, '']);
  };

  const handleRemoveFollowUp = (index: number) => {
    const newQuestions = [...editedFollowUpQuestions];
    newQuestions.splice(index, 1);
    setEditedFollowUpQuestions(newQuestions);
  };

  const handleFollowUpChange = (index: number, value: string) => {
    const newQuestions = [...editedFollowUpQuestions];
    newQuestions[index] = value;
    setEditedFollowUpQuestions(newQuestions);
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
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Question Text</label>
              <textarea
                className="input"
                style={{
                  width: '100%',
                  minHeight: '80px',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  padding: '0.75rem'
                }}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Enter question text..."
                autoFocus
              />

              {/* Edit DNA Mappings Section */}
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>DNA Trait Mappings</label>
                  <button
                    type="button"
                    onClick={handleAddMapping}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
                  >
                    <Plus size={14} /> Add Trait
                  </button>
                </div>

                {editedDnaMapping.length === 0 && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>No DNA traits mapped. Add one to evaluate candidates effectively.</p>
                )}

                {editedDnaMapping.map((mapping, mIndex) => (
                  <div key={mIndex} style={{
                    marginBottom: '0.75rem',
                    padding: '0.75rem',
                    background: '#F9FAFB',
                    borderRadius: '0.375rem',
                    border: '1px solid #E5E7EB',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => handleRemoveMapping(mIndex)}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                      title="Remove mapping"
                    >
                      <X size={14} />
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.125rem' }}>Dimension</label>
                        <select
                          className="input"
                          style={{ width: '100%', padding: '0.25rem', fontSize: '0.875rem' }}
                          value={mapping.dimension}
                          onChange={(e) => handleUpdateMapping(mIndex, 'dimension', e.target.value)}
                        >
                          <option value="Skill">Skill</option>
                          <option value="Experience">Experience</option>
                          <option value="Behavioral">Behavioral</option>
                          <option value="Communication">Communication</option>
                          <option value="Cultural">Cultural</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.125rem' }}>Importance</label>
                        <select
                          className="input"
                          style={{ width: '100%', padding: '0.25rem', fontSize: '0.875rem' }}
                          value={mapping.importance}
                          onChange={(e) => handleUpdateMapping(mIndex, 'importance', e.target.value)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.125rem' }}>Trait Name</label>
                      <input
                        type="text"
                        className="input"
                        style={{ width: '100%', padding: '0.375rem', fontSize: '0.875rem' }}
                        value={mapping.trait}
                        onChange={(e) => handleUpdateMapping(mIndex, 'trait', e.target.value)}
                        placeholder="e.g. Problem Solving"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.125rem' }}>Signals to Evaluate (comma separated)</label>
                      <input
                        type="text"
                        className="input"
                        style={{ width: '100%', padding: '0.375rem', fontSize: '0.875rem' }}
                        value={mapping.signalsToEvaluate.join(', ')}
                        onChange={(e) => handleSignalsChange(mIndex, e.target.value)}
                        placeholder="e.g. clear communication, examples provided"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Evaluation Criteria */}
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Evaluation Criteria</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {['excellent', 'good', 'average', 'poor'].map((level) => (
                    <div key={level}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.125rem', textTransform: 'capitalize' }}>{level}</label>
                      <textarea
                        className="input"
                        style={{ width: '100%', padding: '0.375rem', fontSize: '0.75rem', minHeight: '60px' }}
                        value={(editedEvaluationCriteria as any)[level]}
                        onChange={(e) => setEditedEvaluationCriteria({ ...editedEvaluationCriteria, [level]: e.target.value })}
                        placeholder={`Criteria for ${level} response...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Follow-up Questions */}
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>Follow-up Questions</label>
                  <button
                    type="button"
                    onClick={handleAddFollowUp}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: 'auto' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {editedFollowUpQuestions.length === 0 && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>No follow-up questions added.</p>
                )}
                {editedFollowUpQuestions.map((q, qIndex) => (
                  <div key={qIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="input"
                      style={{ flex: 1, padding: '0.375rem', fontSize: '0.875rem' }}
                      value={q}
                      onChange={(e) => handleFollowUpChange(qIndex, e.target.value)}
                      placeholder="Enter follow-up question..."
                    />
                    <button
                      onClick={() => handleRemoveFollowUp(qIndex)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

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
