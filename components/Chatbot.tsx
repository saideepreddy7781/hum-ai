import React, { useState, useEffect, useRef } from 'react';
import { Message, MoodAnalysisResult } from '../types';
import { getChatResponse } from '../services/geminiService';
import { NeoButton, NeoCard } from './NeoComponents';
import { Send, Bot, X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';

interface ChatbotProps {
  userName: string;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  moodContext?: MoodAnalysisResult;
  variant?: 'floating' | 'embedded';
}

export const Chatbot: React.FC<ChatbotProps> = ({ userName, isOpen, onToggle, moodContext, variant = 'floating' }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'model', text: `Hi ${userName}! I'm Hum-AI. I'm here to listen. How are you feeling right now?`, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasGreetedWithMood, setHasGreetedWithMood] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, variant]);

  // React to mood analysis updates
  useEffect(() => {
    if (moodContext && !hasGreetedWithMood && (isOpen || variant === 'embedded')) {
        const contextMsg: Message = {
            id: Date.now().toString(),
            role: 'model',
            text: `I've just reviewed your check-in. It sounds like you're feeling ${moodContext.mood.toLowerCase()} right now. I'm here if you want to talk through it.`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, contextMsg]);
        setHasGreetedWithMood(true);
    }
  }, [moodContext, isOpen, hasGreetedWithMood, variant]);

  // Reset greet flag if mood changes (new analysis)
  useEffect(() => {
      setHasGreetedWithMood(false);
  }, [moodContext]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // If there is mood context, we prepend it to the history for the model to see
      let historyForModel = messages.map(m => ({ role: m.role, text: m.text }));
      
      if (moodContext) {
          const contextString = `[System Context: The user recently completed a mood check-in. Analysis: Mood=${moodContext.mood}, Intensity=${moodContext.intensity}/10, Summary="${moodContext.summary}". Guide the conversation supportively based on this.]`;
          if (historyForModel.length > 0) {
              historyForModel[0].text = contextString + "\n\n" + historyForModel[0].text;
          } else {
              historyForModel.push({ role: 'user', text: contextString });
          }
      }

      const responseText = await getChatResponse(historyForModel, userMsg.text);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm having a bit of trouble thinking right now, but I'm here with you.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I disconnected for a second. Can you say that again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'floating' && !isOpen) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed bottom-6 right-6 z-50 bg-g-blue text-white p-4 rounded-full border-2 border-neo-black shadow-neo hover:scale-105 transition-transform animate-bounce-subtle"
      >
        <MessageCircle size={32} />
        {moodContext && !hasGreetedWithMood && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-g-red rounded-full border-2 border-white"></span>
        )}
      </button>
    );
  }

  const containerClasses = variant === 'floating' 
    ? "fixed bottom-6 right-6 z-50 w-[90vw] max-w-md flex flex-col items-end"
    : "w-full h-full flex flex-col animate-fade-in";

  const cardClasses = variant === 'floating'
    ? "flex flex-col h-[600px] w-full p-0 overflow-hidden bg-white dark:bg-gray-900 animate-slide-up"
    : "flex flex-col h-full w-full p-0 overflow-hidden bg-white dark:bg-gray-900 border-2 border-neo-black shadow-neo dark:shadow-neo-dark rounded-xl";

  return (
    <div className={containerClasses}>
      <NeoCard className={cardClasses}>
        {/* Header */}
        <div className="bg-g-yellow p-4 border-b-2 border-neo-black flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => variant === 'floating' && onToggle(false)}>
            <div className="p-1 bg-white border-2 border-black rounded-full">
                <Bot className="text-neo-black w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
                <h3 className="font-black text-neo-black text-lg">Hum-AI</h3>
                <span className="text-xs font-bold opacity-70">Always here.</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => onToggle(false)} 
                className="p-2 hover:bg-black/10 rounded-lg transition-colors flex items-center gap-1 text-neo-black font-bold text-sm"
                title="Close Chat"
            >
                {variant === 'embedded' && <span>CLOSE</span>}
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 border-2 border-neo-black shadow-sm rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-g-blue text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-700 dark:text-white text-neo-black rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[10px] opacity-60 block mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white dark:bg-gray-700 p-3 px-4 border-2 border-neo-black rounded-xl rounded-bl-none animate-pulse">
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t-2 border-neo-black bg-white dark:bg-gray-900 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border-2 border-neo-black p-3 rounded-lg outline-none focus:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-500 font-medium"
          />
          <NeoButton variant="primary" onClick={handleSend} className="p-2 px-4 rounded-lg" disabled={isLoading}>
            <Send size={20} />
          </NeoButton>
        </div>
      </NeoCard>
    </div>
  );
};