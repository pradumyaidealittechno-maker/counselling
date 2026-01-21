import mongoose from 'mongoose';
import Candidate from '../models/Candidate.js';

/**
 * Parse score from various formats (e.g., "45/100", "8/10", 45)
 */
const parseScore = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (val.includes('/')) {
      const [actual, total] = val.split('/').map(s => parseFloat(s.trim()));
      if (!isNaN(actual) && !isNaN(total) && total !== 0) {
        return Math.round((actual / total) * 100);
      }
    }
    return parseFloat(val) || 0;
  }
  return 0;
};

/**
 * Sync CandidateResult data to Candidate's analysis field
 */
const syncAnalysisToCandidate = async (resultDoc: any) => {
  try {
    const candidateId = resultDoc.candidate_id;
    
    if (!candidateId) {
      console.log('⚠️ [ChangeStream] No candidate_id in result, skipping sync');
      return;
    }

    console.log(`🔄 [ChangeStream] Syncing analysis for candidate_id: ${candidateId}`);

    // Find the candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.log(`❌ [ChangeStream] Candidate not found: ${candidateId}`);
      return;
    }

    console.log(`✅ [ChangeStream] Found candidate: ${candidate.firstName} ${candidate.lastName}`);

    // Extract analysis data from nested 'data' object
    const dataObj = resultDoc.data || resultDoc;
    const assessment = dataObj.competencyAssessment || dataObj.overallAssessment || {};
    const rec = dataObj.recommendation || {};

    // Update candidate analysis
    candidate.analysis = {
      overallScore: parseScore(assessment.overallScore || assessment.rating),
      technicalSkills: assessment.technicalSkills || {},
      communication: assessment.communication || {},
      problemSolving: assessment.problemSolving || {},
      culturalFit: assessment.culturalFit || {},
      recommendation: rec.hiringRecommendation || rec.decision || '',
      summary: dataObj.executiveSummary || assessment.summary || '',
      keyInsights: dataObj.strengthsObserved || [],
      redFlags: dataObj.areasOfConcern || dataObj.keyDiscussionPoints?.redFlags || []
    };

    candidate.status = 'ai_analysis_ready';
    await candidate.save();

    console.log(`✅ [ChangeStream] Analysis synced for: ${candidate.firstName} ${candidate.lastName}`);
  } catch (error: any) {
    console.error('❌ [ChangeStream] Sync error:', error.message);
  }
};

/**
 * Start watching candidate_result collection for changes
 */
export const startCandidateResultWatcher = () => {
  try {
    const collection = mongoose.connection.collection('candidate_result');
    
    // Watch for insert and update operations
    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'replace'] }
        }
      }
    ], { fullDocument: 'updateLookup' });

    console.log('👀 [ChangeStream] Watching candidate_result collection for changes...');

    changeStream.on('change', async (change: any) => {
      console.log(`📥 [ChangeStream] Detected ${change.operationType} in candidate_result`);
      
      const document = change.fullDocument;
      if (document) {
        await syncAnalysisToCandidate(document);
      }
    });

    changeStream.on('error', (error: any) => {
      console.error('❌ [ChangeStream] Error:', error.message);
      // Attempt to restart after a delay
      setTimeout(() => {
        console.log('🔄 [ChangeStream] Attempting to restart watcher...');
        startCandidateResultWatcher();
      }, 5000);
    });

    return changeStream;
  } catch (error: any) {
    console.error('❌ [ChangeStream] Failed to start watcher:', error.message);
    return null;
  }
};
