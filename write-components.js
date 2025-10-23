const fs = require('fs');
const path = require('path');

// ChatBubble Component
const chatBubble = `import { MessageCircle } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary-teal to-primary-teal-dark shadow-lg shadow-primary-teal/40 hover:scale-110 hover:shadow-xl transition-all duration-300 z-[1000] flex items-center justify-center"
    >
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full border-2 border-primary-teal animate-ping opacity-75" />
      <div className="absolute inset-0 rounded-full border-2 border-primary-teal animate-ping opacity-75 animation-delay-1000" />
      
      {/* Message icon */}
      <MessageCircle className="w-8 h-8 text-white relative z-10" />
    </button>
  );
}`;

fs.writeFileSync(path.join('src', 'components', 'ChatBubble.tsx'), chatBubble);
console.log('✓ ChatBubble.tsx created');

// ChatModal Component  
const chatModal = `import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { WelcomeScreen } from './WelcomeScreen';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface ChatModalProps {
  toolContext: string | null;
  onClose: () => void;
}

export function ChatModal({ toolContext, onClose }: ChatModalProps) {
  const { messages, isLoading, sendMessage } = useChat(toolContext);
  const [input, setInput] = useState('');
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
  
  return (
    <div className="fixed bottom-6 right-6 w-full max-w-[400px] h-[650px] md:w-[400px] bg-bg-darker rounded-2xl shadow-2xl border border-border-teal z-[999] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-teal to-primary-teal-dark p-5 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-2xl">
            🎓
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">IG Career Coach</h3>
            <p className="text-xs text-white/90">Your expert guide</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
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
}`;

fs.writeFileSync(path.join('src', 'components', 'ChatModal.tsx'), chatModal);
console.log('✓ ChatModal.tsx created');

// App.tsx
const app = `import { useState } from 'react';
import { ChatBubble } from './components/ChatBubble';
import { ChatModal } from './components/ChatModal';
import { useToolContext } from './hooks/useToolContext';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const toolContext = useToolContext();
  
  return (
    <>
      {!isOpen && <ChatBubble onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <ChatModal
          toolContext={toolContext}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default App;`;

fs.writeFileSync(path.join('src', 'App.tsx'), app);
console.log('✓ App.tsx created');

console.log('\n✅ All components created successfully!');
