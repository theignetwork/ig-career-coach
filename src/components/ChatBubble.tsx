import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('ig-chat-cta-dismissed');
    if (!dismissed) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Stop pulsing after 5 seconds
    const timer = setTimeout(() => setIsPulsing(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBanner(false);
    localStorage.setItem('ig-chat-cta-dismissed', 'true');
  };

  return (
    <>
      {/* Inline styles for Shadow DOM animation compatibility */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      <div
        className="fixed bottom-6 right-6 z-[1000]"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          pointerEvents: 'auto',
        }}
      >
        {/* CTA Banner */}
        {showBanner && (
          <div className="absolute bottom-20 right-0 mb-2 animate-bounce-gentle">
            <div className="relative bg-gradient-to-br from-primary-teal to-primary-teal-dark text-white rounded-2xl shadow-2xl shadow-primary-teal/40 p-4 pr-10 min-w-[240px]">
              {/* Dismiss button */}
              <button
                onClick={handleDismissBanner}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Banner content */}
              <div className="space-y-1">
                <p className="text-sm font-semibold">Need Help or Advice?</p>
                <p className="text-xs opacity-90">Ask The IG Career Coach</p>
              </div>

              {/* Arrow pointing down */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gradient-to-br from-primary-teal to-primary-teal-dark transform rotate-45"></div>
            </div>
          </div>
        )}

        {/* Chat Bubble */}
        <button
          onClick={onClick}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary-teal to-primary-teal-dark shadow-lg shadow-primary-teal/40 hover:scale-110 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          style={{
            animation: isPulsing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Pulsing ring animations - using inline styles for shadow DOM compatibility */}
          {isPulsing && (
            <>
              <span
                className="absolute inset-0 rounded-full bg-primary-teal"
                style={{
                  opacity: 0.75,
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  pointerEvents: 'none',
                }}
              />
              <span
                className="absolute inset-0 rounded-full bg-primary-teal"
                style={{
                  opacity: 0.5,
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  animationDelay: '0.5s',
                  pointerEvents: 'none',
                }}
              />
              <span
                className="absolute inset-0 rounded-full bg-primary-teal"
                style={{
                  opacity: 0.6,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}

          {/* Message icon */}
          <MessageCircle className="w-8 h-8 text-white relative" style={{ zIndex: 10 }} />
        </button>
      </div>
    </>
  );
}