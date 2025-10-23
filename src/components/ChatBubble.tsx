import { MessageCircle } from 'lucide-react';

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
}