import express from 'express';
import { CandidateResult } from '../models/CandidateResult.js';
import Candidate from '../models/Candidate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all reports directly from candidate_result collection
router.get('/', async (req, res) => {
  try {
    const results = await CandidateResult.find({}).sort({ 'metadata.reportGenerated': -1 });
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

    // Find the report
    const result = await CandidateResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Find matching candidate by name
    const fullName = result.candidateInformation?.fullName?.toLowerCase();
    if (!fullName) {
      return res.status(400).json({ error: 'Report missing candidate name' });
    }

    const candidates = await Candidate.find({});
    const matchedCandidate = candidates.find((c: any) => {
      const cName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return cName.includes(fullName) || fullName.includes(cName);
    });

    if (!matchedCandidate) {
      return res.status(404).json({ error: 'Matching candidate not found' });
    }

    // Update the candidate using findByIdAndUpdate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      matchedCandidate._id,
      { 
        finalDecision,
        notes,
        status: finalDecision === 'hired' ? 'hired' : finalDecision === 'rejected' ? 'rejected' : 'pending'
      },
      { new: true }
    );

    res.json({ success: true, candidate: updatedCandidate });
  } catch (error: any) {
    console.error('Update decision from report error:', error);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

export default router;
