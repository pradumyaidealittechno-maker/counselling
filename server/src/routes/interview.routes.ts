import express from 'express';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import retellService from '../services/retell.service.js';
import n8nService from '../services/n8n.service.js';
import aiService from '../services/ai.service.js';
import notificationService from '../services/notification.service.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3 } from '../config/s3.js';
import RetellAgent from '../models/RetellAgent.js';

const router = express.Router();

// Helper function to format timestamp with IST and UTC
const formatTimestamp = (): string => {
  const now = new Date();
  const istTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
  const utcTime = now.toISOString();
  return `${istTime} IST (${utcTime} UTC)`;
};

// Validate interview code (public endpoint)
router.post('/validate-code', async (req, res) => {
  const startTime = Date.now();
  try {
    const { code } = req.body;
    console.log('🔐 [VALIDATE-CODE] Request received:', {
      code: code ? `${code.substring(0, 3)}***` : 'missing',
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    if (!code) {
      console.log('❌ [VALIDATE-CODE] Failed: No code provided');
      return res.status(400).json({ valid: false, error: 'Code is required' });
    }

    const candidate = await Candidate.findOne({
      interviewCode: code.toUpperCase(),
    }).populate('jobId');

    if (!candidate) {
      console.log(`❌ [VALIDATE-CODE] Failed: Invalid code "${code}"`);
      return res.status(404).json({ valid: false, error: 'Invalid code' });
    }

    console.log(`✅ [VALIDATE-CODE] Candidate found:`, {
      candidateId: candidate._id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      status: candidate.interviewStatus,
      hasAccessed: candidate.hasAccessedInterview
    });

    // Check if code is expired
    if (candidate.interviewCodeExpiry && new Date() > candidate.interviewCodeExpiry) {
      candidate.interviewStatus = 'expired';
      await candidate.save();
      console.log(`⏰ [VALIDATE-CODE] Code expired for candidate ${candidate._id}`);
      return res.status(400).json({ valid: false, error: 'Code expired' });
    }

    // Check if interview already completed
    if (candidate.hasAccessedInterview && candidate.interviewStatus === 'completed') {
      console.log(`⚠️ [VALIDATE-CODE] Interview already completed for candidate ${candidate._id}`);
      return res.status(400).json({
        valid: false,
        error: 'Interview already completed'
      });
    }

    // Mark as accessed on first validation
    if (!candidate.hasAccessedInterview) {
      candidate.hasAccessedInterview = true;
      candidate.interviewStatus = 'in_progress';
      candidate.interviewStartedAt = new Date();
      candidate.interviewAttempts += 1;
      await candidate.save();
      console.log(`🎬 [VALIDATE-CODE] First access - marked as in_progress (attempt #${candidate.interviewAttempts})`);
    }

    // Get job details for dynamic display
    const job = candidate.jobId as any;
    const jobTitle = job?.title || 'Software Engineer';
    const companyName = job?.company || 'Our Company';

    const responseTime = Date.now() - startTime;
    console.log(`✅ [VALIDATE-CODE] Success in ${responseTime}ms:`, {
      candidateId: candidate._id,
      jobTitle,
      companyName
    });

    res.json({
      valid: true,
      candidate_name: `${candidate.firstName} ${candidate.lastName}`,
      uid: candidate._id.toString(),
      job_title: jobTitle,
      company_name: companyName,
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [VALIDATE-CODE] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// Create Retell web call (public endpoint for interview page)
router.post('/create-web-call', async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('📞 [CREATE-WEB-CALL] Request received:', {
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    let { agentId, candidateId } = req.body;

    // If candidateId is provided, try to find the agent tailored for the job
    if (candidateId) {
      try {
        console.log(`🔍 [CREATE-WEB-CALL] Looking up candidate: ${candidateId}`);
        const candidate = await Candidate.findById(candidateId);

        if (candidate) {
          console.log(`✅ [CREATE-WEB-CALL] Candidate found:`, {
            candidateId: candidate._id,
            name: `${candidate.firstName} ${candidate.lastName}`,
            jobId: candidate.jobId
          });

          if (candidate.jobId) {
            // Strategy 1: Direct lookup with toString()
            let retellAgent = await RetellAgent.findOne({ jobId: candidate.jobId.toString() });

            // Strategy 2: Lookup with object ID (in case casting didn't work previously)
            if (!retellAgent) {
              retellAgent = await RetellAgent.findOne({ jobId: candidate.jobId });
            }

            // Strategy 3: Brute force (fetch all and compare strings) - infallible fallback
            if (!retellAgent) {
              console.log('⚠️ [CREATE-WEB-CALL] Direct lookup failed. Trying manual string match...');
              const allAgents = await RetellAgent.find({});
              retellAgent = allAgents.find(a => a.jobId.toString() === candidate.jobId.toString()) || null;
            }

            if (retellAgent) {
              console.log(`✅ [CREATE-WEB-CALL] RetellAgent found:`, {
                agentId: retellAgent.agent_id,
                jobId: retellAgent.jobId
              });
              if (retellAgent.agent_id) {
                agentId = retellAgent.agent_id;
              }
            } else {
              console.log(`⚠️ [CREATE-WEB-CALL] RetellAgent NOT found for jobId: ${candidate.jobId}`);

              if (!process.env.RETELL_AGENT_ID) {
                console.error(`❌ [CREATE-WEB-CALL] No fallback agent configured`);
                return res.status(400).json({
                  error: `No AI Agent configured for Job ID: ${candidate.jobId}. Please contact support.`
                });
              }
            }
          } else {
            console.log('⚠️ [CREATE-WEB-CALL] Candidate has no jobId');
          }
        } else {
          console.log('⚠️ [CREATE-WEB-CALL] Candidate not found in DB');
        }
      } catch (err: any) {
        console.error('❌ [CREATE-WEB-CALL] Error fetching candidate/agent:', {
          message: err.message,
          stack: err.stack
        });
      }
    }

    if (!agentId) {
      // Fallback to env var if no agentId from DB or request
      agentId = process.env.RETELL_AGENT_ID;
      console.log(`🔄 [CREATE-WEB-CALL] Using fallback agent from env: ${agentId}`);
    }

    if (!agentId) {
      console.log('❌ [CREATE-WEB-CALL] No agent ID available');
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    console.log(`🤖 [CREATE-WEB-CALL] Creating web call with agent: ${agentId}`);
    const callData = await retellService.createWebCall(agentId);

    const responseTime = Date.now() - startTime;
    console.log(`✅ [CREATE-WEB-CALL] Success in ${responseTime}ms:`, {
      callId: callData.call_id || 'N/A',
      accessToken: callData.access_token ? `${callData.access_token.substring(0, 10)}...` : 'N/A'
    });

    res.json(callData);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [CREATE-WEB-CALL] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ error: error.message || 'Failed to create interview session' });
  }
});


// Save interview recording (public endpoint)
router.post('/save-recording', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  try {
    const { uid, isChunk } = req.body;
    const file = req.file;

    console.log(`📹 [SAVE-RECORDING] Request received at ${formatTimestamp()}:`, {
      uid,
      isChunk: isChunk === 'true',
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
      fileName: file?.originalname,
      mimeType: file?.mimetype
    });

    if (!file) {
      console.error('❌ [SAVE-RECORDING] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!uid) {
      console.error('❌ [SAVE-RECORDING] Candidate UID required');
      return res.status(400).json({ error: 'Candidate UID required in body' });
    }

    const s3Folder = process.env.AWS_S3_RECORDINGS_FOLDER || 'recordings';
    const s3KeyName = `${uid}/${file.originalname}`;

    console.log(`☁️ [SAVE-RECORDING] Uploading to S3: ${s3Folder}/${s3KeyName}`);

    let uploadResult;
    try {
      const uploadStartTime = Date.now();
      uploadResult = await uploadToS3(
        file.buffer,
        s3Folder,
        s3KeyName,
        file.mimetype
      );
      const uploadTime = Date.now() - uploadStartTime;
      console.log(`✅ [SAVE-RECORDING] S3 upload completed in ${uploadTime}ms:`, {
        url: uploadResult.url,
        key: uploadResult.key
      });
    } catch (s3Error: any) {
      console.error('❌ [SAVE-RECORDING] S3 Upload Error:', {
        message: s3Error.message,
        stack: s3Error.stack
      });
      return res.status(500).json({ error: `S3 Upload Failed: ${s3Error.message}` });
    }

    // Update candidate record
    const candidate = await Candidate.findById(uid);
    if (candidate) {
      if (!candidate.recordingUrls) candidate.recordingUrls = [];
      candidate.recordingUrls.push(uploadResult.url);
      candidate.recordingUrl = uploadResult.url;
      candidate.recordingS3Key = uploadResult.key;
      
      // Update recording status
      if (!candidate.recordingStatus) {
        candidate.recordingStatus = {
          started: true,
          firstChunkReceived: false,
          totalChunks: 0,
          uploadSuccess: false
        };
      }
      
      if (candidate.recordingUrls.length === 1) {
        candidate.recordingStatus.firstChunkReceived = true;
      }
      
      candidate.recordingStatus.totalChunks = candidate.recordingUrls.length;
      candidate.recordingStatus.lastChunkTime = new Date();
      candidate.recordingStatus.uploadSuccess = true;
      
      await candidate.save();

      const uploadSpeed = file.size / (Date.now() - startTime); // bytes per ms
      const uploadSpeedMbps = ((uploadSpeed * 8) / 1024).toFixed(2); // Mbps

      console.log(`✅ [SAVE-RECORDING] Candidate updated:`, {
        candidateId: uid,
        totalChunks: candidate.recordingUrls.length,
        uploadSpeed: `${uploadSpeedMbps} Mbps`,
        recordingStatus: candidate.recordingStatus
      });
    } else {
      console.warn(`⚠️ [SAVE-RECORDING] Candidate ${uid} not found, but file uploaded to S3`);
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [SAVE-RECORDING] Complete in ${responseTime}ms at ${formatTimestamp()}`);

    res.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [SAVE-RECORDING] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: `Failed to save recording: ${error.message}` });
  }
});

// Submit interview results (public endpoint)
router.post('/submit-result', async (req, res) => {
  try {
    const { candidateId, transcript, duration, metadata } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID required' });
    }

    const candidate = await Candidate.findById(candidateId).populate('jobId');
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate with transcript
    candidate.transcript = transcript || [];
    candidate.status = 'interview_complete';
    candidate.interviewStatus = 'completed';
    candidate.interviewCompletedAt = new Date();
    await candidate.save();

    // Get job details for analysis
    const job = await Job.findById(candidate.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Analyze interview with AI
    try {
      const analysis = await aiService.analyzeInterview(
        candidate.transcript,
        job.description,
        job.requiredSkills
      );

      candidate.analysis = analysis;
      await candidate.save();

      console.log(`✅ Interview analyzed for candidate ${candidateId}`);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue even if AI analysis fails
    }

    // Send result to n8n webhook for further processing
    try {
      await n8nService.sendInterviewResult({
        candidateId: candidate._id.toString(),
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        interviewData: metadata || {},
        transcript: candidate.transcript,
        duration: duration || 0,
        recordingUrl: candidate.recordingUrl,
      });
    } catch (n8nError) {
      console.error('n8n webhook failed:', n8nError);
      // Continue even if webhook fails
    }

    // Note: Notification is created in /end-session endpoint to avoid duplicates

    res.json({
      success: true,
      message: 'Interview results submitted successfully',
      analysis: candidate.analysis,
    });
  } catch (error: any) {
    console.error('Submit result error:', error);
    res.status(500).json({ error: 'Failed to submit interview results' });
  }
});

// Generate interview code (protected - admin only)
router.post('/generate-code', async (req, res) => {
  try {
    const { candidateId, expiresInHours = 168 } = req.body; // Default 7 days

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Generate unique code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Update candidate with new code
    candidate.interviewCode = code;
    candidate.interviewCodeExpiry = expiresAt;
    candidate.hasAccessedInterview = false;
    await candidate.save();

    console.log(`✅ Interview code generated for ${candidate.firstName} ${candidate.lastName}: ${code}`);

    res.json({
      code,
      expiresAt,
      candidateId: candidate._id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`
    });
  } catch (error: any) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: 'Failed to generate interview code' });
  }
});

// Start interview session (public endpoint - called when interview starts)
router.post('/start-session', async (req, res) => {
  const startTime = Date.now();
  try {
    const { candidateId, browserInfo } = req.body;

    console.log(`🎬 [START-SESSION] Request received at ${formatTimestamp()}:`, {
      candidateId,
      browserInfo: browserInfo ? {
        userAgent: browserInfo.userAgent?.substring(0, 50) + '...',
        platform: browserInfo.platform,
        sessionId: browserInfo.sessionId
      } : 'N/A'
    });

    if (!candidateId) {
      console.error('❌ [START-SESSION] Candidate ID required');
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.error(`❌ [START-SESSION] Candidate not found: ${candidateId}`);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate status
    candidate.interviewStatus = 'in_progress';
    candidate.interviewStartedAt = new Date();
    if (browserInfo) {
      candidate.browserInfo = browserInfo;
    }
    await candidate.save();

    const responseTime = Date.now() - startTime;
    console.log(`✅ [START-SESSION] Success in ${responseTime}ms at ${formatTimestamp()}:`, {
      candidateId: candidate._id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      startedAt: candidate.interviewStartedAt
    });

    res.json({
      success: true,
      sessionId: candidate._id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      startedAt: candidate.interviewStartedAt
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [START-SESSION] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to start interview session' });
  }
});

// End interview session (public endpoint - called when interview ends)
router.post('/end-session', async (req, res) => {
  const startTime = Date.now();
  try {
    const { candidateId, sessionId, duration, audioSourceUsed } = req.body;

    const id = candidateId || sessionId;
    console.log(`🏁 [END-SESSION] Request received at ${formatTimestamp()}:`, {
      candidateId: id,
      duration: duration ? `${duration}s` : 'N/A',
      audioSourceUsed: audioSourceUsed || 'N/A'
    });

    if (!id) {
      console.error('❌ [END-SESSION] Candidate ID or Session ID required');
      return res.status(400).json({ error: 'Candidate ID or Session ID is required' });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      console.error(`❌ [END-SESSION] Candidate not found: ${id}`);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate status
    candidate.status = 'interview_complete';
    candidate.interviewStatus = 'completed';
    candidate.interviewCompletedAt = new Date();

    if (duration) {
      candidate.interviewDuration = duration;
    } else if (candidate.interviewStartedAt) {
      const elapsed = Math.floor((Date.now() - candidate.interviewStartedAt.getTime()) / 1000);
      candidate.interviewDuration = elapsed;
    }

    // Store audio source used for debugging
    if (audioSourceUsed) {
      if (!candidate.browserInfo) candidate.browserInfo = {};
      (candidate.browserInfo as any).audioSourceUsed = audioSourceUsed;
    }

    await candidate.save();

    const responseTime = Date.now() - startTime;
    console.log(`✅ [END-SESSION] Success in ${responseTime}ms at ${formatTimestamp()}:`, {
      candidateId: candidate._id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      duration: candidate.interviewDuration,
      completedAt: candidate.interviewCompletedAt,
      recordingStatus: candidate.recordingStatus,
      recordingChunks: candidate.recordingUrls?.length || 0,
      interrupted: candidate.interviewInterrupted || false
    });

    // Verify recording upload
    if (!candidate.recordingUrls || candidate.recordingUrls.length === 0) {
      console.warn(`⚠️ [END-SESSION] WARNING: No recording uploaded for candidate ${candidate._id}`);
    } else if (!candidate.recordingStatus?.uploadSuccess) {
      console.warn(`⚠️ [END-SESSION] WARNING: Recording upload may have failed for candidate ${candidate._id}`);
    }

    // Create notification for the recruiter/admin who created the job
    try {
      const job = await Job.findById(candidate.jobId);
      if (job && job.createdBy) {
        await notificationService.createInterviewCompleteNotification(
          job.createdBy,
          candidate._id,
          `${candidate.firstName} ${candidate.lastName}`,
          job.title
        );
        console.log(`📬 [END-SESSION] Notification created for user ${job.createdBy}`);
      }
    } catch (notifError: any) {
      console.error('⚠️ [END-SESSION] Notification creation failed:', notifError.message);
    }

    res.json({
      success: true,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      completedAt: candidate.interviewCompletedAt,
      duration: candidate.interviewDuration
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [END-SESSION] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to end interview session' });
  }
});

// Network health check (public endpoint - called periodically during interview)
router.post('/network-health', async (req, res) => {
  const startTime = Date.now();
  try {
    const { candidateId, networkMetrics, timestamp } = req.body;

    console.log(`📡 [NETWORK-HEALTH] Check received at ${formatTimestamp()}:`, {
      candidateId,
      quality: networkMetrics?.quality,
      downlink: networkMetrics?.downlink,
      rtt: networkMetrics?.rtt,
      effectiveType: networkMetrics?.effectiveType
    });

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.error(`❌ [NETWORK-HEALTH] Candidate not found: ${candidateId}`);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Initialize networkHealthChecks array if not exists
    if (!candidate.networkHealthChecks) {
      candidate.networkHealthChecks = [];
    }

    // Add network health check to history
    (candidate.networkHealthChecks as any[]).push({
      timestamp: timestamp || new Date(),
      quality: networkMetrics?.quality,
      downlink: networkMetrics?.downlink,
      rtt: networkMetrics?.rtt,
      effectiveType: networkMetrics?.effectiveType
    });

    // Store latest network metrics
    candidate.networkMetrics = networkMetrics;

    await candidate.save();

    const responseTime = Date.now() - startTime;
    const serverTime = Date.now();

    // Calculate latency (client to server)
    const clientLatency = timestamp ? serverTime - new Date(timestamp).getTime() : 0;

    // Warn if network quality is poor
    const warning = networkMetrics?.quality === 'poor' || clientLatency > 1000;

    console.log(`✅ [NETWORK-HEALTH] Saved in ${responseTime}ms:`, {
      candidateId,
      quality: networkMetrics?.quality,
      clientLatency: `${clientLatency}ms`,
      warning: warning ? 'YES' : 'NO'
    });

    res.json({
      success: true,
      serverTime,
      clientLatency,
      warning,
      message: warning ? 'Poor network quality detected' : 'Network quality is good'
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [NETWORK-HEALTH] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to save network health check' });
  }
});

// Browser event logging (public endpoint - called on browser events)
router.post('/browser-event', async (req, res) => {
  const startTime = Date.now();
  try {
    const { candidateId, eventType, eventData, timestamp } = req.body;

    console.log(`🌐 [BROWSER-EVENT] Event received at ${formatTimestamp()}:`, {
      candidateId,
      eventType,
      timestamp,
      eventData: eventData ? JSON.stringify(eventData).substring(0, 100) : 'N/A'
    });

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    if (!eventType) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.error(`❌ [BROWSER-EVENT] Candidate not found: ${candidateId}`);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Initialize browserEvents array if not exists
    if (!candidate.browserEvents) {
      candidate.browserEvents = [];
    }

    // Add browser event to history
    (candidate.browserEvents as any[]).push({
      eventType,
      timestamp: timestamp || new Date(),
      eventData: eventData || {}
    });

    // Mark interview as interrupted if browser closed
    if (eventType === 'beforeunload' || eventType === 'pagehide' || eventType === 'visibilitychange') {
      candidate.interviewInterrupted = true;
      console.log(`⚠️ [BROWSER-EVENT] Interview interrupted by ${eventType}`);
    }

    await candidate.save();

    const responseTime = Date.now() - startTime;
    console.log(`✅ [BROWSER-EVENT] Saved in ${responseTime}ms:`, {
      candidateId,
      eventType,
      totalEvents: (candidate.browserEvents as any[]).length
    });

    res.json({
      success: true,
      message: 'Browser event logged successfully'
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [BROWSER-EVENT] Error after ${responseTime}ms:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to log browser event' });
  }
});

// Get active interview sessions (protected - admin only)
router.get('/active-sessions', async (_req, res) => {
  try {
    const activeCandidates = await Candidate.find({
      interviewStatus: 'in_progress'
    }).select('_id firstName lastName interviewStartedAt email');

    const sessions = activeCandidates.map(candidate => ({
      _id: candidate._id,
      candidateId: candidate._id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      startedAt: candidate.interviewStartedAt,
      status: 'in_progress'
    }));

    res.json(sessions);
  } catch (error: any) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

export default router;
