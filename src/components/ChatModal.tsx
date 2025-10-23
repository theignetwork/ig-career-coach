import { useState, useRef, useEffect } from 'react';
import { X, Send, Home, Maximize2, Minimize2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { WelcomeScreen } from './WelcomeScreen';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { TestimonialPrompt } from './TestimonialPrompt';

interface ChatModalProps {
  toolContext: string | null;
  onClose: () => void;
}

export function ChatModal({ toolContext, onClose }: ChatModalProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    showTestimonialPrompt,
    handleTestimonialResponse
  } = useChat(toolContext);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleBackToMenu = () => {
    if (window.confirm('Return to main menu? (Your conversation will be saved)')) {
      clearMessages();
    }
  };
  
  return (
    <div className={`fixed bg-bg-darker rounded-2xl shadow-2xl border border-border-teal z-[999] flex flex-col transition-all duration-300 ease-in-out ${
      isExpanded
        ? 'inset-8'
        : 'bottom-6 right-6 w-full max-w-[400px] h-[650px] md:w-[400px] animate-slide-up'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-teal to-primary-teal-dark p-5 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-2xl">
            🎓
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">IG Career Coach</h3>
            <p className="text-xs text-white/90">
              {messages.length === 0 ? 'Your expert guide' : `${Math.floor(messages.length / 2)} messages`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add "Back to Menu" button when messages exist */}
          {messages.length > 0 && (
            <button
              onClick={handleBackToMenu}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              title="Back to menu"
            >
              <Home className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-white" />
            ) : (
              <Maximize2 className="w-4 h-4 text-white" />
            )}
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 bg-bg-dark">
        {messages.length === 0 ? (
          <WelcomeScreen toolContext={toolContext} onTileClick={sendMessage} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} {...msg} />
            ))}

            {/* Testimonial prompt (appears after messages) */}
            {showTestimonialPrompt && (
              <TestimonialPrompt onResponse={handleTestimonialResponse} />
            )}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-5 bg-bg-darker border-t border-border-teal rounded-b-2xl">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-5 py-3 bg-bg-dark border border-border-teal rounded-full text-text-light placeholder:text-text-muted focus:border-primary-teal focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-teal to-primary-teal-dark shadow-lg shadow-primary-teal/40 flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-text-muted mt-3">Powered by The IG Network</p>
      </div>
    </div>
  );
}