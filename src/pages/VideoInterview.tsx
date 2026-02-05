import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Sparkles, Play, Square, Dna } from 'lucide-react';
import { showToast } from '../utils/toast';
import { getSupportedMimeType } from '../utils/recorderUtils';

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
  
  // Network and recording health states
  const [networkQuality, setNetworkQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [recordingHealth, setRecordingHealth] = useState<'healthy' | 'warning' | 'failed'>('healthy');
  const [showRecordingWarning, setShowRecordingWarning] = useState(false);

  // Refs
  const retellClientRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  // Video Ref needs to be a callback to handle conditional rendering
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      if (webcamStreamRef.current && node.srcObject !== webcamStreamRef.current) {
        console.log('🔄 Video element mounted, attaching stream');
        node.srcObject = webcamStreamRef.current;
        node.play().catch(e => console.error('Error playing video:', e));
      }
    }
  }, []);

  // Audio Mixing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const agentAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const systemAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const agentTrackRef = useRef<MediaStreamTrack | null>(null);
  const agentGainRef = useRef<GainNode | null>(null);

  // Session lock and mutex flags
  const sessionLockRef = useRef<boolean>(false);
  const audioSourceMutexRef = useRef<'none' | 'agent' | 'system'>('none');
  const uploadInProgressRef = useRef<boolean>(false);
  const isCleaningUpRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('');
  const handleEndRef = useRef<boolean>(false);
  
  // Recording health tracking
  const recordingStartedRef = useRef<boolean>(false);
  const firstChunkReceivedRef = useRef<boolean>(false);
  const lastChunkTimeRef = useRef<number>(Date.now());

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
  // Network quality monitoring
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const checkNetworkQuality = () => {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        const rtt = connection.rtt;
        
        console.log('🌐 [NETWORK-MONITOR] Connection update:', {
          effectiveType,
          downlink: `${downlink} Mbps`,
          rtt: `${rtt}ms`
        });
        
        let quality: 'good' | 'fair' | 'poor' = 'good';
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1 || rtt > 500) {
          quality = 'poor';
          setShowNetworkWarning(true);
          showToast.error('Poor network detected. Recording quality may be affected.');
        } else if (effectiveType === '3g' || downlink < 2 || rtt > 300) {
          quality = 'fair';
          showToast.error('Fair network quality. Please ensure stable connection.');
        }
        
        setNetworkQuality(quality);
      };
      
      checkNetworkQuality();
      connection.addEventListener('change', checkNetworkQuality);
      
      return () => {
        connection.removeEventListener('change', checkNetworkQuality);
      };
    }
  }, []);
  
  // Periodic network health checks to backend
  useEffect(() => {
    if (!started || !isRecording) return;
    
    const healthCheckInterval = setInterval(async () => {
      const healthCheckStart = Date.now();
      
      try {
        const response = await fetch(`${API_URL}/api/interviews/network-health`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: candidateUid,
            sessionId: sessionIdRef.current,
            metrics: {
              timestamp: new Date().toISOString(),
              recordingChunks: recordedChunksRef.current.length,
              duration: timer
            }
          })
        });
        
        const data = await response.json();
        const clientLatency = Date.now() - healthCheckStart;
        
        console.log('💓 [NETWORK-HEALTH] Health check result:', {
          serverLatency: data.latency,
          clientLatency,
          quality: data.quality,
          warning: data.warning
        });
        
        if (data.warning || clientLatency > 1000) {
          console.warn('⚠️ [NETWORK-HEALTH] Poor network detected');
          setShowNetworkWarning(true);
          showToast.error('Network quality is poor. Please check your connection.');
        }
      } catch (error) {
        console.error('❌ [NETWORK-HEALTH] Health check failed:', error);
      }
    }, 15000);
    
    return () => clearInterval(healthCheckInterval);
  }, [started, isRecording, candidateUid, timer]);
  
  // Recording health monitor
  useEffect(() => {
    if (!isRecording) return;
    
    let lastChunkCount = 0;
    let noChunkWarnings = 0;
    
    const healthCheck = setInterval(() => {
      const currentChunkCount = recordedChunksRef.current.length;
      const timeSinceLastChunk = Date.now() - lastChunkTimeRef.current;
      
      console.log(`💓 [RECORDING-HEALTH] Health check:`, {
        chunks: currentChunkCount,
        duration: `${timer}s`,
        timeSinceLastChunk: `${(timeSinceLastChunk / 1000).toFixed(1)}s`,
        recordingStarted: recordingStartedRef.current,
        firstChunkReceived: firstChunkReceivedRef.current
      });
      
      // Check if chunks stopped coming
      if (currentChunkCount === lastChunkCount && recordingStartedRef.current) {
        noChunkWarnings++;
        console.warn(`⚠️ [RECORDING-HEALTH] No new chunks for ${noChunkWarnings * 5} seconds`);
        
        if (noChunkWarnings >= 2) {
          console.error('❌ [RECORDING-HEALTH] Recording appears to have stopped!');
          setRecordingHealth('failed');
          setShowRecordingWarning(true);
          showToast.error('Recording issue detected. Please end and restart interview.');
        } else if (noChunkWarnings >= 1) {
          setRecordingHealth('warning');
        }
      } else {
        noChunkWarnings = 0;
        setRecordingHealth('healthy');
      }
      
      // Check if recording started but no chunks received
      if (recordingStartedRef.current && !firstChunkReceivedRef.current && timer > 10) {
        console.error('❌ [RECORDING-HEALTH] Recording started but no chunks received after 10s!');
        setRecordingHealth('failed');
        setShowRecordingWarning(true);
        showToast.error('Recording failed to capture data. Please restart interview.');
      }
      
      lastChunkCount = currentChunkCount;
    }, 5000);
    
    return () => clearInterval(healthCheck);
  }, [isRecording, timer]);
  
  // Browser closure detection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (started && isRecording) {
        e.preventDefault();
        e.returnValue = 'Interview is in progress. Are you sure you want to leave?';
        
        console.warn('⚠️ [BROWSER-CLOSE] User attempting to close browser during interview');
        
        if (navigator.sendBeacon) {
          const data = JSON.stringify({
            candidateId: candidateUid,
            sessionId: sessionIdRef.current,
            event: 'browser_close_attempt',
            timestamp: new Date().toISOString(),
            recordingChunks: recordedChunksRef.current.length,
            duration: timer
          });
          
          navigator.sendBeacon(`${API_URL}/api/interviews/browser-event`, data);
          console.log('📡 [BROWSER-CLOSE] Beacon sent to backend');
        }
        
        return e.returnValue;
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn('⚠️ [TAB-HIDDEN] User switched away from interview tab');
        
        if (started && isRecording) {
          fetch(`${API_URL}/api/interviews/browser-event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId: candidateUid,
              sessionId: sessionIdRef.current,
              event: 'tab_hidden',
              timestamp: new Date().toISOString(),
              duration: timer
            })
          }).catch(err => console.error('Failed to log tab hidden:', err));
        }
      } else {
        console.log('✅ [TAB-VISIBLE] User returned to interview tab');
        
        if (started && isRecording) {
          fetch(`${API_URL}/api/interviews/browser-event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId: candidateUid,
              sessionId: sessionIdRef.current,
              event: 'tab_visible',
              timestamp: new Date().toISOString(),
              duration: timer
            })
          }).catch(err => console.error('Failed to log tab visible:', err));
        }
      }
    };
    
    const handlePageHide = () => {
      console.warn('⚠️ [PAGE-HIDE] Page is being hidden/closed');
      
      if (started && isRecording && navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API_URL}/api/interviews/browser-event`,
          JSON.stringify({
            candidateId: candidateUid,
            sessionId: sessionIdRef.current,
            event: 'forceful_close',
            timestamp: new Date().toISOString(),
            duration: timer,
            recordingChunks: recordedChunksRef.current.length
          })
        );
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [started, isRecording, candidateUid, timer]);

  // Validate code on mount
  useEffect(() => {
    if (code) {
      validateInterviewCode();
    }
  }, [code]);

  // Clean up audio context on unmount
  useEffect(() => {
    // Browser detection and logging
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
    
    // Check Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      console.log('🌐 Network Information:', {
        effectiveType: connection.effectiveType,
        downlink: `${connection.downlink} Mbps`,
        rtt: `${connection.rtt}ms`,
        saveData: connection.saveData
      });
    }

    return () => {
      console.log('🧹 Component unmounting - cleaning up');
      cleanupAllResources();
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

  const cleanupAllResources = async () => {
    if (isCleaningUpRef.current) {
      console.log('⏳ Cleanup already in progress, skipping...');
      return;
    }

    isCleaningUpRef.current = true;
    console.log('🧹 Starting comprehensive cleanup...');

    try {
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
      if (micSourceRef.current) {
        try {
          micSourceRef.current.disconnect();
          console.log('✅ Mic source disconnected');
        } catch (e) {
          console.warn('⚠️ Error disconnecting mic:', e);
        }
        micSourceRef.current = null;
      }

      if (agentAudioSourceRef.current) {
        try {
          agentAudioSourceRef.current.disconnect();
          console.log('✅ Agent audio source disconnected');
        } catch (e) {
          console.warn('⚠️ Error disconnecting agent audio:', e);
        }
        agentAudioSourceRef.current = null;
      }

      if (systemAudioSourceRef.current) {
        try {
          systemAudioSourceRef.current.disconnect();
          console.log('✅ System audio source disconnected');
        } catch (e) {
          console.warn('⚠️ Error disconnecting system audio:', e);
        }
        systemAudioSourceRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
          console.log('✅ AudioContext closed');
        } catch (e) {
          console.warn('⚠️ Error closing AudioContext:', e);
        }
        audioContextRef.current = null;
      }

      // Stop webcam stream
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`✅ Track stopped: ${track.kind}`);
        });
        webcamStreamRef.current = null;
      }

      // Clear refs
      agentTrackRef.current = null;
      agentGainRef.current = null;
      audioDestinationRef.current = null;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWebcam = async () => {
    try {
      // 1. Get User Media (Mic & Cam)
      console.log('📹 Requesting media access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      webcamStreamRef.current = stream;

      // Force enable tracks (fix for black screen issues)
      stream.getVideoTracks().forEach(track => track.enabled = true);
      stream.getAudioTracks().forEach(track => track.enabled = true);
      console.log('✅ Tracks enabled explicitly');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }

      // 2. Setup Audio Mixing context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const destination = audioContext.createMediaStreamDestination();

      audioContextRef.current = audioContext;
      audioDestinationRef.current = destination;
      
      console.log('🎚️ AudioContext created:', {
        state: audioContext.state,
        sampleRate: audioContext.sampleRate
      });

      // 3. Add Mic to Mixer
      const micSource = audioContext.createMediaStreamSource(stream);
      micSource.connect(destination);
      micSourceRef.current = micSource;
      console.log('✅ Microphone connected to mixer');

      // 4. Setup Agent Audio Gain (will connect later when track is available)
      const agentGain = audioContext.createGain();
      agentGain.gain.value = 1.0;
      agentGain.connect(destination);
      agentGainRef.current = agentGain;
      console.log('✅ Agent audio gain node created');

      // 5. Try to connect if track is already available
      if (agentTrackRef.current) {
        connectAgentToMixer();
      }

      // 6. Create mixed stream for recording (Video from webcam + Mixed Audio)
      const mixedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);
      
      // Validate mixed stream
      const videoTracks = mixedStream.getVideoTracks();
      const audioTracks = mixedStream.getAudioTracks();
      
      console.log('📹 Mixed stream validation:', {
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        videoEnabled: videoTracks[0]?.enabled,
        audioEnabled: audioTracks[0]?.enabled,
        videoReadyState: videoTracks[0]?.readyState,
        audioReadyState: audioTracks[0]?.readyState
      });
      
      if (videoTracks.length === 0) {
        throw new Error('No video tracks in mixed stream');
      }
      
      if (audioTracks.length === 0) {
        console.warn('⚠️ No audio tracks in mixed stream');
      }

      // 7. Start recording with mixed stream
      const selectedMimeType = getSupportedMimeType();

      const options: any = {
        videoBitsPerSecond: 300000 // 300 kbps
      };

      if (selectedMimeType) {
        options.mimeType = selectedMimeType;
      }
      
      console.log('🎥 Creating MediaRecorder with options:', options);

      const mediaRecorder = new MediaRecorder(mixedStream, options);
      
      // Add comprehensive event handlers
      mediaRecorder.onstart = () => {
        recordingStartedRef.current = true;
        console.log('✅ MediaRecorder.onstart fired - recording actually started');
        
        // Verify first chunk within 5 seconds
        setTimeout(() => {
          if (!firstChunkReceivedRef.current) {
            console.error('❌ No chunks received after 5 seconds!');
            setRecordingHealth('failed');
            setShowRecordingWarning(true);
            showToast.error('Recording failed to start. Please refresh and try again.');
          }
        }, 5000);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          if (!firstChunkReceivedRef.current) {
            firstChunkReceivedRef.current = true;
            console.log('✅ First chunk received - recording working!');
            setRecordingHealth('healthy');
          }
          
          recordedChunksRef.current.push(event.data);
          lastChunkTimeRef.current = Date.now();
          console.log(`📦 Chunk received: ${(event.data.size / 1024).toFixed(2)} KB (Total: ${recordedChunksRef.current.length})`);
        }
      };
      
      mediaRecorder.onerror = (event: any) => {
        console.error('❌ MediaRecorder error:', event.error);
        setRecordingHealth('failed');
        setShowRecordingWarning(true);
        showToast.error('Recording error: ' + (event.error?.message || 'Unknown error'));
      };

      try {
        mediaRecorder.start(1000); // Collect data every 1 second (reduced from 3s)
        mediaRecorderRef.current = mediaRecorder;
        console.log('📹 MediaRecorder.start() called - waiting for onstart event...');
      } catch (startError) {
        console.error('❌ Failed to start MediaRecorder:', startError);
        showToast.error('Failed to start recording');
        throw startError;
      }

      console.log('✅ Webcam and recording setup complete');
      return true;
    } catch (error) {
      console.error('❌ Camera access denied:', error);
      showToast.error('⚠️ Camera Access Required\n\nYou MUST grant camera permissions to proceed with the interview.');
      throw error;
    }
  };

  const connectAgentToMixer = () => {
    // Check mutex - prevent double audio connection
    if (audioSourceMutexRef.current === 'agent') {
      console.log('🔒 Agent audio already connected (mutex locked)');
      return;
    }

    if (audioSourceMutexRef.current === 'system') {
      console.log('⚠️ System audio is active, disconnecting to use agent audio');
      // Disconnect system audio to use agent audio
      if (systemAudioSourceRef.current) {
        systemAudioSourceRef.current.disconnect();
        systemAudioSourceRef.current = null;
        console.log('🔇 System audio disconnected');
      }
    }

    if (!agentTrackRef.current) {
      console.log('❌ No agent track available to connect');
      return;
    }

    if (!audioContextRef.current || !agentGainRef.current) {
      console.log('❌ Mixer not ready, will connect later');
      return;
    }

    try {
      // Check if already connected
      if (agentAudioSourceRef.current) {
        agentAudioSourceRef.current.disconnect();
        console.log('🔌 Disconnected previous agent audio source');
      }

      console.log('🔌 Connecting agent audio track to mixer...');
      const agentStream = new MediaStream([agentTrackRef.current]);
      const agentSource = audioContextRef.current.createMediaStreamSource(agentStream);
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
      // Get agent ID from environment variable (optional fallback)
      const agentId = import.meta.env.VITE_RETELL_AGENT_ID;

      console.log('🔑 Requesting Retell token', { candidateId: candidateUid, defaultAgentId: agentId });

      const response = await fetch(`${API_URL}/api/interviews/create-web-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId, // Optional, can be undefined
          candidateId: candidateUid
        })
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
    // Session lock - prevent multiple sessions
    if (sessionLockRef.current) {
      console.warn('⚠️ Interview session already in progress (session locked)');
      showToast.error('Interview already in progress');
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
      // 1. Start webcam first (mandatory)
      console.log('📹 Starting webcam...');
      await startWebcam();
      console.log('✅ Webcam started successfully');

      // 2. Notify backend interview started
      try {
        const browserInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          sessionId: sessionIdRef.current
        };

        console.log('📡 Notifying backend of session start...');
        await fetch(`${API_URL}/api/interviews/start-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidateUid, browserInfo })
        });

        console.log('✅ Session started - backend notified');
      } catch (err) {
        console.warn('⚠️ Session notification failed (continuing):', err);
      }

      // 3. Get Retell token and start AI call
      console.log('🔑 Getting Retell token...');
      const token = await getRetellToken();
      console.log('✅ Retell token received');

      if (!window.RetellWebClient) {
        throw new Error('Retell SDK not loaded');
      }

      console.log('🤖 Initializing Retell client...');
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
          
          if (!update.is_partial && update.transcript.length > 0) {
            const lastItem = update.transcript[update.transcript.length - 1];
            console.log(`💬 Transcript: [${lastItem.role}] ${lastItem.content.substring(0, 50)}...`);
          }
        }
      });

      // Handle conversation events
      retellClient.on('call_ready', () => {
        console.log('📞 Retell call ready - looking for agent track');
        findAndConnectAgentTrack(retellClient);
        
        // Retry after 2 seconds if not found
        setTimeout(() => {
          if (audioSourceMutexRef.current === 'none') {
            console.log('🔄 Retrying agent track connection...');
            findAndConnectAgentTrack(retellClient);
          }
        }, 2000);
      });

      retellClient.on('conversationStarted', () => {
        console.log('💬 Retell conversation started');
        setAiSpeaking(true);
        setTimeout(() => setAiSpeaking(false), 3000);
      });

      retellClient.on('agent_start_talking', () => {
        console.log('🗣️ AI started talking');
        setAiSpeaking(true);
      });

      retellClient.on('agent_stop_talking', () => {
        console.log('🤐 AI stopped talking');
        setAiSpeaking(false);
      });

      retellClient.on('call_ended', () => {
        console.log('📞 Call ended by Retell');
        handleEnd();
      });

      retellClient.on('error', (error: any) => {
        console.error('❌ Retell error:', error);
        showToast.error('Call error: ' + error.message);
      });

      if (retellClient.room) {
        retellClient.room.on('trackSubscribed', (track: any, publication: any) => {
          console.log('🎵 Track subscribed:', publication.trackName);
          if (publication.trackName === 'agent_audio') {
            console.log('✅ Agent audio track subscribed via room event');
            agentTrackRef.current = track.mediaStreamTrack;
            connectAgentToMixer();
          }
        });
      }

      // Start the call
      console.log('📞 Starting Retell call...');
      await retellClient.startCall({ accessToken: token });
      console.log('✅ Retell call started successfully');

      setStarted(true);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      console.log('✅ Interview started successfully');
    } catch (error) {
      console.error('❌ Failed to start interview:', error);
      showToast.error('Failed to start interview. Please try again.');
      sessionLockRef.current = false;
      await cleanupAllResources();
    }
  };

  const findAndConnectAgentTrack = (client: any) => {
    if (!client || !client.room) {
      console.log('⚠️ Client or room not ready for agent track search');
      return;
    }

    console.log('🔍 Searching for agent audio track...');
    console.log(`📊 Remote participants: ${client.room.remoteParticipants.size}`);

    // Search all remote participants
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


  const enableSystemAudioFallback = async () => {
    // Check mutex - prevent if agent audio already connected
    if (audioSourceMutexRef.current === 'agent') {
      console.log('⚠️ Agent audio already connected, system audio not needed');
      showToast.success("Agent audio is already working!");
      return;
    }

    try {
      showToast.success("Please select 'This Tab' and enable 'Share tab audio' in the sharing dialog to record the AI's voice.");

      console.log('🖥️ Requesting system audio via screen share...');
      
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
        console.warn('⚠️ No audio track in display stream');
        return;
      }

      console.log('✅ System audio track obtained from screen share');

      // Stop the video track immediately as we don't need it
      displayStream.getVideoTracks().forEach(t => {
        t.stop();
        console.log('🎥 Display video track stopped');
      });

      if (audioContextRef.current && audioDestinationRef.current) {
        // Prevent double audio: Disconnect existing sources
        if (agentAudioSourceRef.current) {
          agentAudioSourceRef.current.disconnect();
          agentAudioSourceRef.current = null;
          console.log('🔇 Disconnected agent audio to use system audio');
        }
        if (systemAudioSourceRef.current) {
          systemAudioSourceRef.current.disconnect();
          console.log('🔇 Disconnected previous system audio');
        }

        const systemSource = audioContextRef.current.createMediaStreamSource(new MediaStream([audioTrack]));
        systemSource.connect(audioDestinationRef.current);
        systemAudioSourceRef.current = systemSource;
        
        // Lock mutex
        audioSourceMutexRef.current = 'system';
        
        console.log('✅ System audio connected to mixer (mutex: system)');
      }

      showToast.success("System audio enabled! The AI voice will now be recorded.");
    } catch (err) {
      console.error('❌ Failed to get system audio:', err);
      showToast.error('Failed to enable system audio');
    }
  };

  const toggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = newState;
        console.log(`🎥 Video track ${newState ? 'enabled' : 'disabled'}`);
      });
    }
  };

  const toggleMic = () => {
    const newState = !micEnabled;
    setMicEnabled(newState);
    if (webcamStreamRef.current) {
      // Toggle original mic stream
      webcamStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = newState;
        console.log(`🎤 Mic track ${newState ? 'enabled' : 'disabled'}`);
      });
    }
  };



  const uploadRecording = async (isChunk = false) => {
    // Upload debounce - prevent duplicate uploads
    if (uploadInProgressRef.current && !isChunk) {
      console.log('⏳ Upload already in progress, skipping duplicate upload');
      return;
    }

    if (recordedChunksRef.current.length === 0) {
      if (!isChunk) {
        console.warn('⚠️ No recording chunks to upload');
        console.warn('📊 Recording state:', {
          recordingStarted: recordingStartedRef.current,
          firstChunkReceived: firstChunkReceivedRef.current,
          lastChunkTime: lastChunkTimeRef.current ? new Date(lastChunkTimeRef.current).toISOString() : 'never',
          mediaRecorderState: mediaRecorderRef.current?.state || 'null',
          timeSinceLastChunk: lastChunkTimeRef.current ? Date.now() - lastChunkTimeRef.current : 'N/A'
        });
      }
      return;
    }

    if (!isChunk) {
      uploadInProgressRef.current = true;
    }
    
    console.log(`📤 Starting ${isChunk ? 'chunk' : 'final'} upload process...`);

    const chunksToUpload = isChunk ? [...recordedChunksRef.current] : recordedChunksRef.current;

    if (isChunk) {
      recordedChunksRef.current = []; // Clear buffer for chunks
    }

    try {
      const blob = new Blob(chunksToUpload, { type: 'video/webm' });
      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      const timestamp = Date.now();
      const filename = `interview_${candidateUid}_${timestamp}${isChunk ? '_part' : '_final'}.webm`;

      console.log('📦 Blob created:', {
        size: `${sizeMB} MB`,
        type: blob.type,
        chunks: chunksToUpload.length,
        filename
      });

      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('candidate_name', candidateName);
      formData.append('uid', candidateUid);
      if (isChunk) {
        formData.append('isChunk', 'true');
      }

      console.log(`📤 Uploading ${isChunk ? 'chunk' : 'final'} recording (${sizeMB} MB)...`);
      const startTime = Date.now();

      const response = await fetch(`${API_URL}/api/interviews/save-recording`, {
        method: 'POST',
        body: formData
      });

      const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);

      if (response.ok) {
        console.log(`✅ ${isChunk ? 'Chunk' : 'Final'} recording uploaded successfully in ${uploadTime}s`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to upload recording: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
    } finally {
      if (!isChunk) {
        uploadInProgressRef.current = false;
        console.log('🔓 Upload lock released');
      }
    }
  };

  const handleEnd = async () => {
    // Prevent multiple calls to handleEnd
    if (handleEndRef.current) {
      console.log('⏭️ handleEnd already called, skipping duplicate call');
      return;
    }
    
    handleEndRef.current = true;
    console.log('🛑 Ending interview...');
    
    try {
      // Calculate duration
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : timer;
      console.log(`⏱️ Interview duration: ${duration}s`);

      // Stop Retell call
      if (retellClientRef.current) {
        try {
          retellClientRef.current.stopCall();
          console.log('✅ Retell call stopped');
        } catch (e) {
          console.warn('⚠️ Error stopping Retell call:', e);
        }
      }

      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('⏹️ Stopping MediaRecorder...');
        mediaRecorderRef.current.stop();

        // Wait 2 seconds for final chunks + additional processing time
        console.log('⏳ Waiting for final chunks...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`📊 Final chunk count: ${recordedChunksRef.current.length}`);
        
        // Upload recording
        await uploadRecording();
      }

      // Stop webcam
      console.log('📹 Stopping webcam...');
      stopWebcam();

      // Notify backend session ended
      try {
        console.log('📡 Notifying backend of session end...');
        await fetch(`${API_URL}/api/interviews/end-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            candidateId: candidateUid, 
            duration,
            sessionId: sessionIdRef.current,
            audioSourceUsed: audioSourceMutexRef.current
          })
        });
        console.log('✅ Session ended - backend notified');
      } catch (err) {
        console.warn('⚠️ End session notification failed:', err);
      }

      // Cleanup all resources
      await cleanupAllResources();

      // Navigate to completion page
      console.log('🎉 Navigating to completion page...');
      navigate('/interview-complete', {
        state: {
          jobTitle,
          companyName,
          candidateName
        }
      });
    } catch (error) {
      console.error('❌ Error ending interview:', error);
      // Navigate anyway
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
            ref={setVideoRef}
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
            onClick={toggleMic}
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
            onClick={toggleVideo}
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
