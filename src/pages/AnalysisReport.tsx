import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Dna, Clock, Video, Loader, Users, X, MessageSquare, Download } from 'lucide-react';
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
        scale: 1.5, // Reduced scale to optimize size
        useCORS: true,
        logging: false,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--white').trim() || '#ffffff',
        onclone: (clonedDoc) => {
          // Increase font sizes in the cloned document for the PDF
          const element = clonedDoc.querySelector('[data-report-container]') as HTMLElement;
          // Reduce padding for PDF to fit more content
          if (element) {
            element.style.padding = '10px';
          }

          // Scale up base font size and specific elements (Reduced scale to avoid large gaps)
          const allElements = element.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const style = window.getComputedStyle(el as Element);

            // Reduce card padding
            if (style.padding === '16px' || style.padding.includes('1rem')) {
              htmlEl.style.padding = '0.75rem';
            }

            const fontSize = parseFloat(style.fontSize);
            if (fontSize) {
              htmlEl.style.fontSize = `${fontSize * 1.15}px`; // Increase by only 15%
            }
          });

          // --- INJECT TRANSCRIPT ---
          let transcript = reportData?.transcript || reportData?.data?.transcript || [];
          // Parse string transcript if needed
          if (typeof transcript === 'string') {
            const parsed: any[] = [];
            let current: any = null;
            const lines = transcript.split('\n');

            lines.forEach(line => {
              const match = line.match(/^(Agent|User|Interviewer|Candidate|AI): (.*)$/i);
              if (match) {
                if (current) parsed.push(current);
                current = { speaker: match[1], text: match[2] };
              } else if (current) {
                current.text += '\n' + line.trim();
              }
            });
            if (current) parsed.push(current);
            transcript = parsed;
          } else if (reportData?.body?.call?.transcript && typeof reportData.body.call.transcript === 'string') {
            // Fallback to body.call.transcript
            const parsed: any[] = [];
            let current: any = null;
            const lines = reportData.body.call.transcript.split('\n');

            lines.forEach((line: string) => {
              const match = line.match(/^(Agent|User|Interviewer|Candidate|AI): (.*)$/i);
              if (match) {
                if (current) parsed.push(current);
                current = { speaker: match[1], text: match[2] };
              } else if (current) {
                current.text += '\n' + line.trim();
              }
            });
            if (current) parsed.push(current);
            transcript = parsed;
          }

          if (transcript && Array.isArray(transcript) && transcript.length > 0) {
            const h2 = clonedDoc.createElement('h3');
            h2.innerText = 'Interview Transcript';
            h2.style.fontWeight = '600';
            h2.style.fontSize = '1.25rem';
            h2.style.marginBottom = '1rem';
            h2.style.marginTop = '2rem';
            h2.style.color = '#111827';
            h2.style.borderTop = '2px solid #e5e7eb';
            h2.style.paddingTop = '1rem';
            element.appendChild(h2);

            transcript.forEach((entry: any) => {
              const speakerLower = (entry.speaker || '').toLowerCase();
              const isAI = speakerLower.includes('ai') || speakerLower.includes('agent') || speakerLower.includes('emma');

              // Create a wrapper row for each message to handle alignment
              const rowDiv = clonedDoc.createElement('div');
              rowDiv.style.display = 'flex';
              rowDiv.style.width = '100%';
              rowDiv.style.marginBottom = '1rem';
              rowDiv.style.justifyContent = isAI ? 'flex-start' : 'flex-end';

              const bubble = clonedDoc.createElement('div');
              bubble.style.maxWidth = '80%'; // Reduced from 85% for better spacing
              bubble.style.padding = '1rem'; // Increased from 0.75rem
              bubble.style.borderRadius = '0.75rem'; // Increased radius
              bubble.style.background = isAI ? '#f9fafb' : '#eef2ff';
              bubble.style.border = '1px solid';
              bubble.style.borderColor = isAI ? '#e5e7eb' : '#c7d2fe';
              bubble.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';

              const name = clonedDoc.createElement('div');
              name.innerText = entry.speaker || (isAI ? 'AI Agent' : 'Candidate');
              name.style.fontSize = '0.75rem'; // Slightly larger
              name.style.fontWeight = '700';
              name.style.marginBottom = '0.5rem'; // More space between name and text
              name.style.color = isAI ? '#374151' : '#4338ca';

              const text = clonedDoc.createElement('div');
              text.innerText = entry.text || '';
              text.style.fontSize = '0.9rem'; // Larger text
              text.style.lineHeight = '1.6'; // Better readability
              text.style.whiteSpace = 'pre-wrap';

              bubble.appendChild(name);
              bubble.appendChild(text);
              rowDiv.appendChild(bubble);
              element.appendChild(rowDiv);
            });
          }

          // --- PAGE BREAK LOGIC ---
          // Calculate page height in pixels based on aspect ratio
          const contentWidth = element.scrollWidth;
          const fullPageHeight = contentWidth * 1.4142; // A4 Ratio (297/210)
          const safePageHeight = fullPageHeight * 0.90; // Trigger break at 90%

          // Get container padding to start accumulator correctly
          const containerStyle = window.getComputedStyle(element);
          let currentHeight = parseFloat(containerStyle.paddingTop) || 0;

          const children = Array.from(element.children) as HTMLElement[];

          for (const child of children) {
            const style = window.getComputedStyle(child);
            const mt = parseFloat(style.marginTop) || 0;
            const mb = parseFloat(style.marginBottom) || 0;
            const h = child.offsetHeight + mt + mb;

            // If adding this child exceeds the SAFETY height (90%)
            if (currentHeight + h > safePageHeight) {
              // Calculate space needed to reach the EXACT bottom of the physical page
              const spaceRemaining = fullPageHeight - currentHeight;

              if (currentHeight > 0) {
                const spacer = clonedDoc.createElement('div');
                // Fill exactly to the end of the page
                spacer.style.height = `${spaceRemaining}px`;
                spacer.style.width = '100%';
                spacer.style.display = 'block';
                spacer.setAttribute('data-pdf-spacer', 'true');

                child.parentNode?.insertBefore(spacer, child);

                // Add a small top margin spacer for the next page so it doesn't touch the very top edge
                const headerSpacer = clonedDoc.createElement('div');
                headerSpacer.style.height = '40px'; // 40px top margin for new page
                headerSpacer.style.width = '100%';
                headerSpacer.style.display = 'block';
                child.parentNode?.insertBefore(headerSpacer, child);

                // Reset height for the new page
                // We start at the child's height plus the header spacer we just added
                currentHeight = h + 40;
              } else {
                currentHeight += h;
              }
            } else {
              currentHeight += h;
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.75);
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

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
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
          // Fetch directly from reports API by Report ID
          const data = await api.reports.getById(id);
          console.log('AnalysisReport - Direct Report Data:', data);
          setReportData(data);
        } else {
          // Candidate Report Route (/dashboard/candidates/:id/report)
          // 1. Fetch from reports API by Candidate ID
          try {
            const rData = await api.reports.getByCandidateId(id);
            console.log('AnalysisReport - Report by Candidate ID:', rData);
            setReportData(rData);
          } catch (reportErr) {
            console.warn('Report not found for candidate, showing candidate info only:', reportErr);
            // 2. Fetch from candidates API (fallback/legacy)
            const cData = await api.candidates.getById(id);
            console.log('AnalysisReport - Candidate Data (Fallback):', cData);
            setCandidate(cData);
          }
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
    // Handle potential nested 'data' structure from backend
    // Try to find candidateInformation in either root or data
    const rootInfo = reportData.candidateInformation;
    const dataInfo = reportData.data?.candidateInformation;
    const info = rootInfo || dataInfo || {};

    // Try to find transcript and recording
    let transcript = reportData.transcript || reportData.data?.transcript || [];
    const recordingUrl = reportData.recordingUrl || reportData.data?.recordingUrl;

    // Helper to parse string transcript
    if (typeof transcript === 'string') {
      const parsed: any[] = [];
      let current: any = null;
      const lines = transcript.split('\n');

      lines.forEach(line => {
        const match = line.match(/^(Agent|User|Interviewer|Candidate|AI): (.*)$/i);
        if (match) {
          if (current) parsed.push(current);
          current = {
            speaker: match[1],
            text: match[2],
            timestamp: ''
          };
        } else if (current) {
          // Append to previous message if it doesn't match start pattern
          // This handles multi-line messages that were being dropped
          current.text += '\n' + line.trim();
        }
      });
      if (current) parsed.push(current);
      transcript = parsed;
    }

    // Also check deep nested body.call.transcript if from N8N raw
    if ((!transcript || transcript.length === 0) && reportData.body?.call?.transcript) {
      const rawTrans = reportData.body.call.transcript;
      if (typeof rawTrans === 'string') {
        const parsed: any[] = [];
        let current: any = null;
        const lines = rawTrans.split('\n');

        lines.forEach((line: string) => {
          const match = line.match(/^(Agent|User|Interviewer|Candidate|AI): (.*)$/i);
          if (match) {
            if (current) parsed.push(current);
            current = {
              speaker: match[1],
              text: match[2],
              timestamp: ''
            };
          } else if (current) {
            current.text += '\n' + line.trim();
          }
        });
        if (current) parsed.push(current);
        transcript = parsed;
      }
    }

    displayCandidate = {
      firstName: info.fullName?.split(' ')[0] || 'Unknown',
      lastName: info.fullName?.split(' ').slice(1).join(' ') || '',
      email: info.email || '',
      job: { title: info.positionAppliedFor || '' },
      interviewDate: info.interviewDate,
      interviewDuration: info.interviewDuration,
      transcript,
      recordingUrl,
    };

    // Determine the source of analysis data
    // If 'data' exists and has candidateInformation/competencyAssessment, use it.
    // Otherwise use root.
    interviewAnalysis = (reportData.data && reportData.data.competencyAssessment) ? reportData.data : reportData;

    console.log('Using Report Data - displayCandidate:', displayCandidate);
    console.log('Using Report Data - interviewAnalysis:', interviewAnalysis);
  } else {
    // Using candidate route
    displayCandidate = candidate;
    // Fix: Handle nested data structure (interviewAnalysis might contain 'data' wrapper)
    const analysisRaw = (candidate as any)?.interviewAnalysis;
    interviewAnalysis = analysisRaw?.data || analysisRaw;

    // Also ensure displayCandidate properties that might be in analysis are populated if missing in candidate
    if (!displayCandidate.transcript && interviewAnalysis?.transcript) {
      displayCandidate.transcript = interviewAnalysis.transcript;
    }
    if (!displayCandidate.recordingUrl && interviewAnalysis?.recordingUrl) {
      displayCandidate.recordingUrl = interviewAnalysis.recordingUrl;
    }
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

        // Handle case where str is just a number or "X/Y" without pipes
        if (!str.includes('|')) {
          const [e, t] = str.split('/').map(s => parseFloat(s.trim()));
          const validE = !isNaN(e) ? e : 0;
          const validT = !isNaN(t) && t > 0 ? t : 10;
          return {
            score: (validE / validT) * 100,
            rawScore: validE.toString(),
            text: ''
          };
        }

        const parts = str.split('|').map(s => s.trim()).filter(Boolean);
        // parts[0] = Title, parts[1] = Score (4/10), parts[2] = Description
        const scorePart = parts[1] || '0/10';
        let [earned, total] = scorePart.split('/').map(Number);

        // Fallback: If total is missing but earned is a number (e.g. "7"), assume out of 10
        if (isNaN(total) && !isNaN(earned)) {
          total = 10;
        }

        const normalizedScore = (!isNaN(earned) && !isNaN(total) && total > 0) ? (earned / total) * 100 : 0;

        // Show only the numerator number (e.g. "4" instead of "4/10")
        const displayScore = !isNaN(earned) ? earned.toString() : '0';

        // Check if description is actually in part 2 (sometimes AI puts it elsewhere or format varies)
        const text = parts[2] || '';

        return { score: normalizedScore, rawScore: displayScore, text };
      };

      /* Unused helper removed */

      // Helper to parse Overall Score string like "18/50" or "7/10"
      const parseOverallScore = (str: string) => {
        if (!str) return 0;
        const [earned, total] = str.split('/').map(Number);
        if (!isNaN(earned) && !isNaN(total) && total > 0) {
          return Math.round((earned / total) * 100);
        }
        return 0;
      };

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

      // Calculate overall score: Prioritize backend score, fallback to average
      let finalOverallScore = 0;
      const backendOverallStr = interviewAnalysis.competencyAssessment?.overallScore;

      if (backendOverallStr && backendOverallStr.includes('/')) {
        finalOverallScore = parseOverallScore(backendOverallStr);
      } else {
        finalOverallScore = Math.round(
          (tech.score + exp.score + cult.score + comm.score + prob.score) / 5
        );
      }

      return {
        overallScore: finalOverallScore,
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
              {displayCandidate.job?.title || 'Position'} • {reportData?.candidateInformation?.interviewDate || reportData?.data?.candidateInformation?.interviewDate || displayCandidate.interviewDate || 'Date not available'}
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
      <div ref={reportRef} data-report-container style={{ padding: '20px', background: 'var(--white)' }}>
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
                <div style={{ flex: 1, height: '12px', background: 'var(--gray-100)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${score}%`,
                    height: '100%',
                    background: scoreColor,
                    borderRadius: '6px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span style={{
                  width: '32px',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: scoreColor
                }}>
                  {rawScore}
                </span>
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
              View Transcript
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
              background: 'var(--white)',
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
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Interview Transcript</h2>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{displayCandidate.firstName} {displayCandidate.lastName}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      background: 'var(--primary)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    <Download size={16} />
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </button>
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
              </div>

              {/* Modal Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                {displayCandidate.transcript && displayCandidate.transcript.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {displayCandidate.transcript.map((entry: any, i: number) => {
                      const speakerLower = entry.speaker?.toLowerCase() || '';
                      const isAI = speakerLower === 'ai' || speakerLower === 'agent' || speakerLower === 'interviewer' || speakerLower.includes('emma');

                      return (
                        <div key={i} style={{
                          alignSelf: isAI ? 'flex-start' : 'flex-end',
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: isAI ? 'row' : 'row-reverse',
                          gap: '0.75rem',
                          alignItems: 'flex-start'
                        }}>


                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500, marginLeft: isAI ? '0.25rem' : 0, marginRight: isAI ? 0 : '0.25rem' }}>
                              {entry.speaker}
                            </span>
                            <div style={{
                              padding: '1rem',
                              background: isAI ? 'white' : '#EEF2FF',
                              color: 'var(--gray-800)',
                              borderRadius: '1rem',
                              borderTopLeftRadius: isAI ? '0.25rem' : '1rem',
                              borderTopRightRadius: isAI ? '1rem' : '0.25rem',
                              fontSize: '0.9375rem',
                              lineHeight: 1.6,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              border: '1px solid',
                              borderColor: isAI ? '#e2e8f0' : '#c7d2fe',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {entry.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 500 }}>No transcript available for this interview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
