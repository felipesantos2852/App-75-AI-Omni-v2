import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithCoach } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

interface CoachProps {
  history: ChatMessage[];
  onNewMessage: (msg: ChatMessage) => void;
  user: UserProfile;
}

export const Coach: React.FC<CoachProps> = ({ history, onNewMessage, user }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    onNewMessage(userMsg);
    setInput('');
    setLoading(true);

    // Format history for Gemini SDK
    const apiHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const context = `Peso Atual: ${user.currentWeight}kg. Meta: ${user.targetWeight}kg.`;
    
    const responseText = await chatWithCoach(userMsg.text, apiHistory, context);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };
    onNewMessage(botMsg);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-gray-900 p-4 rounded-t-2xl border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-white">Coach 75</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20" ref={scrollRef}>
        {history.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            <p>Pergunte sobre sua dieta, execução ou rotina.</p>
            <p className="mt-2">"Quanta proteína eu preciso?"</p>
          </div>
        )}
        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-yellow-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-200 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        <div className="flex gap-2 items-center bg-gray-900 p-2 rounded-xl border border-gray-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-transparent text-white px-3 py-2 focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input}
            className="p-2 bg-yellow-500 text-black rounded-lg disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};