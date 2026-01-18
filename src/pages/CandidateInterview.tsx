import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, Mic, MicOff, Video, VideoOff, AlertCircle } from 'lucide-react';
import api from '../services/api';
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
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
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

  const requestMediaAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });

      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setHasMediaAccess(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      setMediaError('');
    } catch (error: any) {
      console.error('Media access error:', error);
      setMediaError('Camera and microphone access is required for the interview.');
    }
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const startRecording = async () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];

    try {
      // Create audio mixer
      const mixerContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      mixerContextRef.current = mixerContext;

      if (mixerContext.state === 'suspended') {
        await mixerContext.resume();
      }

      const mixerDestination = mixerContext.createMediaStreamDestination();

      // Add user audio
      const userAudioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (userAudioTrack) {
        const userSource = mixerContext.createMediaStreamSource(new MediaStream([userAudioTrack]));
        userSource.connect(mixerDestination);
      }

      // Setup agent audio gain
      const agentGain = mixerContext.createGain();
      agentGain.gain.value = 1.0;
      agentGain.connect(mixerDestination);
      agentGainRef.current = agentGain;

      // Try to connect if track is already available
      if (agentTrackRef.current) {
        connectAgentToMixer();
      }

      // Create recording stream
      const recordingStream = new MediaStream([
        ...mediaStreamRef.current.getVideoTracks(),
        ...mixerDestination.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(recordingStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        uploadRecording();
        if (mixerContextRef.current) {
          mixerContextRef.current.close();
          mixerContextRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      console.log('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const connectAgentToMixer = () => {
    if (!agentTrackRef.current) {
      console.log('No agent track available to connect');
      return;
    }
    
    if (!mixerContextRef.current || !agentGainRef.current) {
      console.log('Mixer not ready, will connect later');
      return;
    }
    
    try {
      console.log('🔌 Connecting agent audio track to mixer...');
      const agentStream = new MediaStream([agentTrackRef.current]);
      const agentSource = mixerContextRef.current.createMediaStreamSource(agentStream);
      agentSource.connect(agentGainRef.current);
      agentAudioSourceRef.current = agentSource;
      console.log('✅ Agent audio successfully connected to recording mixer');
    } catch (e) {
      console.error('❌ Error connecting agent track to mixer:', e);
    }
  };

  const findAndConnectAgentTrack = (client: any) => {
    if (!client || !client.room) {
      console.log('Client or room not ready for agent track search');
      return;
    }
    
    console.log('🔍 Searching for agent audio track...');
    
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

  const uploadRecording = async () => {
    if (recordedChunksRef.current.length === 0) return;

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

    try {
      await api.interviews.saveRecording(blob, candidateName, candidateUid);
      console.log('Recording uploaded');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const startInterview = async () => {
    if (!hasMediaAccess) {
      await requestMediaAccess();
      return;
    }

    try {
      setInterviewStatus('connecting');

      // Get Retell access token
      const { access_token } = await api.interviews.createWebCall(
        import.meta.env.VITE_RETELL_AGENT_ID
      );

      // Initialize Retell client
      const RetellWebClient = window.RetellWebClient;
      const client = new RetellWebClient();
      retellClientRef.current = client;

      client.on('call_started', () => {
        setInterviewStatus('active');
        startRecording();
        
        // Start timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
        
        // Try to find agent track
        findAndConnectAgentTrack(client);
      });

      if (client.room) {
        client.room.on('trackSubscribed', (track: any, publication: any) => {
          if (publication.trackName === 'agent_audio') {
            console.log('Agent track subscribed via room event');
            agentTrackRef.current = track.mediaStreamTrack;
            connectAgentToMixer();
          }
        });
      }

      client.on('call_ended', () => {
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
            setTranscript((prev) => [...prev, entry]);
          }
        }
      });

      client.on('error', (error: any) => {
        console.error('Retell error:', error);
        setInterviewStatus('idle');
      });

      await client.startCall({ accessToken: access_token, sampleRate: 24000 });
    } catch (error) {
      console.error('Start interview error:', error);
      setInterviewStatus('idle');
    }
  };

  const endInterview = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
  };

  const submitResults = async () => {
    try {
      await api.interviews.submitResult({
        candidateId: candidateUid,
        transcript,
        duration,
        metadata: { completedAt: new Date().toISOString() },
      });

      // Navigate to completion page
      setTimeout(() => {
        navigate('/interview-complete');
      }, 2000);
    } catch (error) {
      console.error('Submit results error:', error);
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
              <div className={`px-4 py-2 rounded-full ${
                interviewStatus === 'active' ? 'bg-green-500' :
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
                  className={`p-3 rounded-lg ${
                    entry.speaker === 'ai'
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
