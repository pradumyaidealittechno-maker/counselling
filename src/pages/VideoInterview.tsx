import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Sparkles, Play, Square, Dna } from 'lucide-react';
import { showToast } from '../utils/toast';

// Retell SDK will be loaded via CDN in index.html
declare global {
  interface Window {
    RetellWebClient: any;
  }
}

export default function VideoInterview() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  const [started, setStarted] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; time: number }>>([]);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [candidateUid, setCandidateUid] = useState('');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [companyName, setCompanyName] = useState('Our Company');

  // Refs
  const retellClientRef = useRef<any>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  // Audio Mixing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const agentAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const agentTrackRef = useRef<MediaStreamTrack | null>(null);
  const agentGainRef = useRef<GainNode | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Ensure video stream is attached when component updates or view changes
  useEffect(() => {
    if (started && webcamVideoRef.current && webcamStreamRef.current) {
      console.log('🔄 Re-attaching video stream to element');
      webcamVideoRef.current.srcObject = webcamStreamRef.current;
      webcamVideoRef.current.play().catch(e => console.error('Error playing video:', e));
    }
  }, [started, webcamVideoRef.current]);

  // Validate code on mount
  useEffect(() => {
    if (code) {
      validateInterviewCode();
    }
  }, [code]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const validateInterviewCode = async () => {
    try {
      const response = await fetch(`${API_URL}/api/interviews/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      if (data.valid) {
        setCandidateName(data.candidate_name || 'Candidate');
        setCandidateUid(data.uid || code);
        setJobTitle(data.job_title || 'Software Engineer');
        setCompanyName(data.company_name || 'Our Company');
        sessionStorage.setItem('candidate_name', data.candidate_name);
        sessionStorage.setItem('candidate_uid', data.uid);
        sessionStorage.setItem('job_title', data.job_title);
        sessionStorage.setItem('company_name', data.company_name);
      } else {
        showToast.error('Invalid interview code: ' + (data.message || 'Please check your code'));
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Code validation error:', error);
      showToast.error('Failed to validate code. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWebcam = async () => {
    try {
      // 1. Get User Media (Mic & Cam)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }

      // 2. Setup Audio Mixing context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const destination = audioContext.createMediaStreamDestination();

      audioContextRef.current = audioContext;
      audioDestinationRef.current = destination;

      // 3. Add Mic to Mixer
      const micSource = audioContext.createMediaStreamSource(stream);
      micSource.connect(destination);
      micSourceRef.current = micSource;

      // 4. Setup Agent Audio Gain (will connect later when track is available)
      const agentGain = audioContext.createGain();
      agentGain.gain.value = 1.0;
      agentGain.connect(destination);
      agentGainRef.current = agentGain;

      // 5. Try to connect if track is already available
      if (agentTrackRef.current) {
        connectAgentToMixer();
      }

      // 6. Create mixed stream for recording (Video from webcam + Mixed Audio)
      const mixedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      // 5. Start recording with mixed stream
      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1500000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;

      console.log('✅ Webcam and recording started (with mixed audio)');
      return true;
    } catch (error) {
      console.error('❌ Camera access denied:', error);
      showToast.error('⚠️ Camera Access Required\n\nYou MUST grant camera permissions to proceed with the interview.');
      throw error;
    }
  };

  const connectAgentToMixer = () => {
    if (!agentTrackRef.current) {
      console.log('No agent track available to connect');
      return;
    }

    if (!audioContextRef.current || !agentGainRef.current) {
      console.log('Mixer not ready, will connect later');
      return;
    }

    try {
      console.log('🔌 Connecting agent audio track to mixer...');
      const agentStream = new MediaStream([agentTrackRef.current]);
      const agentSource = audioContextRef.current.createMediaStreamSource(agentStream);
      agentSource.connect(agentGainRef.current);
      agentAudioSourceRef.current = agentSource;
      console.log('✅ Agent audio successfully connected to recording mixer');
    } catch (e) {
      console.error('❌ Error connecting agent track to mixer:', e);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const getRetellToken = async () => {
    try {
      // Get agent ID from environment variable
      const agentId = import.meta.env.VITE_RETELL_AGENT_ID;

      if (!agentId) {
        throw new Error('VITE_RETELL_AGENT_ID not configured. Please add it to .env file');
      }

      console.log('🔑 Requesting Retell token for agent:', agentId);

      const response = await fetch(`${API_URL}/api/interviews/create-web-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get Retell token');
      }

      const data = await response.json();
      console.log('✅ Retell token received');
      return data.access_token;
    } catch (error) {
      console.error('❌ Failed to get Retell token:', error);
      throw error;
    }
  };

  const handleStart = async () => {
    try {
      // 1. Start webcam first (mandatory)
      await startWebcam();

      // 2. Notify backend interview started
      try {
        const browserInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`
        };

        await fetch(`${API_URL}/api/interviews/start-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidateUid, browserInfo })
        });

        console.log('🎥 Session started - backend notified');
      } catch (err) {
        console.warn('Session notification failed (continuing):', err);
      }

      // 3. Get Retell token and start AI call
      const token = await getRetellToken();

      if (!window.RetellWebClient) {
        throw new Error('Retell SDK not loaded');
      }

      const retellClient = new window.RetellWebClient();
      retellClientRef.current = retellClient;

      // Handle transcription updates
      retellClient.on('update', (update: any) => {
        if (update.transcript) {
          const transcriptList = update.transcript.map((item: any, idx: number) => ({
            speaker: item.role === 'agent' ? 'AI' : 'Candidate',
            text: item.content,
            time: idx * 10
          }));
          setTranscript(transcriptList);
        }
      });

      // Handle conversation events
      retellClient.on('call_ready', () => {
        console.log('Retell call ready - looking for agent track');
        findAndConnectAgentTrack(retellClient);
      });

      retellClient.on('conversationStarted', () => {
        console.log('Retell conversation started');
        setAiSpeaking(true);
        setTimeout(() => setAiSpeaking(false), 3000);
      });

      retellClient.on('agent_start_talking', () => {
        setAiSpeaking(true);
      });

      retellClient.on('agent_stop_talking', () => {
        setAiSpeaking(false);
      });

      retellClient.on('call_ended', () => {
        console.log('Call ended by Retell');
        handleEnd();
      });

      if (retellClient.room) {
        retellClient.room.on('trackSubscribed', (track: any, publication: any) => {
          if (publication.trackName === 'agent_audio') {
            console.log('Agent track subscribed via room event');
            agentTrackRef.current = track.mediaStreamTrack;
            connectAgentToMixer();
          }
        });
      }

      // Start the call
      await retellClient.startCall({ accessToken: token });

      setStarted(true);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      console.log('✅ Interview started successfully');
    } catch (error) {
      console.error('Failed to start interview:', error);
      showToast.error('Failed to start interview. Please try again.');
      stopWebcam();
    }
  };

  const findAndConnectAgentTrack = (client: any) => {
    if (!client || !client.room) {
      console.log('Client or room not ready for agent track search');
      return;
    }

    console.log('🔍 Searching for agent audio track...');

    // Search all remote participants
    for (const participant of client.room.remoteParticipants.values()) {
      for (const publication of participant.audioTrackPublications.values()) {
        if (publication.track) {
          console.log('✅ Agent track found and subscribed!');
          agentTrackRef.current = (publication.track as any).mediaStreamTrack;
          connectAgentToMixer();
          return;
        }
      }
    }
  };


  const enableSystemAudioFallback = async () => {
    try {
      showToast.success("Please select 'This Tab' and enable 'Share tab audio' in the sharing dialog to record the AI's voice.");

      // @ts-ignore - getDisplayMedia options
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required to get the tab picker  
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      } as any);

      // We only want the audio
      const audioTrack = displayStream.getAudioTracks()[0];

      if (!audioTrack) {
        showToast.error("No audio shared. Please try again and ensure 'Share Audio' is checked.");
        displayStream.getTracks().forEach(t => t.stop());
        return;
      }

      console.log('🖥️ System audio track obtained from screen share');

      // Stop the video track immediately as we don't need it
      displayStream.getVideoTracks().forEach(t => t.stop());

      if (audioContextRef.current && audioDestinationRef.current) {
        const systemSource = audioContextRef.current.createMediaStreamSource(new MediaStream([audioTrack]));
        systemSource.connect(audioDestinationRef.current);
        // Note: Do NOT connect to destination here as it will cause feedback loop if it captures speakers
        // But since we are capturing TAB audio, it's already playing.
      }

      // Disable the button or show success
      showToast.success("System audio enabled! The AI voice will now be recorded.");

    } catch (err) {
      console.error('Failed to get system audio:', err);
    }
  };

  const uploadRecording = async () => {
    if (recordedChunksRef.current.length === 0) {
      console.warn('No recording to upload');
      return;
    }

    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('file', blob, `interview_${candidateUid}_${Date.now()}.webm`);
      formData.append('candidate_name', candidateName);
      formData.append('uid', candidateUid);

      const response = await fetch(`${API_URL}/api/interviews/save-recording`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('✅ Recording uploaded successfully');
      } else {
        console.error('Failed to upload recording');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleEnd = async () => {
    try {
      // Calculate duration
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : timer;

      // Stop Retell call
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }

      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();

        // Wait for final data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Upload recording
        await uploadRecording();
      }

      // Stop webcam
      stopWebcam();

      // Notify backend session ended
      try {
        await fetch(`${API_URL}/api/interviews/end-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidateUid, duration })
        });
        console.log('✅ Session ended - backend notified');
      } catch (err) {
        console.warn('End session notification failed:', err);
      }

      // Navigate to completion page with job details
      navigate('/interview-complete', {
        state: {
          jobTitle,
          companyName,
          candidateName
        }
      });
    } catch (error) {
      console.error('Error ending interview:', error);
      navigate('/interview-complete', {
        state: {
          jobTitle,
          companyName,
          candidateName
        }
      });
    }
  };

  if (!started) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #faf5ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={28} color="white" />
            </div>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-800)' }}>Intelligens</span>
          </div>

          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 0 60px rgba(233, 30, 99, 0.3)'
          }}>
            <Video size={48} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1rem' }}>
            Welcome to Your Interview
          </h1>
          <p style={{ color: '#E91E63', fontWeight: 500, marginBottom: '0.5rem' }}>
            {jobTitle} at {companyName}
          </p>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
            This AI-powered interview will take approximately 20-30 minutes
          </p>

          <div style={{
            background: 'var(--white)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left',
            border: '1px solid #fce7f3',
            boxShadow: '0 4px 20px rgba(233, 30, 99, 0.1)'
          }}>
            <h3 style={{ color: 'var(--gray-800)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dna size={18} color="#E91E63" /> Before you begin:
            </h3>
            <ul style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 2, listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E91E63' }}>✓</span> Ensure your camera and microphone are working
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E91E63' }}>✓</span> Find a quiet, well-lit environment
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E91E63' }}>✓</span> Take your time to provide thoughtful answers
              </li>
            </ul>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleStart} style={{
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            boxShadow: '0 4px 20px rgba(233, 30, 99, 0.4)'
          }}>
            <Play size={20} /> Start Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'grid',
      gridTemplateColumns: '300px 1fr 380px',
      gap: '1px'
    }}>
      {/* Left Panel - AI Interviewer */}
      <div style={{ background: 'var(--white)', padding: '1.25rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Intelligens</span>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          border: '1px solid rgba(233, 30, 99, 0.1)'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: aiSpeaking ? '0 0 30px rgba(233, 30, 99, 0.5)' : 'none',
            transition: 'box-shadow 0.3s'
          }}>
            <span style={{ fontSize: '2.5rem' }}>👩‍💼</span>
          </div>
          <p style={{ color: 'var(--gray-800)', fontWeight: 600, marginBottom: '0.25rem' }}>Monika</p>
          <p style={{ color: '#E91E63', fontSize: '0.875rem' }}>AI Recruiter</p>
        </div>

        <div style={{
          background: aiSpeaking ? 'rgba(233, 30, 99, 0.05)' : '#f9fafb',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.25rem',
          border: aiSpeaking ? '1px solid rgba(233, 30, 99, 0.2)' : '1px solid #e5e7eb'
        }}>
          <p style={{ color: aiSpeaking ? '#E91E63' : '#9ca3af', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: 500 }}>
            {aiSpeaking ? '● Speaking' : '○ Listening'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '32px' }}>
            {[...Array(16)].map((_, i) => (
              <div key={i} style={{
                width: '3px',
                height: aiSpeaking ? `${Math.random() * 24 + 8}px` : '4px',
                background: aiSpeaking ? '#E91E63' : '#d1d5db',
                borderRadius: '2px',
                transition: 'height 0.1s'
              }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, marginBottom: '1rem' }}>
          <p style={{ color: '#E91E63', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Question</p>
          <p style={{ color: 'var(--gray-800)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Listen carefully and provide thoughtful answers to each question.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Dna size={16} color="#E91E63" />
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Powered by Job DNA</span>
        </div>
      </div>

      {/* Center Panel - Transcript */}
      <div style={{ background: 'var(--white)', padding: '1.25rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--gray-800)', fontWeight: 600 }}>Live Transcription</h3>
          <span style={{
            color: '#E91E63',
            fontSize: '0.75rem',
            background: 'rgba(233, 30, 99, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontWeight: 500
          }}>● Recording</span>
        </div>

        <div style={{
          flex: 1,
          background: '#f9fafb',
          borderRadius: '0.75rem',
          padding: '1rem',
          overflowY: 'auto',
          border: '1px solid #e5e7eb'
        }}>
          {transcript.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
              <p>Conversation will appear here...</p>
            </div>
          ) : (
            transcript.map((item, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: item.speaker === 'AI' ? '#E91E63' : '#6366F1'
                  }}>
                    {item.speaker === 'AI' ? 'Monika (AI)' : 'You'}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: '#9ca3af' }}>
                    {formatTime(item.time)}
                  </span>
                </div>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {item.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Candidate Video */}
      <div style={{ background: 'var(--white)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--gray-800)', fontWeight: 600 }}>Your Camera</h3>
          <div style={{
            background: 'rgba(233, 30, 99, 0.1)',
            color: '#E91E63',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {formatTime(timer)}
          </div>
        </div>

        {/* Video Preview */}
        <div style={{
          flex: 1,
          background: '#1F2937',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          minHeight: '280px'
        }}>
          <video
            ref={webcamVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.75rem',
              transform: 'scaleX(-1)' // Mirror effect
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0,0,0,0.7)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{ color: 'white', fontSize: '0.75rem' }}>REC</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: micEnabled ? '#f3f4f6' : '#E91E63',
              border: micEnabled ? '1px solid #e5e7eb' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic size={20} color="#4b5563" /> : <MicOff size={20} color="white" />}
          </button>
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: videoEnabled ? '#f3f4f6' : '#E91E63',
              border: videoEnabled ? '1px solid #e5e7eb' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {videoEnabled ? <Video size={20} color="#4b5563" /> : <VideoOff size={20} color="white" />}
          </button>
        </div>

        {/* System Audio Fallback */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            onClick={enableSystemAudioFallback}
            style={{
              background: 'none',
              border: 'none',
              color: '#E91E63',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            No AI sound in recording? Click here
          </button>
        </div>

        {/* Action Button */}
        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}
          onClick={handleEnd}
        >
          <Square size={18} /> End Interview
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
