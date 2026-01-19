import express from 'express';
import { CandidateResult } from '../models/CandidateResult.js';
import Candidate from '../models/Candidate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all reports (protected) - now filtered by user's candidates
router.get('/', authenticate, async (req, res) => {
  try {
    // 1. Find all reports (unfiltered as per user request to see "sab ka data")
    const results = await CandidateResult.find({})
      .sort({ 'metadata.reportGenerated': -1 });

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
    const email = result.candidateInformation?.email?.toLowerCase();
    let matchedCandidate = null;

    if (email) {
      matchedCandidate = await Candidate.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      console.log('🔍 Email match result:', matchedCandidate ? 'Found' : 'Not found');
    }

    // If email match fails, try name matching
    if (!matchedCandidate) {
      const fullName = result.candidateInformation?.fullName?.toLowerCase();
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
