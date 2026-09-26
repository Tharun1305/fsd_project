import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare, MapPin, Package, HelpCircle, Loader2, Sparkles, Phone } from 'lucide-react';
import { useData } from '../context/DataContext';
import { openWhatsApp } from '../utils/whatsapp';
import { apiUrl } from '../config/api';

export function Chatbot({ navigate }) {
  const { products, categories, lang, t } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hello! I am the G V Clothings AI Assistant powered by Groq. Ask me anything about our fabric specifications, GSM, MOQs, wholesale prices, showroom visit in Tiruppur, or dispatch schedules!"
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const sendToAI = async (userText) => {
    setIsLoading(true);

    const userMessage = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMessage]);

    try {
      // 1. Try server endpoint first
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-6),
          language: lang
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('Fallback to direct Groq');
    } catch (err) {
      // 2. Direct client-side Groq fallback if backend is offline
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: `You are the B2B Sales AI Assistant for G V Clothings, a leading fabric & textile manufacturer in Tiruppur, Tamil Nadu. Showroom at 34, 4th Cross St, T N K Nagar, Tiruppur. WhatsApp +91 73390 22308. We supply 100% Bio-Wash Combed Cotton (180 GSM, ₹300-360/Kg), Single Jersey (160 GSM, ₹260-300/Kg), Loop Knit Fleece (280 GSM, ₹380-440/Kg), Interlock (220 GSM, ₹340-400/Kg), French Terry (240 GSM, ₹360-420/Kg), Sewing Thread (₹85-120/Cone), Cotton Yarn (₹290-340/Kg). Always answer in the exact language the user used (Hindi, Tamil, Malayalam, Kannada, English, etc.) concisely and accurately.`
              },
              ...messages.slice(-4).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              })),
              { role: 'user', content: userText }
            ],
            temperature: 0.7,
            max_tokens: 600
          })
        });

        const groqData = await groqRes.json();
        const reply = groqData.choices?.[0]?.message?.content || "Thank you for contacting G V Clothings! Please message our sales desk on WhatsApp at +91 73390 22308.";
        setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      } catch (fallbackErr) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: "We are G V Clothings, wholesale fabric manufacturers in Tiruppur. For instant live quotes or sample kits, please message our sales coordinator on WhatsApp at +91 73390 22308 or submit a Bulk Enquiry!"
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (questionText) => {
    sendToAI(questionText);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    sendToAI(text);
  };

  return (
    <>
      {/* Floating FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none border-2 border-white"
        title="AI Fabric Assistant"
      >
        {isOpen ? <X size={24} /> : <Bot size={26} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-fade-in">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm leading-none">G V Clothings AI</h4>
                  <span className="bg-blue-500/30 text-blue-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Sparkles size={10} /> Groq
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">● 24/7 Tiruppur Wholesale Desk</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm font-sans'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm text-slate-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span className="text-[11px] font-medium">Groq AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto">
            <button
              onClick={() => handleQuickQuestion("What fabrics do you manufacture and what are the wholesale price ranges?")}
              className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              🧵 Fabrics & Rates
            </button>
            <button
              onClick={() => handleQuickQuestion("What is the Minimum Order Quantity (MOQ) per fabric?")}
              className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              📦 MOQ Details
            </button>
            <button
              onClick={() => handleQuickQuestion("Where is your showroom in Tiruppur and what are the opening hours?")}
              className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              📍 Tiruppur Address
            </button>
            <button
              onClick={() => openWhatsApp(null, 500)}
              className="text-[11px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
            >
              <MessageSquare size={11} /> WhatsApp Desk
            </button>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask about GSM, fabric rates, shipping to Kerala/Bangalore..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn btn-primary btn-sm px-3.5 rounded-xl disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
