import express from 'express';
import { CandidateResult } from '../models/CandidateResult.js';
import Candidate from '../models/Candidate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all reports (protected) - filtered by user's candidates
router.get('/', authenticate, async (req, res) => {
  try {
    // 1. Fetch candidates created by the logged-in user
    const userCandidates = await Candidate.find({ createdBy: (req as any).user.id });
    
    if (userCandidates.length === 0) {
        return res.json([]);
    }

    const candidateIds = userCandidates.map(c => c._id.toString());
    // Also include quoted IDs in the search list to handle DB inconsistency
    const quotedCandidateIds = candidateIds.map(id => `"${id}"`);
    const allCandidateIds = [...candidateIds, ...quotedCandidateIds];

    const candidateEmails = userCandidates.map(c => c.email?.toLowerCase()).filter(Boolean);
    // const candidateNames = userCandidates.map(c => `${c.firstName} ${c.lastName}`.toLowerCase()); // Unused for now

    // 2. Find reports (CandidateResult) that match these candidates
    // We fetch all and filter in memory to match the complex fuzzy logic used elsewhere, 
    // or we construct a comprehensive query. Given the fuzzy nature, in-memory filtering 
    // after a broad DB fetch (or just fetching all if not too many) might be safer for consistency.
    // However, for performance, let's try a broad OR query.
    
    const results = await CandidateResult.find({
        $or: [
            { candidateId: { $in: allCandidateIds } },
            { id: { $in: allCandidateIds } },
            { candidate_id: { $in: allCandidateIds } },
            // For emails and names, since we need case-insensitive matching and structure varies,
            // we might miss some if we rely solely on DB query without regex.
            // But let's include exact matches at least.
             { 'candidateInformation.email': { $in: candidateEmails } },
             { 'data.candidateInformation.email': { $in: candidateEmails } }
        ]
    }).sort({ 'metadata.reportGenerated': -1 });

    res.json(results);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get report by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await CandidateResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify ownership
    // Try to find the candidate strictly first
    // Check root and nested data for candidate ID
    // CRITICAL: Check specific candidate fields BEFORE generic 'id', as 'id' might be the Report's own ID
    const rawCandidateId = result.candidateId || (result as any).candidate_id || 
                          (result as any).data?.candidateId || (result as any).data?.candidate_id ||
                          result.id;
    
    const candidateId = rawCandidateId ? String(rawCandidateId).replace(/^"|"$/g, '') : null;
    
    let candidate = null;

    if (candidateId) {
       candidate = await Candidate.findById(candidateId);
    }

    // Fallback to email match
    if (!candidate) {
        // Handle nested data robustly
        const info = result.candidateInformation || (result as any).data?.candidateInformation || {};
        const reportEmail = info.email?.toLowerCase();
        
        console.log('🔍 Report Lookup Debug:', {
             reportId: result._id,
             rawCandidateId,
             cleanedCandidateId: candidateId,
             extractedEmail: reportEmail,
             hasCandidateInfo: !!result.candidateInformation,
             hasDataInfo: !!(result as any).data?.candidateInformation
        });

        if (reportEmail) {
            candidate = await Candidate.findOne({ email: { $regex: new RegExp(`^${reportEmail}$`, 'i') } }); // Case insensitive exact match just in case
            console.log('🔍 Candidate Email Match:', candidate ? 'Found' : 'Not Found', candidate?._id);
        }
    }

    // If candidate found, check creator
    if (candidate) {
        if (candidate.createdBy && candidate.createdBy.toString() !== (req as any).user.id) {
             return res.status(403).json({ error: 'You do not have permission to view this report' });
        }
    } else {
        // If not linked to any candidate, strictly deny for now to be safe, 
        // effectively hiding "orphaned" reports from standard view if they don't match user's candidates.
        // But if it's truly orphaned, maybe no one sees it? 
        // Let's assume strict: if we can't verify you own the candidate, you can't see the report.
        // This aligns with "jo login hai uska hi data show ho".
        return res.status(403).json({ error: 'Report not explicitly linked to your candidates' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Update candidate decision from report ID
router.patch('/:id/decision', authenticate, async (req, res) => {
  try {
    const { finalDecision, notes } = req.body;

    if (!['hired', 'rejected', 'pending'].includes(finalDecision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    const result = await CandidateResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('📋 Report found:', {
      id: result._id,
      fullName: result.candidateInformation?.fullName,
      email: result.candidateInformation?.email
    });

    // Try to find matching candidate by email first (most reliable)
    // Handle nested data structure
    const info = result.candidateInformation || (result as any).data?.candidateInformation || {};
    const email = info.email?.toLowerCase();
    
    let matchedCandidate = null;

    if (email) {
      matchedCandidate = await Candidate.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      console.log('🔍 Email match result:', matchedCandidate ? 'Found' : 'Not found');
    }

    // If email match fails, try name matching
    if (!matchedCandidate) {
      const fullName = info.fullName?.toLowerCase();
      if (!fullName && !email) { // Ensure at least one identifier is present
        return res.status(400).json({ error: 'Report missing candidate name and email' });
      }

      const candidates = await Candidate.find({});
      console.log(`🔍 Searching among ${candidates.length} candidates for: "${fullName}"`);

      matchedCandidate = candidates.find((c: any) => {
        const cName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const cEmail = c.email?.toLowerCase();
        
        // Try exact name match first
        if (fullName && cName === fullName) return true;
        
        // Try partial name match
        if (fullName && (cName.includes(fullName) || fullName.includes(cName))) return true;
        
        // Try email match as fallback if email was provided in report
        if (email && cEmail === email) return true;
        
        return false;
      });

      if (matchedCandidate) {
        console.log('✅ Name match found:', {
          candidateName: `${matchedCandidate.firstName} ${matchedCandidate.lastName}`,
          candidateEmail: matchedCandidate.email
        });
      }
    }

    if (!matchedCandidate) {
      console.error('❌ No matching candidate found for:', {
        reportName: result.candidateInformation?.fullName,
        reportEmail: result.candidateInformation?.email
      });
      return res.status(404).json({ error: 'Matching candidate not found' });
    }

    // Update the candidate using findByIdAndUpdate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      matchedCandidate._id,
      { 
        finalDecision: {
          decision: finalDecision === 'hired' ? 'Hire' : finalDecision === 'rejected' ? 'Reject' : 'Hold',
          decidedAt: new Date(),
          notes
        },
        notes,
        status: finalDecision === 'hired' ? 'hired' : finalDecision === 'rejected' ? 'rejected' : 'decision_made'
      },
      { new: true }
    );

    console.log('✅ Decision updated successfully for:', updatedCandidate?.email);
    res.json({ success: true, candidate: updatedCandidate });
  } catch (error: any) {
    console.error('Update decision from report error:', error);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

export default router;
