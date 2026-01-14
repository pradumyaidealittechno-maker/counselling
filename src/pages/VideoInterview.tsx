import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Sparkles, Play, Pause, Square, Dna } from 'lucide-react';

const questions = [
  'Tell me about your experience with distributed systems and microservices architecture.',
  'How would you design a scalable API that handles millions of requests per day?',
  'Describe a time when you had to mentor a junior developer. What was your approach?',
  'How do you handle a production outage affecting critical services?',
  'What makes you interested in this Senior Software Engineer role?'
];

const mockTranscript = [
  { speaker: 'AI', text: 'Hello! I\'m Monika, your AI interviewer today. Thank you for taking the time to interview for the Senior Software Engineer position at Acme Corporation.' },
  { speaker: 'AI', text: 'This interview will consist of 5 questions covering technical skills, behavioral aspects, and situational scenarios. Please take your time to answer each question thoroughly.' },
  { speaker: 'AI', text: 'Let\'s begin with our first question: Tell me about your experience with distributed systems and microservices architecture.' },
  { speaker: 'Candidate', text: 'Thank you for having me. I have over 6 years of experience working with distributed systems...' },
];

export default function VideoInterview() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (started) {
      setAiSpeaking(true);
      const timeout = setTimeout(() => setAiSpeaking(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [started, currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStarted(true);
    setIsRecording(true);
  };

  const handleEnd = () => {
    navigate('/interview-complete');
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleEnd();
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
          {/* Logo */}
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
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1F2937' }}>Intelligens</span>
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
            Welcome to Your Interview
          </h1>
          <p style={{ color: '#E91E63', fontWeight: 500, marginBottom: '0.5rem' }}>
            Senior Software Engineer at Acme Corporation
          </p>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            This AI-powered interview will take approximately 20-30 minutes
          </p>
          
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left',
            border: '1px solid #fce7f3',
            boxShadow: '0 4px 20px rgba(233, 30, 99, 0.1)'
          }}>
            <h3 style={{ color: '#1F2937', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dna size={18} color="#E91E63" /> Before you begin:
            </h3>
            <ul style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 2, listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E91E63' }}>✓</span> Ensure your camera and microphone are working
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E91E63' }}>✓</span> Find a quiet, well-lit environment
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#E91E63' }}>✓</span> You'll answer {questions.length} questions
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
      <div style={{ background: 'white', padding: '1.25rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb' }}>
        {/* Logo */}
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
          <span style={{ fontWeight: 700, color: '#1F2937' }}>Intelligens</span>
        </div>
        
        {/* AI Avatar */}
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
          <p style={{ color: '#1F2937', fontWeight: 600, marginBottom: '0.25rem' }}>Monika</p>
          <p style={{ color: '#E91E63', fontSize: '0.875rem' }}>AI Recruiter</p>
        </div>

        {/* Audio Visualizer */}
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

        {/* Current Question */}
        <div style={{ flex: 1 }}>
          <p style={{ color: '#E91E63', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Question</p>
          <p style={{ color: '#1F2937', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {questions[currentQuestion]}
          </p>
        </div>

        {/* Job DNA Badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Dna size={16} color="#E91E63" />
          <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Powered by Job DNA</span>
        </div>
      </div>

      {/* Center Panel - Transcript */}
      <div style={{ background: 'white', padding: '1.25rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#1F2937', fontWeight: 600 }}>Live Transcription</h3>
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
          {mockTranscript.map((item, i) => (
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
                  {formatTime(i * 45)}
                </span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {item.text}
              </p>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
            <span style={{ fontSize: '0.875rem' }}>...</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Candidate Video */}
      <div style={{ background: 'white', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#1F2937', fontWeight: 600 }}>Your Camera</h3>
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
          background: videoEnabled ? 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' : '#1F2937',
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
          {videoEnabled ? (
            <>
              <div style={{ 
                fontSize: '4rem',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '3rem' }}>👤</span>
              </div>
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {micEnabled && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 1s infinite'
                  }} />
                )}
                <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>
                  {micEnabled ? 'Mic on' : 'Mic off'}
                </span>
              </div>
            </>
          ) : (
            <VideoOff size={48} color="#9ca3af" />
          )}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Progress</span>
            <span style={{ color: '#1F2937', fontSize: '0.875rem', fontWeight: 500 }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #E91E63 0%, #6366F1 100%)',
              transition: 'width 0.3s',
              borderRadius: '4px'
            }} />
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
          >
            {videoEnabled ? <Video size={20} color="#4b5563" /> : <VideoOff size={20} color="white" />}
          </button>
          <button
            onClick={() => setIsRecording(!isRecording)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isRecording ? '#E91E63' : '#f3f4f6',
              border: isRecording ? 'none' : '1px solid #e5e7eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {isRecording ? <Pause size={20} color="white" /> : <Play size={20} color="#4b5563" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            style={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
              boxShadow: '0 4px 14px rgba(233, 30, 99, 0.3)'
            }}
            onClick={handleNextQuestion}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </button>
          <button
            onClick={handleEnd}
            style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Square size={18} color="#ef4444" />
          </button>
        </div>
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
