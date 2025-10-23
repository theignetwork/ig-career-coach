interface TestimonialPromptProps {
  onResponse: (response: 'yes' | 'later' | 'no') => void;
}

export function TestimonialPrompt({ onResponse }: TestimonialPromptProps) {
  return (
    <div className="mb-4 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-teal/20 to-primary-teal-dark/20 border-2 border-primary-teal/40 rounded-2xl p-4 text-sm">
        {/* Icon and message */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl">🌟</div>
          <div className="flex-1">
            <p className="text-text-light font-medium mb-1">
              Loving IG Career Coach?
            </p>
            <p className="text-text-gray text-sm">
              Would you mind sharing a quick testimonial? It helps other job seekers discover how this can help them too. Takes just 2 minutes!
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onResponse('yes')}
            className="px-4 py-2 bg-primary-teal hover:bg-primary-teal-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            Yes, I'll share! 😊
          </button>
          <button
            onClick={() => onResponse('later')}
            className="px-4 py-2 bg-tile-bg hover:bg-tile-bg/80 text-text-gray hover:text-text-light rounded-lg text-sm transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={() => onResponse('no')}
            className="px-4 py-2 text-text-muted hover:text-text-gray text-sm transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
