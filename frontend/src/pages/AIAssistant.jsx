import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Bot, User } from 'lucide-react';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 I'm Buddy, your dedicated AI assistant for Andhra Pradesh State and Central government welfare schemes. Ask me about student scholarships, farmer grants, healthcare, or application links!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Andhra Pradesh Schemes", 
    "PM Kisan Samman Nidhi", 
    "Annadata Sukhibhava", 
    "Student Scholarships"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:8000/api/v1/chat?query=${encodeURIComponent(query)}`);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: response.data.reply
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I'm having trouble connecting to the backend server. Please make sure your FastAPI server is running on port 8000!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', paddingBottom: '30px' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)', color: '#ffffff', padding: '30px 20px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
          <Sparkles size={14} /> Intelligent Scheme Assistant • Andhra Pradesh
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 6px 0' }}>
          Buddy AI Assistant
        </h1>
        <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '550px', margin: '0 auto' }}>
          Ask anything about AP state & Central welfare programs, eligibility, or direct application portals.
        </p>
      </div>

      {/* Chat Interface Container */}
      <div style={{ width: '100%', maxWidth: '850px', margin: '20px auto 0 auto', padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '520px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Messages Feed */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {msg.sender === 'bot' && (
                  <div style={{ background: '#e0f2fe', padding: '7px', borderRadius: '50%', color: '#0369a1', flexShrink: '0', boxShadow: '0 2px 4px rgba(3,105,161,0.15)' }}>
                    <Bot size={16} />
                  </div>
                )}
                
                <div style={{ 
                  background: msg.sender === 'user' ? '#1e3a8a' : '#ffffff', 
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b', 
                  padding: '12px 16px', borderRadius: '14px', fontSize: '0.92rem', lineHeight: '1.5',
                  border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                  boxShadow: msg.sender === 'user' ? '0 3px 10px rgba(30,58,138,0.2)' : '0 2px 5px rgba(0,0,0,0.02)'
                }}>
                  <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                </div>

                {msg.sender === 'user' && (
                  <div style={{ background: '#1e3a8a', padding: '7px', borderRadius: '50%', color: '#ffffff', flexShrink: '0', boxShadow: '0 2px 4px rgba(30,58,138,0.2)' }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '6px' }}>
                <Bot size={16} color="#0369a1" /> Buddy is searching AP & Central schemes database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div style={{ padding: '8px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggestions:</span>
            {suggestions.map((sug, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(sug)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="Ask Buddy about AP schemes, eligibility, or application links..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', transition: 'border 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            <button 
              onClick={() => handleSend()}
              style={{ background: '#1e3a8a', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', boxShadow: '0 3px 10px rgba(30,58,138,0.2)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1e3a8a'}
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}