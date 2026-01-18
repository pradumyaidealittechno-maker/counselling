import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader, Sparkles, Bot, User } from 'lucide-react';

interface ChatbotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    candidateName?: string;
    jobTitle?: string;
    candidateScore?: number;
    recommendation?: string;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotDialog({ isOpen, onClose, context }: ChatbotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! 👋 I'm your AI hiring assistant specialized in recruitment and candidate evaluation.

I can help you with:
• Understanding DNA match scores
• Explaining hiring recommendations  
• Comparing candidates
• Interview analysis insights
• Recruitment best practices

⚠️ **Note:** I only answer questions related to hiring and recruitment. For other topics, please use appropriate resources.

What would you like to know about your hiring process?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            ...context,
            conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or check your OpenAI API key in settings.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '700px',
        height: '650px',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        {/* Premium Header */}
        <div style={{
          padding: '1.5rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                AI Assistant
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Powered by OpenAI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={20} color="#fff" />
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              animation: 'messageSlide 0.3s ease-out',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              {/* Avatar */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {msg.role === 'user' ? (
                  <User size={18} color="#fff" />
                ) : (
                  <Bot size={18} color="#fff" />
                )}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '75%',
                padding: '1rem 1.25rem',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.role === 'user' ? '#667eea' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1F2937',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user' 
                  ? '0 4px 6px -1px rgba(102, 126, 234, 0.3)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              animation: 'messageSlide 0.3s ease-out'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: '#fff',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                <Loader size={16} className="animate-spin" color="#667eea" />
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Premium Input Area */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #E5E7EB',
          background: '#fff'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              className="input"
              placeholder="Ask me anything about hiring, DNA matching, candidates..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              style={{ 
                flex: 1,
                padding: '0.875rem 1.25rem',
                borderRadius: '12px',
                border: '2px solid #E5E7EB',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
            <button
              className="btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{ 
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.2s',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.4)';
              }}
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
