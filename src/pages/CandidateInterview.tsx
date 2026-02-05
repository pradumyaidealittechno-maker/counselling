import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, Mic, MicOff, Video, VideoOff, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getSupportedMimeType } from '../utils/recorderUtils';
// import { showToast } from '../utils/toast'; // Removed unused import

declare global {
  interface Window {
    RetellWebClient: any;
  }
}

interface TranscriptEntry {
  speaker: 'ai' | 'candidate';
  text: string;
  timestamp: string;
}

export default function CandidateInterview() {
  const { id: _interviewId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isValidated, setIsValidated] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateUid, setCandidateUid] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const [interviewStatus, setInterviewStatus] = useState<'idle' | 'connecting' | 'active' | 'completed'>('idle');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const retellClientRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mixerContextRef = useRef<AudioContext | null>(null);
  const agentGainRef = useRef<GainNode | null>(null);
  const agentTrackRef = useRef<MediaStreamTrack | null>(null);
  const agentAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Session lock and mutex flags
  const sessionLockRef = useRef<boolean>(false);
  const audioSourceMutexRef = useRef<'none' | 'agent' | 'system'>('none');
  const uploadInProgressRef = useRef<boolean>(false);
  const isCleaningUpRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('');

  // Validate code on mount
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      validateCode(codeFromUrl);
    }
  }, [searchParams]);

  // Load Retell SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://esm.sh/retell-client-js-sdk';
    script.type = 'module';
    script.onload = () => {
      console.log('✅ Retell SDK loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Retell SDK');
    };
    document.body.appendChild(script);

    return () => {
      console.log('🧹 Component unmounting - cleaning up');
      cleanupAllResources();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Detect browser for compatibility logging
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !isChrome;
    const isFirefox = /Firefox/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    console.log('🌐 Browser Detection:', {
      userAgent,
      browser: isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unknown',
      platform: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop',
      mediaRecorderSupported: typeof MediaRecorder !== 'undefined',
      audioContextSupported: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      getUserMediaSupported: typeof navigator.mediaDevices?.getUserMedia !== 'undefined'
    });

    // Log supported MIME types
    if (typeof MediaRecorder !== 'undefined') {
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm'
      ];
      console.log('🎥 Supported MIME types:', mimeTypes.filter(type => MediaRecorder.isTypeSupported(type)));
    }
  }, []);

  const validateCode = async (inputCode: string) => {
    try {
      const data = await api.interviews.validateCode(inputCode);

      if (data.valid) {
        setIsValidated(true);
        setCandidateName(data.candidate_name);
        setCandidateUid(data.uid);
        setCodeError('');
      } else {
        setCodeError(data.error || 'Invalid code');
      }
    } catch (error: any) {
      setCodeError(error.message || 'Connection error. Please try again.');
    }
  };

  const cleanupAllResources = async () => {
    if (isCleaningUpRef.current) {
      console.log('⏳ Cleanup already in progress, skipping...');
      return;
    }

    isCleaningUpRef.current = true;
    console.log('🧹 Starting comprehensive cleanup...');

    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log('✅ Timer stopped');
      }

      // Stop Retell client
      if (retellClientRef.current) {
        try {
          retellClientRef.current.stopCall();
          console.log('✅ Retell call stopped');
        } catch (e) {
          console.warn('⚠️ Error stopping Retell call:', e);
        }
        retellClientRef.current = null;
      }

      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          console.log('✅ MediaRecorder stopped');
        } catch (e) {
          console.warn('⚠️ Error stopping MediaRecorder:', e);
        }
        mediaRecorderRef.current = null;
      }

      // Disconnect audio sources
      if (agentAudioSourceRef.current) {
        try {
          agentAudioSourceRef.current.disconnect();
          console.log('✅ Agent audio source disconnected');
        } catch (e) {
          console.warn('⚠️ Error disconnecting agent audio:', e);
        }
        agentAudioSourceRef.current = null;
      }

      // Close audio context
      if (mixerContextRef.current && mixerContextRef.current.state !== 'closed') {
        try {
          await mixerContextRef.current.close();
          console.log('✅ AudioContext closed');
        } catch (e) {
          console.warn('⚠️ Error closing AudioContext:', e);
        }
        mixerContextRef.current = null;
      }

      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`✅ Track stopped: ${track.kind}`);
        });
        mediaStreamRef.current = null;
      }

      // Clear refs
      agentTrackRef.current = null;
      agentGainRef.current = null;
      recordedChunksRef.current = [];

      // Reset mutex and locks
      audioSourceMutexRef.current = 'none';
      sessionLockRef.current = false;
      uploadInProgressRef.current = false;

      console.log('✅ Cleanup completed successfully');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    } finally {
      isCleaningUpRef.current = false;
    }
  };

  const requestMediaAccess = async () => {
    try {
      console.log('📹 Requesting media access...');
      
      // Browser-specific constraints
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      const constraints: MediaStreamConstraints = {
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user' 
        },
        audio: isIOS || isSafari ? true : {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('🎤 Using constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Media access granted:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings()
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays (Safari compatibility)
        try {
          await videoRef.current.play();
          console.log('✅ Video element playing');
        } catch (playError) {
          console.warn('⚠️ Video autoplay blocked:', playError);
        }
      }

      setHasMediaAccess(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      setMediaError('');
    } catch (error: any) {
      console.error('❌ Media access error:', {
        name: error.name,
        message: error.message,
        constraint: error.constraint
      });
      setMediaError('Camera and microphone access is required for the interview.');
    }
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        console.log(`📹 Camera ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        console.log(`🎤 Microphone ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  const startRecording = async () => {
    if (!mediaStreamRef.current) {
      console.error('❌ Cannot start recording: No media stream');
      return;
    }

    console.log('🎬 Starting recording process...');
    recordedChunksRef.current = [];

    try {
      // Create audio mixer
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const mixerContext = new AudioContextClass();
      mixerContextRef.current = mixerContext;

      console.log('🎚️ AudioContext created:', {
        state: mixerContext.state,
        sampleRate: mixerContext.sampleRate
      });

      // Resume if suspended (Safari compatibility)
      if (mixerContext.state === 'suspended') {
        await mixerContext.resume();
        console.log('✅ AudioContext resumed from suspended state');
      }

      const mixerDestination = mixerContext.createMediaStreamDestination();

      // Add user audio
      const userAudioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (userAudioTrack) {
        const userSource = mixerContext.createMediaStreamSource(new MediaStream([userAudioTrack]));
        userSource.connect(mixerDestination);
        console.log('✅ User microphone connected to mixer');
      } else {
        console.warn('⚠️ No user audio track found');
      }

      // Setup agent audio gain
      const agentGain = mixerContext.createGain();
      agentGain.gain.value = 1.0;
      agentGain.connect(mixerDestination);
      agentGainRef.current = agentGain;
      console.log('✅ Agent audio gain node created');

      // Try to connect if track is already available
      if (agentTrackRef.current) {
        console.log('🔌 Agent track already available, connecting...');
        connectAgentToMixer();
      } else {
        console.log('⏳ Waiting for agent track to become available...');
      }

      // Create recording stream
      const recordingStream = new MediaStream([
        ...mediaStreamRef.current.getVideoTracks(),
        ...mixerDestination.stream.getAudioTracks(),
      ]);

      console.log('📹 Recording stream created:', {
        videoTracks: recordingStream.getVideoTracks().length,
        audioTracks: recordingStream.getAudioTracks().length
      });

      const mimeType = getSupportedMimeType();
      const options: any = { mimeType };
      if (!mimeType) delete options.mimeType;

      console.log('🎥 MediaRecorder options:', options);

      const mediaRecorder = new MediaRecorder(recordingStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log(`📦 Chunk received: ${(event.data.size / 1024).toFixed(2)} KB (Total chunks: ${recordedChunksRef.current.length})`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('⏹️ MediaRecorder stopped, preparing upload...');
        // Add 2-second delay to ensure all chunks are received
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`📊 Final chunk count: ${recordedChunksRef.current.length}`);
        await uploadRecording();
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('❌ MediaRecorder error:', event.error);
      };

      mediaRecorder.start(1000);
      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('❌ Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('⏹️ Stopping recording...');
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('❌ Error stopping recording:', error);
      }
    } else {
      console.log('⚠️ MediaRecorder already inactive or not initialized');
    }
  };

  const connectAgentToMixer = () => {
    // Check mutex - prevent double audio connection
    if (audioSourceMutexRef.current === 'agent') {
      console.log('🔒 Agent audio already connected (mutex locked)');
      return;
    }

    if (audioSourceMutexRef.current === 'system') {
      console.log('⚠️ System audio is active, cannot connect agent audio (mutex conflict)');
      return;
    }

    if (!agentTrackRef.current) {
      console.log('❌ No agent track available to connect');
      return;
    }

    if (!mixerContextRef.current || !agentGainRef.current) {
      console.log('❌ Mixer not ready, will connect later');
      return;
    }

    try {
      console.log('🔌 Connecting agent audio track to mixer...');
      
      // Disconnect any existing agent audio source
      if (agentAudioSourceRef.current) {
        agentAudioSourceRef.current.disconnect();
        console.log('🔌 Disconnected previous agent audio source');
      }

      const agentStream = new MediaStream([agentTrackRef.current]);
      const agentSource = mixerContextRef.current.createMediaStreamSource(agentStream);
      agentSource.connect(agentGainRef.current);
      agentAudioSourceRef.current = agentSource;
      
      // Lock mutex
      audioSourceMutexRef.current = 'agent';
      
      console.log('✅ Agent audio successfully connected to recording mixer (mutex: agent)');
    } catch (e) {
      console.error('❌ Error connecting agent track to mixer:', e);
      audioSourceMutexRef.current = 'none';
    }
  };

  const findAndConnectAgentTrack = (client: any) => {
    if (!client || !client.room) {
      console.log('⚠️ Client or room not ready for agent track search');
      return;
    }

    console.log('🔍 Searching for agent audio track...');
    console.log(`📊 Remote participants: ${client.room.remoteParticipants.size}`);

    for (const participant of client.room.remoteParticipants.values()) {
      console.log(`👤 Checking participant: ${participant.identity || 'unknown'}`);
      console.log(`🎵 Audio publications: ${participant.audioTrackPublications.size}`);
      
      for (const publication of participant.audioTrackPublications.values()) {
        console.log(`📻 Publication: ${publication.trackName}, subscribed: ${publication.isSubscribed}`);
        
        if (publication.track) {
          console.log('✅ Agent track found and subscribed!');
          agentTrackRef.current = (publication.track as any).mediaStreamTrack;
          connectAgentToMixer();
          return;
        }
      }
    }
    
    console.log('⚠️ No agent audio track found yet');
  };

  const uploadRecording = async () => {
    // Upload debounce - prevent duplicate uploads
    if (uploadInProgressRef.current) {
      console.log('⏳ Upload already in progress, skipping duplicate upload');
      return;
    }

    if (recordedChunksRef.current.length === 0) {
      console.warn('⚠️ No recording chunks to upload');
      return;
    }

    uploadInProgressRef.current = true;
    console.log('📤 Starting upload process...');

    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      
      console.log('📦 Blob created:', {
        size: `${sizeMB} MB`,
        type: blob.type,
        chunks: recordedChunksRef.current.length
      });

      const startTime = Date.now();
      await api.interviews.saveRecording(blob, candidateName, candidateUid);
      const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Recording uploaded successfully in ${uploadTime}s`);
      
      // Clear chunks after successful upload
      recordedChunksRef.current = [];
    } catch (error) {
      console.error('❌ Upload error:', error);
    } finally {
      uploadInProgressRef.current = false;
      console.log('🔓 Upload lock released');
    }
  };

  const startInterview = async () => {
    // Session lock - prevent multiple sessions
    if (sessionLockRef.current) {
      console.warn('⚠️ Interview session already in progress (session locked)');
      return;
    }

    if (!hasMediaAccess) {
      await requestMediaAccess();
      return;
    }

    // Cleanup any existing resources before starting new session
    console.log('🧹 Cleaning up before starting new session...');
    await cleanupAllResources();

    // Lock session
    sessionLockRef.current = true;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = sessionId;
    console.log(`🔒 Session locked: ${sessionId}`);

    try {
      setInterviewStatus('connecting');
      console.log('🚀 Starting interview...');

      // Check if Retell SDK is loaded
      if (!window.RetellWebClient) {
        throw new Error('Retell SDK not loaded. Please refresh the page.');
      }

      // Get Retell access token
      console.log('🔑 Requesting Retell access token...');
      const { access_token } = await api.interviews.createWebCall(
        import.meta.env.VITE_RETELL_AGENT_ID
      );
      console.log('✅ Access token received');

      // Initialize Retell client
      const RetellWebClient = window.RetellWebClient;
      const client = new RetellWebClient();
      retellClientRef.current = client;
      console.log('✅ Retell client initialized');

      client.on('call_started', () => {
        console.log('📞 Call started');
        setInterviewStatus('active');
        startRecording();

        // Start timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
        console.log('⏱️ Timer started');

        // Try to find agent track immediately
        findAndConnectAgentTrack(client);
        
        // Retry after 2 seconds if not found
        setTimeout(() => {
          if (audioSourceMutexRef.current === 'none') {
            console.log('🔄 Retrying agent track connection...');
            findAndConnectAgentTrack(client);
          }
        }, 2000);
      });

      if (client.room) {
        client.room.on('trackSubscribed', (track: any, publication: any) => {
          console.log('🎵 Track subscribed:', publication.trackName);
          if (publication.trackName === 'agent_audio') {
            console.log('✅ Agent audio track subscribed via room event');
            agentTrackRef.current = track.mediaStreamTrack;
            connectAgentToMixer();
          }
        });
      }

      client.on('call_ended', () => {
        console.log('📞 Call ended by Retell');
        setInterviewStatus('completed');
        stopRecording();

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Submit results
        submitResults();
      });

      client.on('update', (update: any) => {
        if (update.transcript && update.transcript.trim()) {
          const entry: TranscriptEntry = {
            speaker: update.role === 'agent' ? 'ai' : 'candidate',
            text: update.transcript.trim(),
            timestamp: new Date().toISOString(),
          };

          if (!update.is_partial) {
            console.log(`💬 Transcript: [${entry.speaker}] ${entry.text.substring(0, 50)}...`);
            setTranscript((prev) => [...prev, entry]);
          }
        }
      });

      client.on('error', (error: any) => {
        console.error('❌ Retell error:', error);
        setInterviewStatus('idle');
        sessionLockRef.current = false;
      });

      console.log('📞 Starting Retell call...');
      await client.startCall({ accessToken: access_token, sampleRate: 24000 });
      console.log('✅ Retell call started successfully');
    } catch (error) {
      console.error('❌ Start interview error:', error);
      setInterviewStatus('idle');
      sessionLockRef.current = false;
      await cleanupAllResources();
    }
  };

  const endInterview = async () => {
    console.log('🛑 Ending interview...');
    
    if (retellClientRef.current) {
      try {
        retellClientRef.current.stopCall();
        console.log('✅ Retell call stop requested');
      } catch (error) {
        console.error('❌ Error stopping Retell call:', error);
      }
    }
  };

  const submitResults = async () => {
    console.log('📊 Submitting interview results...');
    
    try {
      await api.interviews.submitResult({
        candidateId: candidateUid,
        transcript,
        duration,
        metadata: { 
          completedAt: new Date().toISOString(),
          sessionId: sessionIdRef.current,
          audioSourceUsed: audioSourceMutexRef.current
        },
      });

      console.log('✅ Results submitted successfully');

      // Navigate to completion page
      setTimeout(() => {
        navigate('/interview-complete');
      }, 2000);
    } catch (error) {
      console.error('❌ Submit results error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Code entry modal
  if (!isValidated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Enter Interview Code</h2>
          <p className="text-gray-600 mb-6">Please enter the unique code provided in your invitation email.</p>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-xl font-mono uppercase tracking-wider mb-4 focus:border-purple-500 focus:outline-none"
            maxLength={8}
          />

          {codeError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{codeError}</span>
            </div>
          )}

          <button
            onClick={() => validateCode(code)}
            disabled={code.length < 6}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Validate & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <h1 className="text-white text-xl font-bold">AI Interview Platform</h1>
          </div>
          <div className="text-white text-sm">
            Welcome, <span className="font-semibold">{candidateName}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interview Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Feed */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {!hasMediaAccess && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Camera size={64} className="mb-4 opacity-50" />
                  <p className="text-lg">Camera access required</p>
                </div>
              )}

              {interviewStatus === 'active' && (
                <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">LIVE</span>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <button
                  onClick={toggleCamera}
                  disabled={!hasMediaAccess}
                  className={`p-3 rounded-full ${isCameraOn ? 'bg-white/20' : 'bg-red-500'} backdrop-blur-lg transition`}
                >
                  {isCameraOn ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
                </button>
                <button
                  onClick={toggleMic}
                  disabled={!hasMediaAccess}
                  className={`p-3 rounded-full ${isMicOn ? 'bg-white/20' : 'bg-red-500'} backdrop-blur-lg transition`}
                >
                  {isMicOn ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
                </button>
              </div>
            </div>

            {mediaError && (
              <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{mediaError}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <div className="text-sm opacity-75">Duration</div>
                <div className="text-3xl font-bold font-mono">{formatTime(duration)}</div>
              </div>
              <div className={`px-4 py-2 rounded-full ${interviewStatus === 'active' ? 'bg-green-500' :
                interviewStatus === 'connecting' ? 'bg-yellow-500' :
                  interviewStatus === 'completed' ? 'bg-blue-500' :
                    'bg-gray-500'
                }`}>
                <span className="text-white font-semibold capitalize">{interviewStatus}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {interviewStatus === 'idle' && (
                <button
                  onClick={hasMediaAccess ? startInterview : requestMediaAccess}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition"
                >
                  {hasMediaAccess ? 'Start Interview' : 'Enable Camera & Microphone'}
                </button>
              )}

              {interviewStatus === 'active' && (
                <button
                  onClick={endInterview}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition"
                >
                  End Interview
                </button>
              )}

              {interviewStatus === 'completed' && (
                <div className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-semibold text-center">
                  Interview Completed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-h-[800px] flex flex-col">
          <h3 className="text-white text-xl font-bold mb-4">Live Transcript</h3>

          <div className="flex-1 overflow-y-auto space-y-3">
            {transcript.length === 0 ? (
              <div className="text-white/50 text-center py-8">
                Conversation will appear here
              </div>
            ) : (
              transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${entry.speaker === 'ai'
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-green-500/20 border border-green-500/30'
                    }`}
                >
                  <div className="text-xs text-white/75 mb-1">
                    {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                  </div>
                  <div className="text-white text-sm">{entry.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
