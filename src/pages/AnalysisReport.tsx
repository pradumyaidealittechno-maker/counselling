import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Dna, Clock, Video, Loader, Users, X, MessageSquare, Play } from 'lucide-react';
import api from '../services/api';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  interviewDate?: string;
  interviewDuration?: string;
  interviewResult?: {
    overallScore: number;
    recommendation: string;
    confidence: number;
    summary: string;
    keyStrengths: string[];
    keyConcerns: string[];
    dimensionEvaluations?: {
      skillDNA?: DimensionEvaluation;
      experienceDNA?: DimensionEvaluation;
      behavioralDNA?: DimensionEvaluation;
      communicationDNA?: DimensionEvaluation;
      culturalDNA?: DimensionEvaluation;
    };
  };
  job?: {
    title: string;
  };
  transcript?: Array<{
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  recordingUrl?: string;
  interviewId?: string;
}

interface DimensionEvaluation {
  dimension: string;
  overallScore: number;
  traits: {
    name: string;
    score: number;
    evidence: string;
  }[];
}

export default function AnalysisReport() {
  const { id } = useParams();
  const location = useLocation();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${displayCandidate.firstName}_${displayCandidate.lastName}_AnalysisReport.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Detect if we're on a report route or candidate route
  const isReportRoute = location.pathname.includes('/reports/');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (id) {
        if (isReportRoute) {
          // Fetch directly from reports API
          const data = await api.reports.getById(id);
          console.log('AnalysisReport - Report Data:', data);
          setReportData(data);
        } else {
          // Fetch from candidates API (legacy route)
          const data = await api.candidates.getById(id);
          console.log('AnalysisReport - Candidate Data:', data);
          setCandidate(data);
        }
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={40} color="#E91E63" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading analysis report...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || (!candidate && !reportData)) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Users size={48} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
          Report Not Found
        </h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{error || 'The report you are looking for does not exist.'}</p>
        <Link to="/dashboard/reports" className="btn btn-primary">
          Back to Reports
        </Link>
      </div>
    );
  }

  // Build display data from either source
  let displayCandidate: any;
  let interviewAnalysis: any;

  if (reportData) {
    // Using report route - construct virtual candidate from report data
    displayCandidate = {
      firstName: reportData.candidateInformation?.fullName?.split(' ')[0] || 'Unknown',
      lastName: reportData.candidateInformation?.fullName?.split(' ').slice(1).join(' ') || '',
      email: reportData.candidateInformation?.email || '',
      job: { title: reportData.candidateInformation?.positionAppliedFor || '' },
      interviewDate: reportData.candidateInformation?.interviewDate,
      interviewDuration: reportData.candidateInformation?.interviewDuration,
      transcript: reportData.transcript || [],
      recordingUrl: reportData.recordingUrl,
    };
    interviewAnalysis = reportData;
    console.log('Using Report Data - displayCandidate:', displayCandidate);
    console.log('Using Report Data - interviewAnalysis:', interviewAnalysis);
  } else {
    // Using candidate route
    displayCandidate = candidate;
    interviewAnalysis = (candidate as any)?.interviewAnalysis;
    console.log('Using Candidate Data - displayCandidate:', displayCandidate);
    console.log('Using Candidate Data - interviewAnalysis:', interviewAnalysis);
  }

  const { interviewResult } = displayCandidate as any;

  // Construct recommendation object from either legacy result or new analysis
  const recommendation = (() => {
    if (interviewAnalysis) {
      // Helper to parse pipe-formatted score string: "| Title | 4/10 | Description |"
      const parsePipeScore = (str: string) => {
        if (!str) return { score: 0, rawScore: '0', text: '' };
        const parts = str.split('|').map(s => s.trim()).filter(Boolean);
        // parts[0] = Title, parts[1] = Score (4/10), parts[2] = Description
        const scorePart = parts[1] || '0/10';
        const [earned, total] = scorePart.split('/').map(Number);
        const normalizedScore = (!isNaN(earned) && !isNaN(total) && total > 0) ? (earned / total) * 100 : 0;

        // Show only the numerator number (e.g. "4" instead of "4/10")
        const displayScore = !isNaN(earned) ? earned.toString() : '0';

        return { score: normalizedScore, rawScore: displayScore, text: parts[2] || '' };
      };

      /* Unused helper removed */

      const tech = parsePipeScore(interviewAnalysis.competencyAssessment?.technicalSkills);
      const comm = parsePipeScore(interviewAnalysis.competencyAssessment?.communication);
      const prob = parsePipeScore(interviewAnalysis.competencyAssessment?.problemSolving);
      const exp = parsePipeScore(interviewAnalysis.competencyAssessment?.experienceRelevance);
      const cult = parsePipeScore(interviewAnalysis.competencyAssessment?.culturalFit);

      console.log('🧬 DNA Scores Parsed:', {
        'Skill DNA (Technical)': tech.rawScore,
        'Experience DNA': exp.rawScore,
        'Behavioral DNA (Cultural Fit)': cult.rawScore,
        'Communication DNA': comm.rawScore,
        'Problem Solving DNA': prob.rawScore
      });

      // Calculate overall score from the 5 traits to ensure consistency
      const calculatedOverallScore = Math.round(
        (tech.score + exp.score + cult.score + comm.score + prob.score) / 5
      );

      return {
        overallScore: calculatedOverallScore,
        recommendation: interviewAnalysis.recommendation?.hiringRecommendation || 'Pending',
        confidence: 85, // Default/Placeholder
        summary: interviewAnalysis.executiveSummary || interviewAnalysis.overallAssessment?.summary || 'Analysis completed.',
        keyStrengths: interviewAnalysis.keyDiscussionPoints?.technicalExperience || [],
        keyConcerns: interviewAnalysis.areasOfConcern || interviewAnalysis.keyDiscussionPoints?.redFlags || [],
        dimensionEvaluations: {
          skillDNA: {
            dimension: 'Skill DNA',
            overallScore: tech.score,
            rawScore: tech.rawScore,
            traits: [{ name: 'Technical Skills', score: tech.score, evidence: tech.text }]
          },
          experienceDNA: {
            dimension: 'Experience DNA',
            overallScore: exp.score,
            rawScore: exp.rawScore,
            traits: [{ name: 'Experience Relevance', score: exp.score, evidence: exp.text }]
          },
          behavioralDNA: {
            dimension: 'Behavioral DNA',
            overallScore: cult.score, // Using Cultural Fit for Behavioral
            rawScore: cult.rawScore,
            traits: [{ name: 'Cultural Fit', score: cult.score, evidence: cult.text }]
          },
          communicationDNA: {
            dimension: 'Communication DNA',
            overallScore: comm.score,
            rawScore: comm.rawScore,
            traits: [{ name: 'Communication', score: comm.score, evidence: comm.text }]
          },
          problemSolvingDNA: {
            dimension: 'Problem Solving',
            overallScore: prob.score,
            rawScore: prob.rawScore,
            traits: [{ name: 'Problem Solving', score: prob.score, evidence: prob.text }]
          }
        }
      };
    }
    return interviewResult;
  })();

  console.log('Final recommendation object:', recommendation);

  const initials = `${displayCandidate.firstName?.[0] || ''}${displayCandidate.lastName?.[0] || ''}`;

  if (!recommendation) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <Link
          to={isReportRoute ? "/dashboard/reports" : "/dashboard/candidates"}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--gray-500)',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Back to {isReportRoute ? "Reports" : "Candidates"}
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 700
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
              {displayCandidate.firstName} {displayCandidate.lastName}
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {displayCandidate.job?.title || 'Position'} • {reportData?.candidateInformation?.interviewDate || displayCandidate.interviewDate || 'Date not available'}
            </p>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <Clock size={32} color="#F59E0B" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#92400E' }}>Analysis Not Ready</h3>
          <p style={{ fontSize: '0.875rem', color: '#B45309' }}>
            This candidate has not completed their interview yet, or the AI analysis is still being processed.
          </p>
        </div>

        <Link to={isReportRoute ? "/dashboard/reports" : "/dashboard/candidates"} className="btn btn-secondary">
          Back to {isReportRoute ? "Reports" : "Candidates"}
        </Link>
      </div>
    );
  }

  const dimensionEvaluations = recommendation.dimensionEvaluations || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem' }}>
      {/* Main Content */}
      <div ref={reportRef} style={{ padding: '20px', background: 'white' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to={isReportRoute ? "/dashboard/reports" : "/dashboard/candidates"} style={{ color: 'var(--gray-500)', display: 'flex' }}>
              <ArrowLeft size={18} />
            </Link>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>{initials}            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                {displayCandidate.firstName} {displayCandidate.lastName}
              </h1>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{displayCandidate.job?.title || 'No job assigned'}</p>
            </div>
          </div>
        </div>

        {/* Interview Details Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'var(--white)',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={14} color="var(--gray-400)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{displayCandidate.interviewDate || 'Date not recorded'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={14} color="var(--gray-400)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{displayCandidate.interviewDuration || 'Duration not recorded'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dna size={14} color="#E91E63" />
            <span style={{ fontSize: '0.75rem', color: '#E91E63', fontWeight: 500 }}>Job DNA™ Analysis</span>
          </div>
        </div>

        {/* DNA Score Overview */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Dna size={16} color="#E91E63" />
            <h2 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--gray-900)' }}>DNA Match Overview</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(${recommendation.overallScore >= 90 ? '#10B981' : recommendation.overallScore >= 80 ? '#E91E63' : '#F59E0B'} ${recommendation.overallScore * 3.6}deg, var(--gray-100) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'var(--white)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: recommendation.overallScore >= 90 ? '#10B981' : recommendation.overallScore >= 80 ? '#E91E63' : '#F59E0B' }}>
                  {Number(recommendation.overallScore / 10).toFixed(1)}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--gray-500)' }}>Overall Match</span>
              </div>
            </div>
          </div>

          {/* Dimension Bars */}
          {Object.entries(dimensionEvaluations).map(([key, evaluation]) => {
            if (!evaluation) return null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const evalObj = evaluation as any;
            const score = evalObj.overallScore;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawScore = (evaluation as any).rawScore || `${Math.round(score)}%`;
            const scoreColor = score >= 90 ? '#10B981' : score >= 80 ? '#E91E63' : '#F59E0B';

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ width: '140px', fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                  {evalObj.dimension}
                </span>
                <div style={{ flex: 1, height: '20px', background: 'var(--gray-100)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${score}%`,
                    height: '100%',
                    background: scoreColor,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.5rem',
                    transition: 'width 0.5s ease'
                  }}>
                    <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: 600 }}>{rawScore}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Strengths & Concerns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1rem', background: 'var(--white)' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#10B981' }}>Key Strengths</h3>
            {recommendation.keyStrengths.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#065F46' }}>
                {recommendation.keyStrengths.map((s: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.375rem' }}>{s}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>No strengths recorded</p>
            )}
          </div>
          <div className="card" style={{ padding: '1rem', background: 'var(--white)' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#F59E0B' }}>Key Concerns</h3>
            {recommendation.keyConcerns.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#92400E' }}>
                {recommendation.keyConcerns.map((c: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.375rem' }}>{c}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#065F46' }}>No significant concerns identified</p>
            )}
          </div>
        </div>

        {/* Professional Profile */}
        {interviewAnalysis?.professionalProfile && (
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--white)' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Professional Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
              {interviewAnalysis.professionalProfile.currentRole && (
                <div>
                  <p style={{ color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Current Role</p>
                  <p style={{ color: 'var(--gray-900)', fontWeight: 500 }}>{interviewAnalysis.professionalProfile.currentRole}</p>
                </div>
              )}
              {interviewAnalysis.professionalProfile.totalExperience && (
                <div>
                  <p style={{ color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Total Experience</p>
                  <p style={{ color: 'var(--gray-900)', fontWeight: 500 }}>{interviewAnalysis.professionalProfile.totalExperience}</p>
                </div>
              )}
              {interviewAnalysis.professionalProfile.experienceLevel && (
                <div>
                  <p style={{ color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Experience Level</p>
                  <p style={{ color: 'var(--gray-900)', fontWeight: 500 }}>{interviewAnalysis.professionalProfile.experienceLevel}</p>
                </div>
              )}
              {interviewAnalysis.professionalProfile.currentCompany && (
                <div>
                  <p style={{ color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Current Company</p>
                  <p style={{ color: 'var(--gray-900)', fontWeight: 500 }}>{interviewAnalysis.professionalProfile.currentCompany}</p>
                </div>
              )}
            </div>
            {interviewAnalysis.professionalProfile.technicalStack && interviewAnalysis.professionalProfile.technicalStack.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>Technical Stack</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {interviewAnalysis.professionalProfile.technicalStack.map((tech: string, i: number) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.625rem',
                      background: '#E0E7FF',
                      color: '#4F46E5',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Discussion Points */}
        {interviewAnalysis?.keyDiscussionPoints && (
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--white)' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Key Discussion Points</h3>

            {interviewAnalysis.keyDiscussionPoints.technicalExperience && interviewAnalysis.keyDiscussionPoints.technicalExperience.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.5rem' }}>Technical Experience</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-700)' }}>
                  {interviewAnalysis.keyDiscussionPoints.technicalExperience.map((item: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.375rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {interviewAnalysis.keyDiscussionPoints.projectsDiscussed && interviewAnalysis.keyDiscussionPoints.projectsDiscussed.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.5rem' }}>Projects Discussed</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-700)' }}>
                  {interviewAnalysis.keyDiscussionPoints.projectsDiscussed.map((item: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.375rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {interviewAnalysis.keyDiscussionPoints.problemSolvingExamples && interviewAnalysis.keyDiscussionPoints.problemSolvingExamples.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.5rem' }}>Problem Solving Examples</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-700)' }}>
                  {interviewAnalysis.keyDiscussionPoints.problemSolvingExamples.map((item: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.375rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendation Details */}
        {interviewAnalysis?.recommendation && (
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--white)' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Recommendation Details</h3>

            {interviewAnalysis.recommendation.reasoning && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'var(--gray-500)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Reasoning</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>{interviewAnalysis.recommendation.reasoning}</p>
              </div>
            )}

            {interviewAnalysis.recommendation.status && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'var(--gray-500)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Status</p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.625rem',
                  background: '#DBEAFE',
                  color: '#1E40AF',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {interviewAnalysis.recommendation.status}
                </span>
              </div>
            )}

            {interviewAnalysis.recommendation.nextSteps && interviewAnalysis.recommendation.nextSteps.length > 0 && (
              <div>
                <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>Next Steps</p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-700)' }}>
                  {interviewAnalysis.recommendation.nextSteps.map((step: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.375rem' }}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Executive Summary */}
        {interviewAnalysis?.executiveSummary && (
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--white)' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Executive Summary</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>{interviewAnalysis.executiveSummary}</p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div>
        {/* AI Recommendation Panel */}
        <div className="card" style={{ padding: '1rem', marginBottom: '0.75rem', background: 'var(--white)' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>AI Recommendation</h3>
          <div style={{
            padding: '1rem',
            background: recommendation.recommendation === 'Hire'
              ? 'rgba(16, 185, 129, 0.1)'
              : recommendation.recommendation === 'Hold'
                ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            marginBottom: '0.75rem'
          }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: recommendation.recommendation === 'Hire' ? '#10B981' : recommendation.recommendation === 'Hold' ? '#F59E0B' : '#EF4444'
            }}>
              {recommendation.recommendation}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              {recommendation.confidence}% confidence
            </p>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{recommendation.summary}"
          </p>
        </div>

        {/* Actions */}
        <div className="card" style={{ padding: '1rem', marginBottom: '0.75rem', background: 'var(--white)' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to={isReportRoute ? `/dashboard/reports/${id}/decision` : `/dashboard/candidates/${id}/decision`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Make Decision
            </Link>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowTranscript(true)}
            >
              View Video Recording
            </button>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download Report'}
            </button>
          </div>
        </div>

        {/* Score Legend */}
        <div style={{
          padding: '0.75rem',
          background: 'var(--gray-50)',
          borderRadius: '0.5rem',
          border: '1px solid var(--gray-200)',
          marginBottom: '0.75rem'
        }}>
          <p style={{ fontSize: '0.625rem', color: 'var(--gray-500)', marginBottom: '0.5rem', fontWeight: 600 }}>Score Legend</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#10B981' }} />
              <span style={{ color: 'var(--gray-500)' }}>90%+ Excellent Match</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#E91E63' }} />
              <span style={{ color: 'var(--gray-500)' }}>80-89% Good Match</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#F59E0B' }} />
              <span style={{ color: 'var(--gray-500)' }}>&lt;80% Needs Review</span>
            </div>
          </div>
        </div>

        {/* DNA Transparency Notice */}
        <div style={{
          padding: '0.75rem',
          background: 'rgba(233, 30, 99, 0.05)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(233, 30, 99, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Dna size={12} color="#E91E63" />
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#BE185D' }}>Job DNA™ Transparency</span>
          </div>
          <p style={{ fontSize: '0.5625rem', color: '#9D174D', lineHeight: 1.5 }}>
            All evaluations are based on the approved Job DNA™ framework.
            Each score is linked to specific traits with evidence from the interview transcript.
          </p>
        </div>
        {/* Transcript Modal */}
        {showTranscript && (
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
            zIndex: 1000,
            padding: '2rem'
          }} onClick={() => setShowTranscript(false)}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '800px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Interview Recording & Transcript</h2>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{displayCandidate.firstName} {displayCandidate.lastName}</p>
                </div>
                <button
                  onClick={() => setShowTranscript(false)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    background: 'var(--gray-100)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} color="var(--gray-500)" />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {/* Video Player Section */}
                {displayCandidate.recordingUrl ? (
                  <div style={{ marginBottom: '2rem', borderRadius: '0.75rem', overflow: 'hidden', background: '#000' }}>
                    <video
                      controls
                      src={displayCandidate.recordingUrl}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    padding: '3rem',
                    background: 'var(--gray-50)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    border: '2px dashed var(--gray-200)'
                  }}>
                    <Video size={48} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--gray-500)', fontWeight: 500 }}>No video recording available</p>
                  </div>
                )}

                {/* Transcript Section */}
                <div style={{ paddingBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={18} />
                    Transcript
                  </h3>

                  {displayCandidate.transcript && displayCandidate.transcript.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {displayCandidate.transcript.map((entry: any, i: number) => {
                        const isAI = entry.speaker === 'ai' || entry.speaker === 'AI' || entry.speaker === 'Interviewer';
                        return (
                          <div key={i} style={{
                            alignSelf: isAI ? 'flex-start' : 'flex-end',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isAI ? 'flex-start' : 'flex-end'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                              {isAI ? 'AI Interviewer' : 'Candidate'}
                            </span>
                            <div style={{
                              padding: '1rem',
                              background: isAI ? 'var(--gray-100)' : '#EEF2FF',
                              color: isAI ? 'var(--gray-800)' : '#3730A3',
                              borderRadius: '1rem',
                              borderTopLeftRadius: isAI ? '0.25rem' : '1rem',
                              borderTopRightRadius: isAI ? '1rem' : '0.25rem',
                              fontSize: '0.9375rem',
                              lineHeight: 1.5
                            }}>
                              {entry.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)', background: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                      No transcript available for this interview.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
